import { createContext, useContext, useId, useMemo, useState, type ReactElement } from "react"
import { Linking, Pressable, View } from "react-native"

import { IconContext } from "../native/icon-context"
import { ChevronDownIcon } from "../native/icons"
import { Floating, Portal, useAnchor, type Rect } from "../native/overlay"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Div, Span, type BoxProps } from "../primitives.native"

type Value = unknown
type RootCtx = { value: Value; set: (value: Value) => void; align: "start" | "center" | "end" }
const Root = createContext<RootCtx>({ value: null, set: () => {}, align: "start" })
type ItemCtx = { value: Value; anchor: ReturnType<typeof useAnchor> } | null
const Item = createContext<ItemCtx>(null)
const InContent = createContext(false)

/** The web's trigger classes (cva), for a link drawn as a trigger. */
export const navigationMenuTriggerStyle = (_?: unknown) => "flex flex-row h-9 items-center justify-center rounded-3xl px-4.5 py-2.5 text-sm font-medium"

/** Base UI's NavigationMenu drawn: a row of triggers and links; a trigger opens its content in a panel under it. */
export function NavigationMenu({ value, defaultValue, onValueChange, align = "start", className = "", children, ...props }: Omit<BoxProps, "defaultValue"> & { value?: Value; defaultValue?: Value; onValueChange?: (value: Value) => void; align?: "start" | "center" | "end" }) {
  const [own, setOwn] = useState<Value>(defaultValue ?? null)
  const shown = value === undefined ? own : value
  const ctx = useMemo(() => ({ value: shown, set: (next: Value) => (setOwn(next), onValueChange?.(next)), align }), [shown, onValueChange, align])
  return (
    <Root.Provider value={ctx}>
      <Div {...props} className={`relative flex flex-row flex-1 items-center justify-center self-start ${className}`}>
        {children}
      </Div>
    </Root.Provider>
  )
}

export function NavigationMenuList({ className = "", ...props }: BoxProps) {
  return <Div {...props} className={`flex flex-row flex-1 items-center justify-center gap-0 ${className}`} />
}

export function NavigationMenuItem({ value, className = "", children, ...props }: BoxProps & { value?: Value }) {
  const own = useId()
  const anchor = useAnchor()
  const ctx = useMemo(() => ({ value: value ?? own, anchor }), [value, own, anchor])
  return (
    <Item.Provider value={ctx}>
      <Div {...props} className={`relative ${className}`}>
        {children}
      </Div>
    </Item.Provider>
  )
}

export function NavigationMenuTrigger({ className = "", disabled, children }: BoxProps & { disabled?: boolean }) {
  const root = useContext(Root)
  const item = useContext(Item)!
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const open = root.value === item.value
  const parsed = useTw(`${navigationMenuTriggerStyle()} ${hover ? "bg-muted" : open ? "bg-muted/50" : ""} ${className}`)
  const press = () => (open ? root.set(null) : item.anchor.measure(() => root.set(item.value)))
  return (
    <View ref={item.anchor.ref} collapsable={false}>
      <Pressable role="button" aria-expanded={open} aria-haspopup="menu" disabled={disabled} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} onPress={press} style={[parsed.view, { opacity: disabled ? 0.5 : 1 }]}>
        <Span className="text-sm font-medium">{children}</Span>
        <View style={{ marginLeft: 4, top: 1, transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <ChevronDownIcon size={12} color={colors.foreground} />
        </View>
      </Pressable>
    </View>
  )
}

export function NavigationMenuContent({ className = "", children }: BoxProps) {
  const root = useContext(Root)
  const item = useContext(Item)!
  const colors = useColors()
  if (root.value !== item.value || !item.anchor.rect) return null
  return (
    <Portal>
      <Root.Provider value={root}>
        <InContent.Provider value={true}>
          <Floating rect={item.anchor.rect as Rect} onClose={() => root.set(null)} align={root.align} height={320} style={{ marginTop: 4 }}>
            <View role="menu" style={{ alignSelf: "flex-start", borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}>
              <Div className={`p-2.5 pr-3 ${className}`}>{children}</Div>
            </View>
          </Floating>
        </InContent.Provider>
      </Root.Provider>
    </Portal>
  )
}

/** The classes of a string that style text, for the text inside a pressable. */
const textClasses = (className: string) => className.split(/\s+/).filter((c) => /^(text-|font-|underline|tracking-|leading-|uppercase)/.test(c)).join(" ")

/** A link: `href` opens with Linking unless onClick prevents it; in a content panel it closes the panel. */
export function NavigationMenuLink({ className = "", href, active, onClick, closeOnClick = true, render, children, ...props }: BoxProps & { href?: string; active?: boolean; closeOnClick?: boolean; render?: ReactElement }) {
  const root = useContext(Root)
  const inContent = useContext(InContent)
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const parsed = useTw(`flex flex-row items-center gap-1.5 p-3 ${inContent ? "rounded-2xl" : "rounded-3xl"} ${hover ? "bg-muted" : active ? "bg-muted/50" : ""} ${className}`)
  const press = () => {
    let prevented = false
    ;(onClick as ((event: { preventDefault: () => void }) => void) | undefined)?.({ preventDefault: () => void (prevented = true) })
    if (!prevented && href && !href.startsWith("#")) void Linking.openURL(href)
    if (closeOnClick) root.set(null)
  }
  const content = (
    <IconContext.Provider value={{ size: 16, color: colors.foreground }}>
      <Div className={`flex flex-row flex-1 items-center gap-1.5 text-sm ${textClasses(className)}`}>{children}</Div>
    </IconContext.Provider>
  )
  return rendered(
    render,
    { ...props, className, onClick: press },
    () => (
      <Pressable {...(props as object)} role="link" aria-current={active ? "page" : undefined} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} onPress={press} style={parsed.view}>
        {content}
      </Pressable>
    ),
    children,
  )
}

/** The web's arrow under the open trigger and its positioner: the drawn panel has neither. */
export const NavigationMenuIndicator = (_: BoxProps) => null
export const NavigationMenuPositioner = (_: BoxProps) => null
