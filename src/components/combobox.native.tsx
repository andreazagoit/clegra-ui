import { Children, createContext, isValidElement, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { Pressable, ScrollView, TextInput, View, type TextInputInstance } from "react-native"

import { IconContext } from "../native/icon-context"
import { CheckIcon, ChevronDownIcon, XIcon } from "../native/icons"
import { Floating, Portal, useAnchor, type Rect } from "../native/overlay"
import { fonts, useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Button } from "./button.native"
import { InputGroup, InputGroupAddon } from "./input-group.native"

type Item = unknown
type Ctx = {
  items?: readonly Item[]
  multiple: boolean
  selected: Item[]
  isSelected: (item: Item) => boolean
  choose: (item: Item) => void
  remove: (item: Item) => void
  clear: () => void
  input: string
  setInput: (text: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  anchor: ReturnType<typeof useAnchor>
  label: (item: Item) => string
  matches: (item: Item) => boolean
  shown: Item[]
  highlight: Item | null
  setHighlight: (item: Item | null) => void
  disabled?: boolean
}
const ComboboxCtx = createContext<Ctx | null>(null)
const useCombobox = () => useContext(ComboboxCtx)!

const defaultLabel = (item: Item) => (item === null || item === undefined ? "" : typeof item === "object" && "label" in (item as object) ? String((item as { label: unknown }).label) : String(item))

type RootProps = {
  items?: readonly Item[]
  value?: Item
  defaultValue?: Item
  onValueChange?: (value: never) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  multiple?: boolean
  disabled?: boolean
  itemToStringLabel?: (item: never) => string
  filter?: ((item: never, query: string) => boolean) | null
  children?: ReactNode
}

/** Base UI's Combobox drawn: a text field that filters a list under it; picking fills the field (or adds a chip with `multiple`). */
export function Combobox({ items, value, defaultValue, onValueChange, inputValue, defaultInputValue, onInputValueChange, open, defaultOpen, onOpenChange, multiple = false, disabled, itemToStringLabel, filter, children }: RootProps) {
  const label = (itemToStringLabel as ((item: Item) => string) | undefined) ?? defaultLabel
  const [ownValue, setOwnValue] = useState<Item>(defaultValue ?? (multiple ? [] : null))
  const current = value === undefined ? ownValue : value
  const selected = multiple ? ((current as Item[] | null) ?? []) : current === null || current === undefined ? [] : [current]
  const [ownInput, setOwnInput] = useState(defaultInputValue ?? (multiple ? "" : selected[0] !== undefined ? label(selected[0]) : ""))
  const input = inputValue ?? ownInput
  const [ownOpen, setOwnOpen] = useState(Boolean(defaultOpen))
  const shownOpen = open ?? ownOpen
  const [highlight, setHighlight] = useState<Item | null>(null)
  const anchor = useAnchor()

  const setInput = (text: string) => (setOwnInput(text), onInputValueChange?.(text))
  const setOpen = (next: boolean) => {
    if (next === shownOpen) return
    if (next) anchor.measure(() => (setOwnOpen(true), onOpenChange?.(true)))
    else (setOwnOpen(false), onOpenChange?.(false), setHighlight(null))
  }
  const setValue = (next: Item) => (setOwnValue(next), onValueChange?.(next as never))
  // The list shows everything while the field still reads the chosen item.
  const query = !multiple && selected[0] !== undefined && input === label(selected[0]) ? "" : input
  const matches = (item: Item) => (filter === null || !query ? true : filter ? (filter as (item: Item, query: string) => boolean)(item, query) : label(item).toLowerCase().includes(query.toLowerCase()))
  const shown = (items ?? []).filter(matches)
  const ctx: Ctx = {
    items,
    multiple,
    selected,
    isSelected: (item) => selected.includes(item),
    choose: (item) => {
      if (multiple) {
        setValue(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item])
        setInput("")
      } else {
        setValue(item)
        setInput(label(item))
        setOpen(false)
      }
    },
    remove: (item) => setValue(multiple ? selected.filter((s) => s !== item) : null),
    clear: () => (setValue(multiple ? [] : null), setInput("")),
    input,
    setInput,
    open: shownOpen,
    setOpen,
    anchor,
    label,
    matches,
    shown,
    highlight,
    setHighlight,
    disabled,
  }
  return <ComboboxCtx.Provider value={ctx}>{children}</ComboboxCtx.Provider>
}

export function ComboboxValue({ children, placeholder }: { children?: ReactNode | ((value: never) => ReactNode); placeholder?: ReactNode }) {
  const box = useCombobox()
  const value = box.multiple ? box.selected : (box.selected[0] ?? null)
  if (typeof children === "function") return <>{(children as (value: unknown) => ReactNode)(value)}</>
  return <Span>{children ?? (box.selected.length ? box.selected.map(box.label).join(", ") : placeholder)}</Span>
}

/** The chevron button that opens the list. */
export function ComboboxTrigger({ className = "", disabled, children, ...props }: BoxProps & { disabled?: boolean }) {
  const box = useCombobox()
  const colors = useColors()
  return (
    <Pressable {...(props as object)} role="button" aria-label={(props["aria-label"] as string | undefined) ?? "Open"} aria-expanded={box.open} disabled={disabled || box.disabled} onPress={() => box.setOpen(!box.open)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 24, minWidth: 24, borderRadius: 12, gap: 4 }}>
      {children}
      <ChevronDownIcon size={16} color={colors.mutedForeground} className={className} />
    </Pressable>
  )
}

export function ComboboxClear({ disabled, ...props }: BoxProps & { disabled?: boolean }) {
  const box = useCombobox()
  if (!box.selected.length && !box.input) return null
  return (
    <Button {...props} variant="ghost" size="icon-xs" aria-label="Clear" disabled={disabled || box.disabled} onClick={() => box.clear()}>
      <XIcon />
    </Button>
  )
}

function Field({ placeholder, disabled, className, inputRef, autoFocus, label }: { placeholder?: string; disabled?: boolean; className?: string; inputRef?: RefObject<TextInputInstance | null>; autoFocus?: boolean; label?: string }) {
  const box = useCombobox()
  const colors = useColors()
  const parsed = useTw(className)
  return (
    <TextInput
      ref={inputRef}
      role="combobox"
      aria-expanded={box.open}
      accessibilityLabel={label ?? placeholder}
      autoFocus={autoFocus}
      editable={!disabled && !box.disabled}
      value={box.input}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      onChangeText={(text) => {
        box.setInput(text)
        box.setOpen(true)
      }}
      onPressIn={() => box.setOpen(true)}
      onKeyPress={(event) => {
        const key = (event.nativeEvent as { key?: string }).key
        if (key === "Escape") box.setOpen(false)
        if (key === "Backspace" && box.multiple && !box.input && box.selected.length) box.remove(box.selected.at(-1))
      }}
      onSubmitEditing={() => {
        const pick = box.highlight ?? box.shown[0]
        if (pick !== undefined && pick !== null) box.choose(pick)
      }}
      style={[{ flex: 1, height: "100%", minWidth: 0, paddingHorizontal: 12, color: colors.foreground, fontFamily: fonts.sans, fontSize: 14, opacity: disabled ? 0.5 : 1 }, parsed.view as object]}
    />
  )
}

export function ComboboxInput({ className = "", children, disabled = false, showTrigger = true, showClear = false, placeholder, autoFocus, "aria-label": label }: BoxProps & { disabled?: boolean; showTrigger?: boolean; showClear?: boolean; placeholder?: string; autoFocus?: boolean }) {
  const box = useCombobox()
  const clearing = showClear && (box.selected.length > 0 || box.input.length > 0)
  return (
    <View ref={box.anchor.ref} collapsable={false}>
      <InputGroup className={`border-transparent bg-input/50 ${className}`}>
        <Field placeholder={placeholder} disabled={disabled} autoFocus={autoFocus} label={label} />
        <InputGroupAddon className="pr-3 pl-0">
          {showTrigger && !clearing && <ComboboxTrigger disabled={disabled} />}
          {showClear && <ComboboxClear disabled={disabled} />}
        </InputGroupAddon>
        {children}
      </InputGroup>
    </View>
  )
}

export function ComboboxContent({ className = "", children, anchor: _anchor }: BoxProps & { side?: string; sideOffset?: number; align?: "start" | "center" | "end"; alignOffset?: number; anchor?: unknown }) {
  const box = useCombobox()
  const colors = useColors()
  if (!box.open || !box.anchor.rect) return null
  const rect = box.anchor.rect as Rect
  return (
    <Portal>
      <ComboboxCtx.Provider value={box}>
        <Floating rect={rect} onClose={() => box.setOpen(false)} width={box.multiple ? rect.width : rect.width + 28} height={300} style={{ marginTop: 2 }}>
          <View role={"listbox" as never} style={{ overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}>
            <Div className={className}>{children}</Div>
          </View>
        </Floating>
      </ComboboxCtx.Provider>
    </Portal>
  )
}

/** The items: a function of each matching item (with `items` on the root), or the items themselves. */
export function ComboboxList({ className = "", children }: Omit<BoxProps, "children"> & { children?: ReactNode | ((item: never, index: number) => ReactNode) }) {
  const box = useCombobox()
  const content = typeof children === "function" ? box.shown.map((item, index) => (children as (item: unknown, index: number) => ReactNode)(item, index)) : children
  const empty = typeof children === "function" ? box.shown.length === 0 : false
  return (
    <ScrollView style={{ maxHeight: 252 }}>
      <Div className={`${empty ? "" : "p-1.5"} ${className}`}>{content}</Div>
    </ScrollView>
  )
}

export function ComboboxCollection({ children }: { children: (item: never, index: number) => ReactNode }) {
  const box = useCombobox()
  return <>{box.shown.map((item, index) => (children as (item: unknown, index: number) => ReactNode)(item, index))}</>
}

export function ComboboxItem({ value, disabled, className = "", children }: BoxProps & { value: Item; disabled?: boolean }) {
  const box = useCombobox()
  const colors = useColors()
  if (!box.items && !box.matches(value)) return null
  const highlighted = box.highlight === value
  const color = highlighted ? colors.accentForeground : colors.foreground
  return (
    <Pressable
      role="option"
      aria-selected={box.isSelected(value)}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onHoverIn={() => box.setHighlight(value)}
      onHoverOut={() => box.setHighlight(null)}
      onPress={() => box.choose(value)}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 12, paddingRight: 32, borderRadius: 16, opacity: disabled ? 0.5 : 1, backgroundColor: highlighted ? colors.accent : "transparent" }}
    >
      <IconContext.Provider value={{ size: 16, color }}>
        <Div className={`flex flex-row flex-1 items-center gap-2.5 text-sm font-medium ${className}`} style={{ color }}>
          {children}
        </Div>
        {box.isSelected(value) && (
          <View style={{ position: "absolute", right: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
            <CheckIcon size={16} color={color} />
          </View>
        )}
      </IconContext.Provider>
    </Pressable>
  )
}

export const ComboboxGroup = ({ className = "", children, ...props }: BoxProps & { items?: unknown[] }) => (
  <Div role="group" {...props} className={className}>
    {children}
  </Div>
)
export const ComboboxLabel = ({ className = "", children }: BoxProps) => <Div className={`px-3 py-2.5 text-xs text-muted-foreground ${className}`}>{children}</Div>
export const ComboboxSeparator = ({ className = "" }: BoxProps) => <Div role="separator" className={`-mx-1.5 my-1.5 h-px bg-border ${className}`} />

export function ComboboxEmpty({ className = "", children }: BoxProps) {
  const box = useCombobox()
  if (box.items ? box.shown.length > 0 : true) return null
  return <Div className={`flex flex-row w-full justify-center py-2 text-center text-sm text-muted-foreground ${className}`}>{children}</Div>
}

/** With `multiple`: the box that holds the chips and the field. */
export function ComboboxChips({ className = "", children, ref: _ref, ...props }: BoxProps) {
  const box = useCombobox()
  const hasChips = Children.toArray(children).some((child) => isValidElement(child) && child.type === ComboboxChip) || box.selected.length > 0
  return (
    <View ref={box.anchor.ref} collapsable={false}>
      <Div {...props} className={`flex flex-row min-h-9 flex-wrap items-center gap-1.5 rounded-3xl border border-transparent bg-input/50 py-1.5 text-sm ${hasChips ? "px-1.5" : "px-3"} ${className}`}>
        {children}
      </Div>
    </View>
  )
}

export function ComboboxChip({ className = "", children, showRemove = true, value }: BoxProps & { showRemove?: boolean; value?: Item }) {
  const box = useCombobox()
  const text = Children.toArray(children).every((child) => typeof child === "string" || typeof child === "number")
  const item = value !== undefined ? value : text ? box.selected.find((s) => box.label(s) === Children.toArray(children).join("")) : undefined
  return (
    <Div className={`flex flex-row h-5.5 items-center justify-center gap-1 self-start rounded-3xl bg-input px-2 text-xs font-medium ${showRemove ? "pr-0" : ""} ${className}`}>
      {text ? <Span className="text-xs font-medium">{children}</Span> : children}
      {showRemove && (
        <Button variant="ghost" size="icon-xs" aria-label="Remove" className="-ml-1" style={{ opacity: 0.5 }} onClick={() => item !== undefined && box.remove(item)}>
          <XIcon />
        </Button>
      )}
    </Div>
  )
}

export function ComboboxChipsInput({ className = "min-w-16 flex-1", placeholder, "aria-label": label }: BoxProps & { placeholder?: string }) {
  const ref = useRef<TextInputInstance>(null)
  return (
    <View style={{ flex: 1, minWidth: 64, height: 24 }}>
      <Field inputRef={ref} placeholder={placeholder} className={`${className} px-0`} label={label} />
    </View>
  )
}

/** The web's anchor ref for the chips box; drawn, the chips box anchors the list itself. */
export function useComboboxAnchor() {
  return useMemo(() => ({ current: null }), [])
}
