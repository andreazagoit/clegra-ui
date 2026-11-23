import { CheckIcon, ChevronRightIcon } from "../native/icons"
import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, ScrollView, View } from "react-native"

import { Floating, Portal, useAnchor, type Rect } from "../native/overlay"
import { Div, Span, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; anchor: ReturnType<typeof useAnchor> }
const MenuCtx = createContext<Ctx | null>(null)
const Radio = createContext<{ value: unknown; set: (value: unknown) => void } | null>(null)

/** Drawn. */
export function DropdownMenu({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(false)
  const anchor = useAnchor()
  return <MenuCtx.Provider value={{ open: open ?? own, setOpen: (next) => (setOwn(next), onOpenChange?.(next)), anchor }}>{children}</MenuCtx.Provider>
}

export function DropdownMenuTrigger({ render, children, onClick }: { render?: ReactElement; children?: ReactNode; onClick?: () => void; className?: string; "aria-label"?: string }) {
  const menu = useContext(MenuCtx)!
  const press = () => {
    onClick?.()
    menu.anchor.measure(() => menu.setOpen(true))
  }
  return (
    <View ref={menu.anchor.ref} collapsable={false} style={{ alignSelf: "flex-start", alignItems: "flex-start" }}>
      {rendered(render, { onClick: press, "aria-haspopup": "menu", "aria-expanded": menu.open }, () => <Pressable onPress={press}>{children}</Pressable>, children)}
    </View>
  )
}

export function DropdownMenuContent({ align = "start", className = "", children }: BoxProps & { align?: "start" | "end" | "center"; side?: string; sideOffset?: number }) {
  const menu = useContext(MenuCtx)!
  const colors = useColors()
  if (!menu.open) return null
  const width = /w-(\d+)/.exec(className)?.[1]
  return (
    <Portal>
      <MenuCtx.Provider value={menu}>
        <Floating rect={menu.anchor.rect as Rect} onClose={() => menu.setOpen(false)} align={align} width={width ? Number(width) * 4 : undefined} height={320}>
          <View role="menu" style={{ padding: 4, borderRadius: 19.6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, maxHeight: 400 }}>
            <ScrollView>{children}</ScrollView>
          </View>
        </Floating>
      </MenuCtx.Provider>
    </Portal>
  )
}

/**
 * `description` (Clegra's, React Native only): a second line under the item's
 * text, as iOS menus show a subtitle (why it can't be chosen, a status).
 */
export function DropdownMenuItem({
  onClick,
  disabled,
  variant,
  className = "",
  children,
  closeOnClick = true,
  description,
}: BoxProps & { disabled?: boolean; variant?: "default" | "destructive"; closeOnClick?: boolean; description?: string }) {
  const menu = useContext(MenuCtx)!
  const colors = useColors()
  const [hover, setHover] = useState(false)
  return (
    <Pressable
      role="menuitem"
      disabled={disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={() => {
        ;(onClick as (() => void) | undefined)?.()
        if (closeOnClick) menu.setOpen(false)
      }}
      style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36, paddingHorizontal: 12, borderRadius: 14, opacity: disabled ? 0.5 : 1, backgroundColor: hover ? colors.accent : "transparent" }}
    >
      {description ? (
        <Div className="flex-1 py-1.5">
          <Div className={`flex flex-row items-center gap-2 ${variant === "destructive" ? "text-destructive" : ""} ${className}`}>{children}</Div>
          <Span className="text-xs text-muted-foreground">{description}</Span>
        </Div>
      ) : (
        <Div className={`flex flex-row flex-1 items-center gap-2 ${variant === "destructive" ? "text-destructive" : ""} ${className}`}>{children}</Div>
      )}
    </Pressable>
  )
}

export function DropdownMenuRadioGroup({ value, onValueChange, children }: { value?: unknown; onValueChange?: (value: unknown) => void; children?: ReactNode }) {
  return <Radio.Provider value={{ value, set: (next) => onValueChange?.(next) }}>{children}</Radio.Provider>
}

export function DropdownMenuRadioItem({ value, children }: { value: unknown; children?: ReactNode }) {
  const radio = useContext(Radio)
  return (
    <DropdownMenuItem onClick={(() => radio?.set(value)) as never}>
      <Span className="flex-1">{children}</Span>
      {radio?.value === value && <CheckIcon />}
    </DropdownMenuItem>
  )
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  disabled,
  description,
}: {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  children?: ReactNode
  disabled?: boolean
  /** Clegra's: a second line (see DropdownMenuItem). */
  description?: string
}) {
  return (
    <DropdownMenuItem closeOnClick={false} disabled={disabled} description={description} onClick={(() => onCheckedChange?.(!checked)) as never}>
      <Span className="flex-1">{children}</Span>
      {checked && <CheckIcon />}
    </DropdownMenuItem>
  )
}

export const DropdownMenuGroup = ({ children }: { children?: ReactNode }) => <>{children}</>
export const DropdownMenuLabel = ({ children, className = "" }: BoxProps) => <Div className={`px-3 py-2.5 text-xs font-medium text-muted-foreground ${className}`}>{children}</Div>
export const DropdownMenuSeparator = () => <Div className="bg-border h-px my-1" />
export const DropdownMenuShortcut = ({ children }: BoxProps) => <Span className="ml-auto text-xs text-muted-foreground">{children}</Span>
export const DropdownMenuPortal = ({ children }: { children?: ReactNode }) => <>{children}</>
export const DropdownMenuSub = ({ children }: { children?: ReactNode }) => <>{children}</>
export const DropdownMenuSubTrigger = ({ children }: BoxProps) => (
  <DropdownMenuItem closeOnClick={false}>
    <Span className="flex-1">{children}</Span>
    <ChevronRightIcon />
  </DropdownMenuItem>
)
export const DropdownMenuSubContent = ({ children }: BoxProps) => <>{children}</>
