import { createContext, useContext, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react"
import { Animated, PanResponder, Pressable, StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native"

import { Portal } from "../native/overlay"
import { Div, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"

type Direction = "down" | "up" | "left" | "right"
type Ctx = { open: boolean; setOpen: (open: boolean) => void; modal: boolean | "trap-focus"; showSwipeHandle: boolean; swipeDirection: Direction }
const DrawerCtx = createContext<Ctx>({ open: false, setOpen: () => {}, modal: true, showSwipeHandle: false, swipeDirection: "down" })

/**
 * shadcn's Drawer (Base UI's), drawn: a panel from the window's edge in
 * `swipeDirection`, 8 px in from it, that a swipe toward that edge (or a press
 * outside, when modal) closes. Snap points are not drawn.
 */
export function Drawer({ open, defaultOpen, onOpenChange, modal = true, showSwipeHandle = false, swipeDirection = "down", children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; modal?: boolean | "trap-focus"; showSwipeHandle?: boolean; swipeDirection?: Direction; snapPoints?: unknown[]; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  return <DrawerCtx.Provider value={{ open: open ?? own, setOpen: (next) => (setOwn(next), onOpenChange?.(next)), modal, showSwipeHandle, swipeDirection }}>{children}</DrawerCtx.Provider>
}

export function DrawerTrigger({ render, children }: { render?: ReactElement; children?: ReactNode; className?: string }) {
  const { setOpen } = useContext(DrawerCtx)
  return rendered(render, { onClick: () => setOpen(true) }, () => <Pressable onPress={() => setOpen(true)}>{children}</Pressable>, children)
}

export function DrawerClose({ render, children }: { render?: ReactElement; children?: ReactNode; className?: string }) {
  const { setOpen } = useContext(DrawerCtx)
  return rendered(render, { onClick: () => setOpen(false) }, () => <Pressable onPress={() => setOpen(false)}>{children}</Pressable>, children)
}

export const DrawerPortal = ({ children }: { children?: ReactNode }) => <>{children}</>
export const DrawerOverlay = () => null

/** The grab bar: 100 × 6, muted, on the edge away from `swipeDirection`. */
export function DrawerSwipeHandle() {
  const { swipeDirection } = useContext(DrawerCtx)
  const colors = useColors()
  const x = swipeDirection === "left" || swipeDirection === "right"
  return (
    <View aria-hidden style={[x ? { width: 12, height: "100%", alignItems: "center", justifyContent: "center" } : { height: 12, width: "100%", alignItems: "center", justifyContent: "flex-end" }]}>
      <View style={{ width: x ? 6 : 100, height: x ? 100 : 6, borderRadius: 3, backgroundColor: colors.muted }} />
    </View>
  )
}

export function DrawerContent({ className = "", children }: BoxProps) {
  const drawer = useContext(DrawerCtx)
  const { width, height } = useWindowDimensions()
  const colors = useColors()
  const drag = useRef(new Animated.Value(0)).current
  const dir = drawer.swipeDirection
  const x = dir === "left" || dir === "right"
  // Toward the edge is positive.
  const sign = dir === "down" || dir === "right" ? 1 : -1
  const pan = useMemo(
    () =>
      PanResponder.create({
        // The panel takes a press its controls don't (they are asked first), so a drag anywhere on it follows.
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(x ? g.dx : g.dy) > 6 && Math.abs(x ? g.dx : g.dy) > Math.abs(x ? g.dy : g.dx),
        onPanResponderMove: (_, g) => drag.setValue(Math.max(0, sign * (x ? g.dx : g.dy))),
        onPanResponderRelease: (_, g) => {
          const moved = sign * (x ? g.dx : g.dy)
          const speed = sign * (x ? g.vx : g.vy)
          if (moved > 80 || speed > 0.5) {
            drag.setValue(0)
            drawer.setOpen(false)
          } else Animated.spring(drag, { toValue: 0, useNativeDriver: false }).start()
        },
      }),
    [drag, drawer, sign, x],
  )
  if (!drawer.open) return null
  const translate = Animated.multiply(drag, sign)
  const edge: ViewStyle =
    dir === "down" ? { left: 8, right: 8, bottom: 8, maxHeight: height - 96 } : dir === "up" ? { left: 8, right: 8, top: 8, maxHeight: height - 96 } : { top: 8, bottom: 8, [dir === "left" ? "left" : "right"]: 8, width: width >= 640 ? 384 : (width - 16) * 0.75 }
  return (
    <Portal>
      <DrawerCtx.Provider value={drawer}>
        {drawer.modal === true ? <Pressable accessibilityLabel="Chiudi" onPress={() => drawer.setOpen(false)} style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.3)" }]} /> : null}
        <Animated.View {...pan.panHandlers} role="dialog" style={[styles.panel, edge, ({ userSelect: "none" } as ViewStyle), { flexDirection: x ? "row" : "column", backgroundColor: colors.popover, borderColor: colors.popover, transform: x ? [{ translateX: translate }] : [{ translateY: translate }] }]}>
          {drawer.showSwipeHandle && dir !== "up" && dir !== "left" ? <DrawerSwipeHandle /> : null}
          <Div className={`flex flex-col flex-1 min-h-0 overflow-hidden text-sm text-popover-foreground ${className}`} style={{ borderRadius: 36 }}>
            {children}
          </Div>
          {drawer.showSwipeHandle && (dir === "up" || dir === "left") ? <DrawerSwipeHandle /> : null}
        </Animated.View>
      </DrawerCtx.Provider>
    </Portal>
  )
}

/** Centred in a bottom or top drawer (the web's group selector outweighs its md:text-left). */
export function DrawerHeader({ className = "", ...props }: BoxProps) {
  const { swipeDirection } = useContext(DrawerCtx)
  const { width } = useWindowDimensions()
  const centred = swipeDirection === "down" || swipeDirection === "up"
  return <Div {...props} className={`flex flex-col shrink-0 ${width >= 768 ? "gap-1.5" : "gap-0.5"} p-4 pb-0 ${centred ? "items-center text-center" : "text-left"} ${className}`} />
}

export const DrawerFooter = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`mt-auto flex flex-col shrink-0 gap-2 p-4 pt-0 ${className}`} />
export const DrawerTitle = ({ className = "", ...props }: BoxProps) => <Div {...props} role="heading" className={`text-base font-medium text-foreground ${className}`} />
export const DrawerDescription = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`text-sm text-muted-foreground ${className}`} />

const styles = StyleSheet.create({
  panel: { position: "absolute", borderRadius: 36, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 20 } },
})

/** For the iOS file: the drawn state. */
export { DrawerCtx }
