import { createContext, useContext, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react"
import { Linking, Pressable, View } from "react-native"

import { Portal, useAnchor } from "../native/overlay"
import { Div, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { Anchored, hoverProps, panelShadow, type Align, type Side } from "./popover.native"

type Ctx = { open: boolean; pressed: boolean; press: () => void; show: () => void; hide: () => void; keep: () => void; close: () => void; anchor: ReturnType<typeof useAnchor> }
const HoverCtx = createContext<Ctx | null>(null)

/**
 * shadcn's HoverCard (Base UI's PreviewCard), drawn: a pointer resting on the
 * trigger opens it after `delay` and leaving both closes it after `closeDelay`,
 * as on the web. With no pointer (a phone) a long press opens it and a press
 * outside closes it.
 */
export function HoverCard({ open, defaultOpen, onOpenChange, delay = 600, closeDelay = 300, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; delay?: number; closeDelay?: number; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  // Opened by a long press: a press outside closes it (a pointer's card has no backdrop, so leaving works).
  const [pressed, setPressed] = useState(false)
  const anchor = useAnchor()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shown = open ?? own
  const set = (next: boolean) => (setOwn(next), next || setPressed(false), onOpenChange?.(next))
  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  useEffect(() => clear, [])
  const show = () => {
    clear()
    if (!shown) timer.current = setTimeout(() => anchor.measure(() => set(true)), delay)
  }
  const hide = () => {
    clear()
    timer.current = setTimeout(() => set(false), closeDelay)
  }
  return <HoverCtx.Provider value={{ open: shown, pressed, press: () => (clear(), setPressed(true), anchor.measure(() => set(true))), show, hide, keep: clear, close: () => (clear(), set(false)), anchor }}>{children}</HoverCtx.Provider>
}

export function HoverCardTrigger({ render, href, children, className }: { render?: ReactElement; href?: string; children?: ReactNode; className?: string; delay?: number; closeDelay?: number }) {
  const card = useContext(HoverCtx)!
  const props = { onClick: href ? () => void Linking.openURL(href) : undefined }
  return (
    <View ref={card.anchor.ref} collapsable={false} {...hoverProps(card.show, card.hide)}>
      <Pressable onLongPress={card.press} delayLongPress={400} onPress={props.onClick}>
        {rendered(render, props, () => <Div className={className}>{children}</Div>, children)}
      </Pressable>
    </View>
  )
}

export function HoverCardContent({ className = "", side = "bottom", sideOffset = 4, align = "center", alignOffset = 4, children }: BoxProps & { side?: Side; sideOffset?: number; align?: Align; alignOffset?: number }) {
  const card = useContext(HoverCtx)!
  if (!card.open) return null
  return (
    <Portal>
      <HoverCtx.Provider value={card}>
        <Anchored rect={card.anchor.rect} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} onClose={card.pressed ? card.close : undefined} onHoverIn={card.keep} onHoverOut={card.hide}>
          <Div className={`w-72 rounded-3xl bg-popover p-4 text-sm text-popover-foreground border border-border ${className}`} style={panelShadow}>
            {children}
          </Div>
        </Anchored>
      </HoverCtx.Provider>
    </Portal>
  )
}
