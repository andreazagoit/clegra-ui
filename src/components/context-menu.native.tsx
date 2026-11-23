import { createContext, useContext, useRef, useState, type ReactElement, type ReactNode } from "react"
import { Platform, Pressable, ScrollView, View, type GestureResponderEvent, type ViewInstance } from "react-native"

import { CheckIcon, ChevronRightIcon } from "../native/icons"
import { Portal, type Rect } from "../native/overlay"
import { Div, Span, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { Anchored, panelShadow, type Align, type Side } from "./popover.native"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; at: Rect | null; openAt: (at: Rect) => void }
const MenuCtx = createContext<Ctx | null>(null)
const RadioCtx = createContext<{ value: unknown; set: (value: unknown) => void } | null>(null)

/**
 * shadcn's ContextMenu, drawn: a long press (or, with a pointer, the secondary
 * click) opens it where the press was, as the web opens it at the cursor.
 */
export function ContextMenu({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(false)
  const [at, setAt] = useState<Rect | null>(null)
  const setOpen = (next: boolean) => (setOwn(next), onOpenChange?.(next))
  return <MenuCtx.Provider value={{ open: open ?? own, setOpen, at, openAt: (rect) => (setAt(rect), setOpen(true)) }}>{children}</MenuCtx.Provider>
}

export function ContextMenuTrigger({ render, className = "", children, style }: BoxProps & { render?: ReactElement }) {
  const menu = useContext(MenuCtx)!
  const box = useRef<ViewInstance>(null)
  const openFrom = (event: { nativeEvent: { pageX?: number; pageY?: number } }) => {
    const { pageX = 0, pageY = 0 } = event.nativeEvent
    menu.openAt({ x: pageX, y: pageY, width: 0, height: 0 })
  }
  // react-native-web passes onContextMenu to the element; elsewhere it is the long press.
  const secondary = Platform.OS === "web" ? { onContextMenu: (event: { preventDefault: () => void; nativeEvent: { pageX: number; pageY: number } }) => (event.preventDefault(), openFrom(event)) } : {}
  const content = rendered(render, {}, () => <Div className={className}>{children}</Div>, children)
  return (
    <Pressable ref={box} {...(secondary as object)} onLongPress={(event: GestureResponderEvent) => openFrom(event)} delayLongPress={500} style={style}>
      {content}
    </Pressable>
  )
}

export function ContextMenuContent({ className = "", align = "start", alignOffset = 4, side = "right", sideOffset = 0, children }: BoxProps & { align?: Align; alignOffset?: number; side?: Side; sideOffset?: number }) {
  const menu = useContext(MenuCtx)!
  if (!menu.open) return null
  return (
    <Portal>
      <MenuCtx.Provider value={menu}>
        <Anchored rect={menu.at} side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} onClose={() => menu.setOpen(false)}>
          <MenuPanel className={className}>{children}</MenuPanel>
        </Anchored>
      </MenuCtx.Provider>
    </Portal>
  )
}

function MenuPanel({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <Div role="menu" className={`min-w-48 rounded-3xl bg-popover p-1.5 text-popover-foreground border border-border ${className}`} style={[panelShadow, { maxHeight: 400 }]}>
      <ScrollView>{children}</ScrollView>
    </Div>
  )
}

function Row({ onPress, disabled, inset, right, role, checked, variant, className = "", closeOnClick = true, children }: { onPress?: () => void; disabled?: boolean; inset?: boolean; right?: boolean; role: string; checked?: boolean; variant?: "default" | "destructive"; className?: string; closeOnClick?: boolean; children?: ReactNode }) {
  const menu = useContext(MenuCtx)!
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const destructive = variant === "destructive"
  return (
    <Pressable
      role={role as "menuitem"}
      aria-checked={checked}
      disabled={disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={() => {
        onPress?.()
        if (closeOnClick) menu.setOpen(false)
      }}
      style={{ borderRadius: 25.2, opacity: disabled ? 0.5 : 1, backgroundColor: hover ? (destructive ? colors.destructiveSoft : colors.accent) : "transparent" }}
    >
      <Div className={`flex flex-row items-center gap-2.5 py-2 text-sm font-medium ${inset ? "pl-9.5" : "pl-3"} ${right ? "pr-8" : "pr-3"} ${destructive ? "text-destructive" : hover ? "text-accent-foreground" : ""} ${className}`} style={inset ? { paddingLeft: 38 } : undefined}>
        {children}
      </Div>
    </Pressable>
  )
}

export function ContextMenuItem({ onClick, disabled, inset, variant = "default", className, closeOnClick, children }: BoxProps & { disabled?: boolean; inset?: boolean; variant?: "default" | "destructive"; closeOnClick?: boolean }) {
  return (
    <Row role="menuitem" onPress={onClick as (() => void) | undefined} disabled={disabled} inset={inset} variant={variant} className={className} closeOnClick={closeOnClick}>
      {children}
    </Row>
  )
}

const Mark = ({ on }: { on: boolean }) => <View style={{ position: "absolute", right: 8, top: 0, bottom: 0, justifyContent: "center" }}>{on ? <CheckIcon size={16} /> : null}</View>

export function ContextMenuCheckboxItem({ checked, onCheckedChange, disabled, inset, className, children }: BoxProps & { checked?: boolean; onCheckedChange?: (checked: boolean) => void; disabled?: boolean; inset?: boolean }) {
  return (
    <View>
      <Row role="menuitemcheckbox" checked={Boolean(checked)} right onPress={() => onCheckedChange?.(!checked)} disabled={disabled} inset={inset} className={className} closeOnClick={false}>
        {children}
      </Row>
      <Mark on={Boolean(checked)} />
    </View>
  )
}

export function ContextMenuRadioGroup({ value, onValueChange, children }: { value?: unknown; onValueChange?: (value: unknown) => void; children?: ReactNode }) {
  return <RadioCtx.Provider value={{ value, set: (next) => onValueChange?.(next) }}>{children}</RadioCtx.Provider>
}

export function ContextMenuRadioItem({ value, disabled, inset, className, children }: BoxProps & { value: unknown; disabled?: boolean; inset?: boolean }) {
  const radio = useContext(RadioCtx)
  const on = radio?.value === value
  return (
    <View>
      <Row role="menuitemradio" checked={on} right onPress={() => radio?.set(value)} disabled={disabled} inset={inset} className={className} closeOnClick={false}>
        {children}
      </Row>
      <Mark on={on} />
    </View>
  )
}

export const ContextMenuLabel = ({ className = "", inset, ...props }: BoxProps & { inset?: boolean }) => <Div {...props} className={`px-3 py-2.5 text-xs text-muted-foreground ${className}`} style={inset ? { paddingLeft: 38 } : undefined} />
export const ContextMenuSeparator = ({ className = "" }: BoxProps) => <Div className={`-mx-1.5 my-1.5 h-px bg-border/50 ${className}`} />
export const ContextMenuShortcut = ({ className = "", ...props }: BoxProps) => <Span {...props} className={`ml-auto text-xs text-muted-foreground ${className}`} style={{ letterSpacing: 1.2 }} />
export const ContextMenuGroup = ({ children }: { children?: ReactNode }) => <>{children}</>
export const ContextMenuPortal = ({ children }: { children?: ReactNode }) => <>{children}</>

const SubCtx = createContext<{ open: boolean; toggle: () => void }>({ open: false, toggle: () => {} })

/** A submenu opens in place under its trigger (a phone has no room beside the menu). */
export function ContextMenuSub({ children }: { children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  return <SubCtx.Provider value={{ open, toggle: () => setOpen(!open) }}>{children}</SubCtx.Provider>
}

export function ContextMenuSubTrigger({ inset, className, children }: BoxProps & { inset?: boolean }) {
  const sub = useContext(SubCtx)
  return (
    <Row role="menuitem" onPress={sub.toggle} inset={inset} className={className} closeOnClick={false}>
      <Span className="flex-1">{children}</Span>
      <View style={{ transform: [{ rotate: sub.open ? "90deg" : "0deg" }] }}>
        <ChevronRightIcon size={16} />
      </View>
    </Row>
  )
}

export function ContextMenuSubContent({ children }: BoxProps & { side?: Side; align?: Align; sideOffset?: number; alignOffset?: number }) {
  const sub = useContext(SubCtx)
  if (!sub.open) return null
  return <View style={{ paddingLeft: 12 }}>{children}</View>
}

/** For the iOS file: the drawn state. */
export { MenuCtx as ContextMenuCtx, RadioCtx as ContextMenuRadioCtx }
