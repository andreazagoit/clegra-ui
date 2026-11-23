import * as L from "lucide-react-native"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type ReactElement, type ReactNode } from "react"
import { Animated, ScrollView, View, type ScrollViewInstance, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native"

import { wrapIcon, type IconProps } from "../native/icons"
import { Div, type BoxProps } from "../primitives.native"
import { Button, type ButtonSize, type ButtonVariant } from "./button.native"

const ArrowDownIcon = wrapIcon("ArrowDownIcon", L.ArrowDownIcon as unknown as ComponentType<IconProps>)

type ScrollOptions = { align?: "start" | "center" | "end" | "nearest"; behavior?: "auto" | "instant" | "smooth"; scrollMargin?: number }
type Scrollable = { start: boolean; end: boolean }
type Visibility = { currentAnchorId: string | null; visibleMessageIds: string[] }

/**
 * The scroller's state outside React's renders: the scroll view, its offset
 * and sizes, where each message sits. Hooks subscribe to what they show.
 */
function createStore(options: { autoScroll: boolean; defaultScrollPosition: "start" | "end" | "last-anchor"; scrollEdgeThreshold: number; scrollPreviousItemPeek: number; scrollMargin: number }) {
  const listeners = new Set<() => void>()
  let scrollable: Scrollable = { start: false, end: false }
  let visibility: Visibility = { currentAnchorId: null, visibleMessageIds: [] }
  const store = {
    options,
    view: null as ScrollViewInstance | null,
    offset: 0,
    viewport: 0,
    content: 0,
    placed: false,
    items: new Map<string, { y: number; height: number; anchor: boolean }>(),
    anchors: [] as string[],
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    scrollable: () => scrollable,
    visibility: () => visibility,
    update() {
      const { offset, viewport, content } = store
      const t = options.scrollEdgeThreshold
      const next = { start: offset > t, end: content - viewport - offset > t }
      const top = offset + options.scrollMargin + options.scrollPreviousItemPeek
      const visible: string[] = []
      let anchor: string | null = null
      for (const [id, item] of store.items) {
        if (item.y + item.height > offset && item.y < offset + viewport) visible.push(id)
        if (item.anchor && item.y <= top + 0.5) anchor = id
      }
      const changed = next.start !== scrollable.start || next.end !== scrollable.end || anchor !== visibility.currentAnchorId || visible.join() !== visibility.visibleMessageIds.join()
      if (next.start !== scrollable.start || next.end !== scrollable.end) scrollable = next
      if (anchor !== visibility.currentAnchorId || visible.join() !== visibility.visibleMessageIds.join()) visibility = { currentAnchorId: anchor, visibleMessageIds: visible }
      if (changed) for (const listener of listeners) listener()
    },
    to(y: number, behavior?: ScrollOptions["behavior"]) {
      if (!store.view) return false
      const max = Math.max(0, store.content - store.viewport)
      store.view.scrollTo({ y: Math.min(max, Math.max(0, y)), animated: behavior === "smooth" })
      return true
    },
    scrollToEnd: (o?: ScrollOptions) => store.to(store.content, o?.behavior),
    scrollToStart: (o?: ScrollOptions) => store.to(0, o?.behavior),
    scrollToMessage(id: string, o?: ScrollOptions) {
      const item = store.items.get(id)
      if (!item) return false
      const margin = o?.scrollMargin ?? options.scrollMargin
      const align = o?.align ?? "start"
      const y = align === "end" ? item.y + item.height - store.viewport + margin : align === "center" ? item.y + item.height / 2 - store.viewport / 2 : item.y - margin
      return store.to(y, o?.behavior)
    },
  }
  return store
}

type Store = ReturnType<typeof createStore>
const StoreContext = createContext<Store | null>(null)

function useStore(name: string) {
  const store = useContext(StoreContext)
  if (!store) throw new Error(`${name} must be used within a MessageScrollerProvider.`)
  return store
}

export function MessageScrollerProvider({ children, autoScroll = false, defaultScrollPosition = "end", scrollEdgeThreshold = 8, scrollPreviousItemPeek = 64, scrollMargin = 0 }: { children?: ReactNode; autoScroll?: boolean; defaultScrollPosition?: "start" | "end" | "last-anchor"; scrollEdgeThreshold?: number; scrollPreviousItemPeek?: number; scrollMargin?: number }) {
  const [store] = useState(() => createStore({ autoScroll, defaultScrollPosition, scrollEdgeThreshold, scrollPreviousItemPeek, scrollMargin }))
  Object.assign(store.options, { autoScroll, defaultScrollPosition, scrollEdgeThreshold, scrollPreviousItemPeek, scrollMargin })
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useMessageScroller() {
  const store = useStore("useMessageScroller")
  return useMemo(() => ({ scrollToEnd: store.scrollToEnd, scrollToStart: store.scrollToStart, scrollToMessage: store.scrollToMessage }), [store])
}
export function useMessageScrollerScrollable(): Scrollable {
  const store = useStore("useMessageScrollerScrollable")
  return useSyncExternalStore(store.subscribe, store.scrollable, store.scrollable)
}
export function useMessageScrollerVisibility(): Visibility {
  const store = useStore("useMessageScrollerVisibility")
  return useSyncExternalStore(store.subscribe, store.visibility, store.visibility)
}

/** The frame: fills its parent, holds the viewport and the floating buttons. */
export function MessageScroller({ className = "", style, ...props }: BoxProps) {
  return <Div data-slot="message-scroller" {...props} className={`relative flex flex-col min-h-0 overflow-hidden ${className}`} style={[{ flex: 1, width: "100%", height: "100%" }, style]} />
}

/**
 * The scroll view. It opens at the end (or start, or the last anchor); with
 * `autoScroll` it follows new content while the reader is at the end; a new
 * anchored message (a new turn) is brought to the top, the previous one
 * peeking above it, as the web's scroller does while an answer streams.
 */
export function MessageScrollerViewport({ className = "", style, children, "aria-label": label }: BoxProps & { preserveScrollOnPrepend?: boolean }) {
  const store = useStore("MessageScrollerViewport")
  const atEnd = useRef(true)
  const place = useCallback(() => {
    if (!store.viewport || !store.content) return
    if (!store.placed) {
      store.placed = true
      const position = store.options.defaultScrollPosition
      const last = store.anchors.at(-1)
      if (position === "end") store.scrollToEnd()
      else if (position === "last-anchor" && last) store.scrollToMessage(last, { scrollMargin: store.options.scrollPreviousItemPeek })
      return
    }
    if (store.options.autoScroll && atEnd.current) store.scrollToEnd()
  }, [store])
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    store.offset = event.nativeEvent.contentOffset.y
    atEnd.current = store.content - store.viewport - store.offset <= store.options.scrollEdgeThreshold
    store.update()
  }
  return (
    <ScrollView
      ref={(view) => void (store.view = view)}
      accessibilityLabel={label}
      scrollEventThrottle={16}
      onScroll={onScroll}
      onLayout={(event: LayoutChangeEvent) => {
        store.viewport = event.nativeEvent.layout.height
        place()
        store.update()
      }}
      onContentSizeChange={(_, height) => {
        store.content = height
        place()
        store.update()
      }}
      style={[{ flex: 1, minHeight: 0 }, style]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Div className={className}>{children}</Div>
    </ScrollView>
  )
}

export function MessageScrollerContent({ className = "", style, ...props }: BoxProps & { spacerClassName?: string }) {
  return <Div data-slot="message-scroller-content" {...props} className={`flex flex-col gap-8 ${className}`} style={[{ flexGrow: 1 }, style]} />
}

let counter = 0

/** A message in the list; `messageId` lets scrollToMessage find it, `scrollAnchor` marks a turn's start. */
export function MessageScrollerItem({ className = "", messageId, scrollAnchor = false, children, ...props }: BoxProps & { messageId?: string; scrollAnchor?: boolean }) {
  const store = useStore("MessageScrollerItem")
  const [own] = useState(() => `item-${++counter}`)
  const id = messageId ?? own
  useEffect(() => {
    if (scrollAnchor && !store.anchors.includes(id)) {
      const fresh = store.placed
      store.anchors.push(id)
      // A turn added after the list opened comes to the top once it has a place.
      if (fresh) requestAnimationFrame(() => store.scrollToMessage(id, { scrollMargin: store.options.scrollPreviousItemPeek, behavior: "smooth" }))
    }
    return () => {
      store.items.delete(id)
      store.anchors = store.anchors.filter((anchor) => anchor !== id)
    }
  }, [id, scrollAnchor, store])
  return (
    <View
      onLayout={(event) => {
        store.items.set(id, { y: event.nativeEvent.layout.y, height: event.nativeEvent.layout.height, anchor: scrollAnchor })
        store.update()
      }}
      style={{ minWidth: 0, flexShrink: 0 }}
    >
      <Div data-slot="message-scroller-item" {...props} className={className}>
        {children}
      </Div>
    </View>
  )
}

/** The round button that appears when there is more to scroll that way, and goes there. */
export function MessageScrollerButton({ direction = "end", className = "", children, render, variant = "secondary", size = "icon-sm", behavior = "smooth", onClick }: { direction?: "start" | "end"; className?: string; children?: ReactNode; render?: ReactElement; variant?: ButtonVariant; size?: ButtonSize; behavior?: ScrollOptions["behavior"]; onClick?: (event: unknown) => void }) {
  const store = useStore("MessageScrollerButton")
  const scrollable = useMessageScrollerScrollable()
  const active = scrollable[direction]
  const shown = useRef(new Animated.Value(active ? 1 : 0)).current
  useEffect(() => {
    Animated.timing(shown, { toValue: active ? 1 : 0, duration: active ? 200 : 400, useNativeDriver: false }).start()
  }, [active, shown])
  const press = (event: unknown) => {
    if (!active) return
    onClick?.(event)
    if (direction === "start") store.scrollToStart({ behavior })
    else store.scrollToEnd({ behavior })
  }
  const label = direction === "end" ? "Scroll to end" : "Scroll to start"
  const translateY = shown.interpolate({ inputRange: [0, 1], outputRange: [direction === "end" ? 32 : -32, 0] })
  const scale = shown.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] })
  return (
    <Animated.View pointerEvents={active ? "auto" : "none"} style={{ position: "absolute", left: 0, right: 0, alignItems: "center", [direction === "end" ? "bottom" : "top"]: 16, opacity: shown, transform: [{ translateY }, { scale }] }}>
      {render ? (
        render
      ) : (
        <Button data-slot="message-scroller-button" variant={variant} size={size} aria-label={children ? undefined : label} aria-hidden={!active} className={`border-border bg-background text-foreground ${className}`} onClick={press}>
          {children ?? (
            <View style={{ transform: [{ rotate: direction === "start" ? "180deg" : "0deg" }] }}>
              <ArrowDownIcon />
            </View>
          )}
        </Button>
      )}
    </Animated.View>
  )
}
