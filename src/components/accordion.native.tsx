import * as L from "lucide-react-native"
import { Children, createContext, useContext, useId, useState, type ComponentType, type ReactNode } from "react"
import { Pressable } from "react-native"

import { ChevronDownIcon, wrapIcon, type IconProps } from "../native/icons"
import { useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"

const ChevronUpIcon = wrapIcon("ChevronUpIcon", L.ChevronUpIcon as unknown as ComponentType<IconProps>)

type Value = unknown
type RootCtx = { open: Value[]; toggle: (value: Value) => void; disabled?: boolean }
const Root = createContext<RootCtx>({ open: [], toggle: () => {} })
const Last = createContext(false)
/** For the platform files: the open values, and whether an item is the last row. */
export { Root as AccordionRoot, Last as AccordionLast }
const ItemCtx = createContext<{ value: Value; open: boolean; disabled?: boolean }>({ value: null, open: false })

/** Base UI's Accordion drawn: a bordered list of rows that open; one at a time unless `multiple`. */
export function Accordion({ value, defaultValue, onValueChange, multiple = false, disabled, className = "", children, ...props }: Omit<BoxProps, "defaultValue" | "onChange"> & { value?: Value[]; defaultValue?: Value[]; onValueChange?: (value: Value[]) => void; multiple?: boolean; disabled?: boolean }) {
  const [own, setOwn] = useState<Value[]>(defaultValue ?? [])
  const open = value ?? own
  const toggle = (item: Value) => {
    const next = open.includes(item) ? open.filter((v) => v !== item) : multiple ? [...open, item] : [item]
    setOwn(next)
    onValueChange?.(next)
  }
  const items = Children.toArray(children)
  return (
    <Root.Provider value={{ open, toggle, disabled }}>
      <Div {...props} className={`flex flex-col w-full overflow-hidden rounded-2xl border ${className}`}>
        {items.map((child, index) => (
          <Last.Provider key={index} value={index === items.length - 1}>
            {child}
          </Last.Provider>
        ))}
      </Div>
    </Root.Provider>
  )
}

export function AccordionItem({ value, disabled, className = "", children, ...props }: BoxProps & { value?: Value; disabled?: boolean }) {
  const root = useContext(Root)
  const last = useContext(Last)
  const own = useId()
  const id = value ?? own
  const open = root.open.includes(id)
  return (
    <ItemCtx.Provider value={{ value: id, open, disabled: disabled || root.disabled }}>
      <Div {...props} className={`flex flex-col ${last ? "" : "border-b"} ${open ? "bg-muted/50" : ""} ${className}`}>
        {children}
      </Div>
    </ItemCtx.Provider>
  )
}

export function AccordionTrigger({ className = "", children, ...props }: BoxProps) {
  const root = useContext(Root)
  const item = useContext(ItemCtx)
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const Icon = item.open ? ChevronUpIcon : ChevronDownIcon
  return (
    <Pressable
      {...(props as object)}
      role="button"
      aria-expanded={item.open}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={() => root.toggle(item.value)}
      style={{ flexDirection: "row", flex: 1, alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: 16, borderWidth: 1, borderColor: "transparent", opacity: item.disabled ? 0.5 : 1 }}
    >
      <Span className={`flex-1 text-left text-sm font-medium ${className}`} style={hover ? { textDecorationLine: "underline" } : undefined}>
        {children}
      </Span>
      <Icon size={16} color={colors.mutedForeground} />
    </Pressable>
  )
}

export function AccordionContent({ className = "", children, ...props }: BoxProps) {
  const item = useContext(ItemCtx)
  if (!item.open) return null
  return (
    <Div {...props} className="px-4 text-sm">
      <Div className={`pt-0 pb-4 ${className}`}>{children}</Div>
    </Div>
  )
}
