import { CheckIcon, ChevronDownIcon } from "../native/icons"
import { Children, createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Pressable, ScrollView, View } from "react-native"

import { FormContext } from "../native/form-context"
import { Floating, Portal, useAnchor, type Rect } from "../native/overlay"
import { Div, Span, type BoxProps } from "../primitives.native"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

type Ctx = { value: unknown; choose: (value: unknown) => void; open: boolean; setOpen: (open: boolean) => void; disabled?: boolean; anchor: ReturnType<typeof useAnchor>; label: (value: unknown) => ReactNode }
const SelectCtx = createContext<Ctx | null>(null)

/** Drawn. */
export function Select({ value, defaultValue, onValueChange, items, disabled, name, children }: { value?: unknown; defaultValue?: unknown; onValueChange?: (value: never) => void; items?: { value: unknown; label: ReactNode }[]; disabled?: boolean; name?: string; required?: boolean; children?: ReactNode }) {
  const [own, setOwn] = useState<unknown>(defaultValue ?? null)
  const [open, setOpen] = useState(false)
  const anchor = useAnchor()
  const form = useContext(FormContext)
  const shown = value ?? own
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => String(latest.current ?? ""))
  }, [form, name])
  const label = (v: unknown) => items?.find((i) => i.value === v)?.label ?? (v === null || v === undefined ? "" : String(v))
  return <SelectCtx.Provider value={{ value: shown, choose: (v) => (setOwn(v), onValueChange?.(v as never), setOpen(false)), open, setOpen, disabled, anchor, label }}>{children}</SelectCtx.Provider>
}

export function SelectTrigger({ size, className = "", children, "aria-label": label }: { size?: "sm" | "default"; className?: string; children?: ReactNode; "aria-label"?: string }) {
  const select = useContext(SelectCtx)!
  const colors = useColors()
  const parsed = useTw(`flex flex-row items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input/50 px-3 text-sm ${size === "sm" ? "h-8" : "h-9"} ${className}`)
  return (
    <View ref={select.anchor.ref} collapsable={false} style={{ alignSelf: /(^|\s)w-full(\s|$)/.test(className) ? "stretch" : "flex-start" }}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={select.disabled} onPress={() => select.anchor.measure(() => select.setOpen(true))} style={[parsed.view, { opacity: select.disabled ? 0.5 : 1 }]}>
        {children}
        <ChevronDownIcon size={16} color={colors.mutedForeground} />
      </Pressable>
    </View>
  )
}

export function SelectValue({ children, placeholder }: { children?: ((value: unknown) => ReactNode) | ReactNode; placeholder?: string; className?: string }) {
  const select = useContext(SelectCtx)!
  const content = typeof children === "function" ? children(select.value) : (children ?? select.label(select.value))
  return <Span className="flex-1" >{content || placeholder}</Span>
}

export function SelectContent({ children }: { children?: ReactNode; className?: string; align?: string; side?: string }) {
  const select = useContext(SelectCtx)!
  const colors = useColors()
  if (!select.open) return null
  return (
    <Portal>
      <SelectCtx.Provider value={select}>
        <Floating rect={select.anchor.rect as Rect} onClose={() => select.setOpen(false)} height={40 * Math.min(8, Children.count(children))}>
          <View accessibilityRole="menu" style={{ padding: 4, borderRadius: 19.6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, maxHeight: 320, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}>
            <ScrollView>{children}</ScrollView>
          </View>
        </Floating>
      </SelectCtx.Provider>
    </Portal>
  )
}

export function SelectItem({ value, disabled, children }: { value: unknown; disabled?: boolean; children?: ReactNode; className?: string }) {
  const select = useContext(SelectCtx)!
  const colors = useColors()
  const [hover, setHover] = useState(false)
  return (
    <Pressable role="option" aria-selected={select.value === value} disabled={disabled} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} onPress={() => select.choose(value)} style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36, paddingHorizontal: 12, borderRadius: 14, opacity: disabled ? 0.5 : 1, backgroundColor: hover ? colors.accent : "transparent" }}>
      <Span className="flex-1">{children}</Span>
      {select.value === value && <CheckIcon />}
    </Pressable>
  )
}

export const SelectGroup = ({ children }: { children?: ReactNode }) => <>{children}</>
export const SelectLabel = ({ children }: BoxProps) => <Div className="px-3 py-2.5 text-xs text-muted-foreground">{children}</Div>
export const SelectSeparator = () => <Div className="bg-border h-px my-1" />
export const SelectScrollUpButton = () => null
export const SelectScrollDownButton = () => null

