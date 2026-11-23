import { Children, createContext, type ComponentType, isValidElement, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Pressable, ScrollView, TextInput, View } from "react-native"

import { IconContext } from "../native/icon-context"
import * as L from "lucide-react-native"
import { CheckIcon, wrapIcon, type IconProps } from "../native/icons"
import { fonts, useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog.native"
import { InputGroup, InputGroupAddon } from "./input-group.native"

const SearchIcon = wrapIcon("SearchIcon", L.SearchIcon as unknown as ComponentType<IconProps>)

type Filter = (value: string, search: string, keywords?: string[]) => number
type Entry = { value: string; group: string | null; shown: boolean; disabled: boolean; onSelect?: (value: string) => void }

/** cmdk's default, simplified: every letter of the search, in order, case-insensitive. */
const defaultFilter: Filter = (value, search, keywords = []) => {
  const hay = `${value} ${keywords.join(" ")}`.toLowerCase()
  let at = 0
  for (const ch of search.toLowerCase().replace(/\s+/g, "")) {
    at = hay.indexOf(ch, at)
    if (at < 0) return 0
    at += 1
  }
  return 1
}

type Ctx = {
  search: string
  setSearch: (search: string) => void
  filtered: boolean
  matches: (value: string, keywords?: string[]) => boolean
  register: (id: string, entry: Entry) => void
  unregister: (id: string) => void
  entries: Map<string, Entry>
  version: number
  active: string | null
  setActive: (value: string | null) => void
  move: (by: 1 | -1) => void
  choose: () => void
}
const CommandCtx = createContext<Ctx | null>(null)
const GroupCtx = createContext<string | null>(null)

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : isValidElement<{ children?: ReactNode }>(child) && child.type !== CommandShortcut ? textOf(child.props.children) : ""))
    .join("")
    .trim()

/** cmdk drawn: a search box over a list of items that filters as you type; the first match is the active one. */
export function Command({ value, onValueChange, filter = defaultFilter, shouldFilter = true, loop = false, className = "", children, ...props }: Omit<BoxProps, "onChange"> & { value?: string; onValueChange?: (value: string) => void; filter?: Filter; shouldFilter?: boolean; loop?: boolean; label?: string }) {
  const [search, setSearch] = useState("")
  const [version, setVersion] = useState(0)
  const [own, setOwn] = useState<string | null>(null)
  const entries = useRef(new Map<string, Entry>()).current
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const register = useCallback(
    (id: string, entry: Entry) => {
      const old = entries.get(id)
      entries.set(id, entry)
      if (!old || old.shown !== entry.shown || old.value !== entry.value) bump()
    },
    [entries, bump],
  )
  const unregister = useCallback((id: string) => void (entries.delete(id) && bump()), [entries, bump])
  const shown = [...entries.values()].filter((e) => e.shown && !e.disabled)
  const chosen = value ?? own
  const active = shown.some((e) => e.value === chosen) ? chosen : (shown[0]?.value ?? null)
  const setActive = (next: string | null) => {
    setOwn(next)
    if (next !== null) onValueChange?.(next)
  }
  const ctx: Ctx = {
    search,
    setSearch: (next) => {
      setSearch(next)
      setOwn(null)
    },
    filtered: shouldFilter && search.length > 0,
    matches: (v, keywords) => !shouldFilter || !search || filter(v, search, keywords) > 0,
    register,
    unregister,
    entries,
    version,
    active,
    setActive,
    move: (by) => {
      const at = shown.findIndex((e) => e.value === active)
      let next = at + by
      if (next < 0) next = loop ? shown.length - 1 : 0
      if (next >= shown.length) next = loop ? 0 : shown.length - 1
      setActive(shown[next]?.value ?? null)
    },
    choose: () => shown.find((e) => e.value === active)?.onSelect?.(active!),
  }
  return (
    <CommandCtx.Provider value={ctx}>
      <Div {...props} className={`flex flex-col w-full overflow-hidden rounded-4xl bg-popover p-1 ${className}`}>
        {children}
      </Div>
    </CommandCtx.Provider>
  )
}

export function CommandDialog({ title = "Command Palette", description = "Search for a command to run...", children, className = "", showCloseButton = false, ...props }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; title?: string; description?: string; className?: string; showCloseButton?: boolean; children: ReactNode }) {
  return (
    <Dialog {...props}>
      <DialogContent className={`overflow-hidden rounded-4xl p-0 ${className}`} showCloseButton={showCloseButton}>
        <View style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </View>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function CommandInput({ value, onValueChange, placeholder, className: _className, disabled, autoFocus, ...props }: { value?: string; onValueChange?: (search: string) => void; placeholder?: string; className?: string; disabled?: boolean; autoFocus?: boolean; "aria-label"?: string }) {
  const command = useContext(CommandCtx)!
  const colors = useColors()
  const search = value ?? command.search
  return (
    <Div className="p-1 pb-0">
      <InputGroup className="h-9 bg-input/50 border-transparent">
        <InputGroupAddon>
          <SearchIcon size={16} color={colors.foreground} style={{ opacity: 0.5 }} />
        </InputGroupAddon>
        <TextInput
          accessibilityLabel={props["aria-label"] ?? placeholder}
          role="combobox"
          aria-expanded
          autoFocus={autoFocus}
          editable={!disabled}
          value={search}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          onChangeText={(text) => {
            command.setSearch(text)
            onValueChange?.(text)
          }}
          onKeyPress={(event) => {
            const key = (event.nativeEvent as { key?: string }).key
            if (key === "ArrowDown" || key === "ArrowUp") {
              ;(event as unknown as { preventDefault?: () => void }).preventDefault?.()
              command.move(key === "ArrowDown" ? 1 : -1)
            }
          }}
          onSubmitEditing={() => command.choose()}
          style={{ flex: 1, height: "100%", paddingLeft: 6, paddingRight: 12, color: colors.foreground, fontFamily: fonts.sans, fontSize: 14, opacity: disabled ? 0.5 : 1 }}
        />
      </InputGroup>
    </Div>
  )
}

export function CommandList({ className = "", children, ...props }: BoxProps) {
  return (
    <View role={"listbox" as never} {...(props as object)} style={{ maxHeight: 288 }}>
      <ScrollView>
        <Div className={className}>{children}</Div>
      </ScrollView>
    </View>
  )
}

export function CommandEmpty({ className = "", children }: BoxProps) {
  const command = useContext(CommandCtx)!
  const any = [...command.entries.values()].some((e) => e.shown)
  if (any || !command.entries.size) return null
  return <Div className={`py-6 text-center text-sm ${className}`}>{children}</Div>
}

export function CommandGroup({ heading, className = "", children, ...props }: BoxProps & { heading?: ReactNode; value?: string; forceMount?: boolean }) {
  const command = useContext(CommandCtx)!
  const id = useId()
  const any = [...command.entries.values()].some((e) => e.group === id && e.shown)
  return (
    <GroupCtx.Provider value={id}>
      <Div role="group" {...props} className={`overflow-hidden p-1.5 ${className}`} style={any ? undefined : { display: "none" }}>
        {heading !== undefined && <Div className="px-3 py-2 text-xs font-medium text-muted-foreground">{heading}</Div>}
        {children}
      </Div>
    </GroupCtx.Provider>
  )
}

export function CommandSeparator({ className = "", alwaysRender }: BoxProps & { alwaysRender?: boolean }) {
  const command = useContext(CommandCtx)!
  if (command.filtered && !alwaysRender) return null
  return <Div role="separator" className={`my-1.5 h-px bg-border/50 ${className}`} />
}

export function CommandItem({ value, keywords, onSelect, disabled = false, className = "", children, "data-checked": checked }: BoxProps & { value?: string; keywords?: string[]; onSelect?: (value: string) => void; disabled?: boolean; forceMount?: boolean }) {
  const command = useContext(CommandCtx)!
  const group = useContext(GroupCtx)
  const colors = useColors()
  const id = useId()
  const itemValue = (value ?? textOf(children)).trim()
  const shown = command.matches(itemValue, keywords)
  const latest = useRef(onSelect)
  latest.current = onSelect
  const entry = useMemo<Entry>(() => ({ value: itemValue, group, shown, disabled, onSelect: (v) => latest.current?.(v) }), [itemValue, group, shown, disabled])
  const { register, unregister } = command
  useLayoutEffect(() => register(id, entry), [register, id, entry])
  useLayoutEffect(() => () => unregister(id), [unregister, id])
  if (!shown) return null
  const selected = command.active === itemValue && !disabled
  const hasShortcut = Children.toArray(children).some((child) => isValidElement(child) && child.type === CommandShortcut)
  return (
    <Pressable
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onHoverIn={() => command.setActive(itemValue)}
      onPress={() => onSelect?.(itemValue)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: disabled ? 0.5 : 1, backgroundColor: selected ? colors.muted : "transparent" }}
    >
      <IconContext.Provider value={{ size: 16, color: colors.foreground }}>
        <Div className={`flex flex-row flex-1 items-center gap-2 text-sm font-medium ${className}`}>{children}</Div>
        {!hasShortcut && <CheckIcon size={16} style={{ opacity: checked ? 1 : 0 }} />}
      </IconContext.Provider>
    </Pressable>
  )
}

export function CommandShortcut({ className = "", children }: BoxProps) {
  return (
    <Span className={`ml-auto text-xs text-muted-foreground ${className}`} style={{ letterSpacing: 1.2 }}>
      {children}
    </Span>
  )
}
