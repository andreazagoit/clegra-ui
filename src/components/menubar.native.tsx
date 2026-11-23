import { createContext, Fragment, useContext, useEffect, useId, useMemo, useRef, useState, type ReactElement, type ReactNode, type RefObject } from "react"
import { Pressable, ScrollView, View, type ViewInstance } from "react-native"

import { IconContext } from "../native/icon-context"
import { CheckIcon, ChevronRightIcon } from "../native/icons"
import { Floating, Portal, type Rect } from "../native/overlay"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Div, Span, type BoxProps } from "../primitives.native"

/**
 * The bar: which menu is open and where each trigger is. While a menu is open,
 * moving over another trigger opens that one instead, as on the web.
 */
type BarCtx = { openId: string | null; setOpenId: (id: string | null) => void; rects: Record<string, Rect>; register: (id: string, view: () => ViewInstance | null) => () => void; openMenu: (id: string) => void }
const Bar = createContext<BarCtx | null>(null)
type MenuCtx = { id: string; open: boolean; setOpen: (open: boolean) => void; ref: RefObject<ViewInstance | null> }
const Menu = createContext<MenuCtx | null>(null)
const Radio = createContext<{ value: unknown; set: (value: unknown) => void } | null>(null)
const Sub = createContext<{ open: boolean; toggle: () => void } | null>(null)

export function Menubar({ className = "", children, ...props }: BoxProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [rects, setRects] = useState<Record<string, Rect>>({})
  const views = useRef(new Map<string, () => ViewInstance | null>()).current
  const bar = useMemo<BarCtx>(
    () => ({
      openId,
      setOpenId,
      rects,
      register: (id, view) => (views.set(id, view), () => void views.delete(id)),
      // Measure every trigger, then open: the open menu needs its own place and the others' to switch on hover.
      openMenu: (id) => {
        let left = views.size
        const next: Record<string, Rect> = {}
        for (const [key, view] of views) {
          const node = view()
          const done = () => (--left === 0 ? (setRects(next), setOpenId(id)) : undefined)
          if (node) node.measureInWindow((x, y, width, height) => ((next[key] = { x, y, width, height }), done()))
          else done()
        }
      },
    }),
    [openId, rects, views],
  )
  return (
    <Bar.Provider value={bar}>
      <Div role="menubar" {...props} className={`flex flex-row h-9 items-center rounded-3xl border p-1 ${className}`}>
        {children}
      </Div>
    </Bar.Provider>
  )
}

export function MenubarMenu({ open, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const bar = useContext(Bar)!
  const id = useId()
  const ref = useRef<ViewInstance>(null)
  const { register } = bar
  useEffect(() => register(id, () => ref.current), [register, id])
  const shown = open ?? bar.openId === id
  const setOpen = (next: boolean) => {
    if (next) bar.openMenu(id)
    else if (bar.openId === id) bar.setOpenId(null)
    onOpenChange?.(next)
  }
  return <Menu.Provider value={{ id, open: shown, setOpen, ref }}>{children}</Menu.Provider>
}

export function MenubarTrigger({ className = "", disabled, render, children }: BoxProps & { disabled?: boolean; render?: ReactElement }) {
  const menu = useContext(Menu)!
  const [hover, setHover] = useState(false)
  const parsed = useTw(`flex flex-row items-center rounded-2xl px-2 py-0.75 text-sm font-medium ${hover || menu.open ? "bg-muted" : ""} ${className}`)
  const press = () => menu.setOpen(!menu.open)
  return (
    <View ref={menu.ref} collapsable={false}>
      {rendered(
        render,
        { onClick: press, "aria-haspopup": "menu", "aria-expanded": menu.open },
        () => (
          <Pressable role="menuitem" aria-haspopup="menu" aria-expanded={menu.open} disabled={disabled} onPress={press} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={[parsed.view, { opacity: disabled ? 0.5 : 1 }]}>
            <Span className="text-sm font-medium">{children}</Span>
          </Pressable>
        ),
        children,
      )}
    </View>
  )
}

export function MenubarContent({ align = "start", className = "", children }: BoxProps & { align?: "start" | "center" | "end"; alignOffset?: number; sideOffset?: number; side?: string }) {
  const bar = useContext(Bar)!
  const menu = useContext(Menu)!
  const colors = useColors()
  const rect = bar.rects[menu.id]
  if (!menu.open || !rect) return null
  const width = /(?:^|\s)w-(\d+)/.exec(className)?.[1]
  return (
    <Portal>
      <Bar.Provider value={bar}>
        <Menu.Provider value={menu}>
          <Floating rect={rect} onClose={() => menu.setOpen(false)} align={align} width={width ? Number(width) * 4 : undefined} height={320} style={{ marginTop: 4, marginLeft: align === "start" ? -4 : 0 }}>
            <View role="menu" style={{ minWidth: 192, padding: 6, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } , maxHeight: 400 }}>
              <ScrollView>{children}</ScrollView>
            </View>
          </Floating>
          {/* Over the other triggers, above the backdrop: moving onto one opens its menu. */}
          {Object.entries(bar.rects)
            .filter(([id]) => id !== menu.id)
            .map(([id, r]) => (
              <Pressable key={id} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onHoverIn={() => bar.setOpenId(id)} onPress={() => bar.setOpenId(id)} style={{ position: "absolute", left: r.x, top: r.y, width: r.width, height: r.height }} />
            ))}
        </Menu.Provider>
      </Bar.Provider>
    </Portal>
  )
}

type ItemProps = BoxProps & { inset?: boolean; variant?: "default" | "destructive"; disabled?: boolean; closeOnClick?: boolean; role?: string; checked?: boolean; indicator?: ReactNode }

export function MenubarItem({ inset, variant = "default", disabled, closeOnClick = true, onClick, className = "", role = "menuitem", checked, indicator, children }: ItemProps) {
  const menu = useContext(Menu)
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const destructive = variant === "destructive"
  const color = destructive ? colors.destructive : hover ? colors.accentForeground : colors.foreground
  return (
    <Pressable
      role={role as never}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={() => {
        ;(onClick as (() => void) | undefined)?.()
        if (closeOnClick) menu?.setOpen(false)
      }}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingRight: 12, paddingLeft: inset || indicator !== undefined ? 38 : 12, borderRadius: 16, opacity: disabled ? 0.5 : 1, backgroundColor: hover ? (destructive ? `${colors.destructive}1a` : colors.accent) : "transparent" }}
    >
      {indicator !== undefined && <View style={{ position: "absolute", left: 12, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>{indicator}</View>}
      <IconContext.Provider value={{ size: 16, color }}>
        <Div className={`flex flex-row flex-1 items-center gap-2.5 text-sm font-medium ${className}`}>
          <TextColor color={color}>{children}</TextColor>
        </Div>
      </IconContext.Provider>
    </Pressable>
  )
}

/** Plain text of an item in the item's colour. */
function TextColor({ color, children }: { color: string; children?: ReactNode }) {
  return <>{(Array.isArray(children) ? children : [children]).map((child, index) => (typeof child === "string" || typeof child === "number" ? <Span key={index} className="text-sm font-medium" style={{ color }}>{child}</Span> : <Fragment key={index}>{child as ReactNode}</Fragment>))}</>
}

export function MenubarCheckboxItem({ checked, defaultChecked, onCheckedChange, inset: _inset, ...props }: ItemProps & { defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  const [own, setOwn] = useState(Boolean(defaultChecked))
  const shown = checked ?? own
  return <MenubarItem {...props} role="menuitemcheckbox" checked={shown} closeOnClick={false} onClick={(() => (setOwn(!shown), onCheckedChange?.(!shown))) as never} indicator={shown ? <CheckIcon size={16} /> : null} />
}

export function MenubarRadioGroup({ value, defaultValue, onValueChange, children }: { value?: unknown; defaultValue?: unknown; onValueChange?: (value: unknown) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(defaultValue)
  return (
    <Radio.Provider value={{ value: value === undefined ? own : value, set: (next) => (setOwn(next), onValueChange?.(next)) }}>
      <View role="group">{children}</View>
    </Radio.Provider>
  )
}

export function MenubarRadioItem({ value, inset: _inset, ...props }: ItemProps & { value: unknown }) {
  const radio = useContext(Radio)
  const checked = radio?.value === value
  return <MenubarItem {...props} role="menuitemradio" checked={checked} closeOnClick={false} onClick={(() => radio?.set(value)) as never} indicator={checked ? <CheckIcon size={16} /> : null} />
}

export const MenubarGroup = ({ children }: { children?: ReactNode }) => <View role="group">{children}</View>
export const MenubarPortal = ({ children }: { children?: ReactNode }) => <>{children}</>
export const MenubarLabel = ({ inset, className = "", children }: BoxProps & { inset?: boolean }) => <Div className={`py-2.5 text-xs text-muted-foreground ${inset ? "pl-9.5 pr-3.5" : "px-3.5"} ${className}`}>{children}</Div>
export const MenubarSeparator = ({ className = "" }: BoxProps) => <Div role="separator" className={`-mx-1 my-1 h-px bg-border/50 ${className}`} />
export const MenubarShortcut = ({ className = "", children }: BoxProps) => <Span className={`ml-auto text-xs text-muted-foreground ${className}`} style={{ letterSpacing: 1.2 }}>{children}</Span>

/** A submenu: its trigger opens its items under it, indented (the web shows them beside). */
export function MenubarSub({ children }: { children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  return <Sub.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>{children}</Sub.Provider>
}

export function MenubarSubTrigger({ inset, className = "", children }: BoxProps & { inset?: boolean }) {
  const sub = useContext(Sub)
  return (
    <MenubarItem inset={inset} className={className} closeOnClick={false} onClick={(() => sub?.toggle()) as never} aria-expanded={sub?.open}>
      {children}
      <ChevronRightIcon size={16} className="ml-auto" />
    </MenubarItem>
  )
}

export function MenubarSubContent({ children }: BoxProps) {
  const sub = useContext(Sub)
  return sub?.open ? <View style={{ paddingLeft: 12 }}>{children}</View> : null
}
