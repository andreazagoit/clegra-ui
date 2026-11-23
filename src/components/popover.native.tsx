import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native"

import { Portal, useAnchor, type Rect } from "../native/overlay"
import { Div, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"

export type Side = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"
export type Align = "start" | "center" | "end"

/**
 * A panel beside its anchor, placed as Base UI's Positioner places it: on
 * `side`, aligned by `align`, `sideOffset` away; it flips to the other side
 * when it doesn't fit, and stays inside the window. Measured once drawn.
 * A press outside calls `onClose` (no backdrop when `onClose` is missing).
 */
export function Anchored({ rect, side = "bottom", align = "center", sideOffset = 4, alignOffset = 0, onClose, children, style, onHoverIn, onHoverOut }: { rect: Rect | null; side?: Side; align?: Align; sideOffset?: number; alignOffset?: number; onClose?: () => void; children: ReactNode; style?: ViewStyle; onHoverIn?: () => void; onHoverOut?: () => void }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const screen = useWindowDimensions()
  if (!rect) return null
  const s: Side = side === "inline-start" ? "left" : side === "inline-end" ? "right" : side
  const w = size?.w ?? 0
  const h = size?.h ?? 0
  let left = 0
  let top = 0
  if (s === "bottom" || s === "top") {
    const below = rect.y + rect.height + sideOffset
    const above = rect.y - h - sideOffset
    top = s === "bottom" ? (below + h > screen.height - 8 && above >= 8 ? above : below) : above < 8 && below + h <= screen.height - 8 ? below : above
    left = align === "start" ? rect.x + alignOffset : align === "end" ? rect.x + rect.width - w - alignOffset : rect.x + rect.width / 2 - w / 2
  } else {
    const after = rect.x + rect.width + sideOffset
    const before = rect.x - w - sideOffset
    left = s === "right" ? (after + w > screen.width - 8 && before >= 8 ? before : after) : before < 8 && after + w <= screen.width - 8 ? after : before
    top = align === "start" ? rect.y + alignOffset : align === "end" ? rect.y + rect.height - h - alignOffset : rect.y + rect.height / 2 - h / 2
  }
  left = Math.max(8, Math.min(left, screen.width - w - 8))
  top = Math.max(8, Math.min(top, screen.height - h - 8))
  return (
    <>
      {onClose && <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Chiudi" />}
      <Pressable
        accessibilityRole="none"
        onPress={() => {}}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout
          if (!size || Math.abs(size.w - width) > 0.5 || Math.abs(size.h - height) > 0.5) setSize({ w: width, h: height })
        }}
        style={[{ position: "absolute", left, top, opacity: size ? 1 : 0 }, style]}
      >
        <View {...hoverProps(onHoverIn, onHoverOut)}>{children}</View>
      </Pressable>
    </>
  )
}

/**
 * A pointer entering and leaving a view and its children: pointer events (the
 * web, iPad), mouse events. Not Pressable's hover, which a
 * hovered Pressable inside ends.
 */
export function hoverProps(enter?: () => void, leave?: () => void) {
  if (!enter && !leave) return {}
  return { onPointerEnter: enter, onPointerLeave: leave, onMouseEnter: enter, onMouseLeave: leave } as object
}

/** The look of the web's floating panels: popover colour, shadow-lg, a hairline ring. */
export const panelShadow: ViewStyle = { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }

type Ctx = { open: boolean; setOpen: (open: boolean) => void; anchor: ReturnType<typeof useAnchor> }
const PopoverCtx = createContext<Ctx | null>(null)

/** shadcn's Popover, drawn. Open and close like Base UI's: the trigger toggles, a press outside closes. */
export function Popover({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; modal?: boolean; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  const anchor = useAnchor()
  return <PopoverCtx.Provider value={{ open: open ?? own, setOpen: (next) => (setOwn(next), onOpenChange?.(next)), anchor }}>{children}</PopoverCtx.Provider>
}

export function PopoverTrigger({ render, children, className }: { render?: ReactElement; children?: ReactNode; className?: string; "aria-label"?: string }) {
  const popover = useContext(PopoverCtx)!
  const press = () => (popover.open ? popover.setOpen(false) : popover.anchor.measure(() => popover.setOpen(true)))
  return (
    <View ref={popover.anchor.ref} collapsable={false}>
      {rendered(render, { onClick: press, "aria-haspopup": "dialog", "aria-expanded": popover.open }, () => <Pressable onPress={press}><Div className={className}>{children}</Div></Pressable>, children)}
    </View>
  )
}

export function PopoverContent({ className = "", align = "center", alignOffset = 0, side = "bottom", sideOffset = 4, children }: BoxProps & { align?: Align; alignOffset?: number; side?: Side; sideOffset?: number }) {
  const popover = useContext(PopoverCtx)!
  if (!popover.open) return null
  return (
    <Portal>
      <PopoverCtx.Provider value={popover}>
        <Anchored rect={popover.anchor.rect} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} onClose={() => popover.setOpen(false)}>
          <Div role="dialog" className={`flex flex-col w-72 gap-4 rounded-3xl bg-popover p-4 text-sm text-popover-foreground border border-border ${className}`} style={panelShadow}>
            {children}
          </Div>
        </Anchored>
      </PopoverCtx.Provider>
    </Portal>
  )
}

export const PopoverHeader = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-col gap-1 text-sm ${className}`} />
export const PopoverTitle = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`text-base font-medium ${className}`} />
export const PopoverDescription = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`text-sm text-muted-foreground ${className}`} />

/** For the iOS file: the drawn context. */
export { PopoverCtx }
