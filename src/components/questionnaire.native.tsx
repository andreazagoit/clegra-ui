import { Children, createContext, isValidElement, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, TextInput, View } from "react-native"

import { CheckIcon } from "../native/icons"
import { fonts, useColors, useResolvedTheme } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Button, type ButtonSize, type ButtonVariant } from "./button.native"

type Status = "unanswered" | "answered" | "skipped"
type Shortcuts = "letters" | "numbers"
type ItemDefinition = { name: string; required?: boolean; disabled?: boolean; choices?: readonly { value: string; disabled?: boolean }[] }
type Registered = { name: string; required: boolean; disabled: boolean; status: () => Status; validate: () => boolean; reset: () => void; skip: () => void; values: () => string[] }

const shortcutKeys = (mode: Shortcuts | null) => (mode === "letters" ? Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)) : mode === "numbers" ? Array.from({ length: 9 }, (_, i) => String(i + 1)) : [])

type RootContextValue = {
  active: string | null
  current: number
  total: number
  first: boolean
  last: boolean
  activeRequired: boolean | null
  activeStatus: Status | null
  shortcuts: Shortcuts | null
  definitions: Map<string, ItemDefinition> | null
  register: (item: Registered) => () => void
  refresh: () => void
  goPrevious: () => void
  goNext: () => void
  skip: () => void
  submit: () => void
}
const RootContext = createContext<RootContextValue | null>(null)

function useRoot(name: string) {
  const root = useContext(RootContext)
  if (!root) throw new Error(`${name} must be used within a Questionnaire.`)
  return root
}

/**
 * Questions one at a time, with choices or a text answer, Previous, Skip,
 * Next and Submit, as the web's (a form on the web; here the answers are
 * collected into a FormData given to `onSubmit`).
 */
export function Questionnaire({ className = "", defaultItem, item, items, onItemChange, onSubmit, shortcuts, children, ...props }: BoxProps & { defaultItem?: string; item?: string; items?: readonly ItemDefinition[]; onItemChange?: (item: string) => void; onSubmit?: (event: { preventDefault: () => void; currentTarget: { reset: () => void }; formData: FormData }) => void; shortcuts?: Shortcuts }) {
  const registry = useRef<Registered[]>([]).current
  const [, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const definitions = useMemo(() => (items ? new Map(items.map((d) => [d.name, d])) : null), [items])
  const order = (items ? items.filter((d) => !d.disabled).map((d) => d.name) : registry.filter((r) => !r.disabled).map((r) => r.name)).filter((name) => registry.some((r) => r.name === name) || items)
  const [own, setOwn] = useState<string | null>(defaultItem ?? null)
  const chosen = item ?? own
  const active = chosen && order.includes(chosen) ? chosen : (order[0] ?? null)
  const index = active ? order.indexOf(active) : -1
  const total = order.length
  const entry = registry.find((r) => r.name === active)
  const go = (name: string | undefined) => {
    if (!name || name === active) return
    if (item === undefined) setOwn(name)
    onItemChange?.(name)
  }
  const reset = () => {
    for (const r of registry) r.reset()
    go(defaultItem ?? order[0])
  }
  const submit = () => {
    const invalid = order.map((name) => registry.find((r) => r.name === name)).find((r) => r && !r.validate())
    if (invalid) return go(invalid.name)
    const data = new FormData()
    for (const r of registry) for (const value of r.values()) data.append(r.name, value)
    onSubmit?.({ preventDefault: () => {}, currentTarget: { reset }, formData: data })
  }
  const value: RootContextValue = {
    active,
    current: index + 1,
    total,
    first: total > 0 && index === 0,
    last: total > 0 && index === total - 1,
    activeRequired: entry ? (definitions?.get(entry.name)?.required ?? entry.required) : null,
    activeStatus: entry ? entry.status() : null,
    shortcuts: shortcuts ?? null,
    definitions,
    register: (r) => {
      registry.splice(0, registry.length, ...registry.filter((x) => x.name !== r.name), r)
      return () => {
        const at = registry.indexOf(r)
        if (at >= 0) registry.splice(at, 1)
      }
    },
    refresh,
    goPrevious: () => index > 0 && go(order[index - 1]),
    goNext: () => {
      if (!entry || index >= total - 1) return
      if (entry.validate()) go(order[index + 1])
    },
    skip: () => {
      if (!entry || entry.required) return
      entry.skip()
      if (index < total - 1) go(order[index + 1])
      else queueMicrotask(submit)
    },
    submit: () => {
      if (entry && !entry.validate()) return
      submit()
    },
  }
  return (
    <RootContext.Provider value={value}>
      <Div data-slot="questionnaire" {...props} className={`flex w-full min-w-0 flex-col gap-6 ${className}`}>
        {children}
      </Div>
    </RootContext.Provider>
  )
}

export function QuestionnaireProgress({ className = "", children, ...props }: BoxProps) {
  const { current, total } = useRoot("QuestionnaireProgress")
  const text = total ? `Question ${current} of ${total}` : undefined
  return (
    <Span data-slot="questionnaire-progress" role="progressbar" aria-valuenow={total ? current : undefined} aria-valuemin={total ? 1 : undefined} aria-valuemax={total || undefined} aria-valuetext={text} {...props} className={`text-xs font-medium text-muted-foreground tabular-nums ${className}`} style={{ minHeight: 16 }}>
      {children ?? text ?? ""}
    </Span>
  )
}

type ItemContextValue = {
  name: string
  multiple: boolean
  disabled: boolean
  invalid: boolean
  required: boolean
  selected: string[]
  text: string
  status: Status
  choose: (value: string, on: boolean) => void
  type: (value: string) => void
  registerChoice: (value: string, disabled: boolean, initially: boolean) => () => void
  shortcutOf: (value: string) => string | null
}
const ItemContext = createContext<ItemContextValue | null>(null)

function useItem(name: string) {
  const item = useContext(ItemContext)
  if (!item) throw new Error(`${name} must be used within a QuestionnaireItem.`)
  return item
}

/** One question; only the current one is shown. */
export function QuestionnaireItem({ className = "", name, required = false, multiple = false, disabled = false, invalid: invalidProp = false, onStatusChange, children, ...props }: BoxProps & { name: string; required?: boolean; multiple?: boolean; disabled?: boolean; invalid?: boolean; onStatusChange?: (status: Status) => void }) {
  const root = useRoot("QuestionnaireItem")
  const [selected, setSelected] = useState<string[]>([])
  const [text, setText] = useState("")
  const [skipped, setSkipped] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const choices = useRef<{ value: string; disabled: boolean; initially: boolean }[]>([]).current
  const [, setChoiceCount] = useState(0)
  const status: Status = skipped ? "skipped" : selected.length || text.trim() ? "answered" : "unanswered"
  const skippedFreely = status === "skipped" && !required
  const valid = disabled || skippedFreely || (!invalidProp && status === "answered")
  const invalid = !disabled && !skippedFreely && (invalidProp || (attempted && !valid))
  const latest = useRef({ status, valid, selected, text })
  latest.current = { status, valid, selected, text }
  const previous = useRef(status)
  useEffect(() => {
    if (previous.current !== status) {
      previous.current = status
      onStatusChange?.(status)
    }
    root.refresh()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(
    () =>
      root.register({
        name,
        required,
        disabled,
        status: () => latest.current.status,
        validate: () => (setAttempted(true), latest.current.valid),
        reset: () => (setSelected(choices.filter((c) => c.initially).map((c) => c.value).slice(0, multiple ? undefined : 1)), setText(""), setSkipped(false), setAttempted(false)),
        skip: () => (setSelected([]), setText(""), setSkipped(true)),
        values: () => (latest.current.status === "skipped" ? [] : latest.current.text.trim() ? [latest.current.text] : latest.current.selected),
      }),
    [name, required, disabled, multiple], // eslint-disable-line react-hooks/exhaustive-deps
  )
  useLayoutEffect(() => root.refresh(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const keys = shortcutKeys(root.shortcuts)
  const definition = root.definitions?.get(name)
  const value: ItemContextValue = {
    name,
    multiple,
    disabled,
    invalid,
    required,
    selected,
    text,
    status,
    choose: (v, on) => {
      setSkipped(false)
      setSelected((was) => (on ? (multiple ? (was.includes(v) ? was : [...was, v]) : [v]) : was.filter((x) => x !== v)))
    },
    type: (v) => {
      setSkipped(false)
      setText(v)
    },
    registerChoice: (v, off, initially) => {
      choices.push({ value: v, disabled: off, initially })
      setChoiceCount(choices.length)
      if (initially) setSelected((was) => (multiple ? [...was, v] : was.length ? was : [v]))
      return () => void choices.splice(choices.findIndex((c) => c.value === v), 1)
    },
    shortcutOf: (v) => {
      const list = (definition?.choices ?? choices).filter((c) => !c.disabled).map((c) => c.value)
      const at = list.indexOf(v)
      return at >= 0 ? (keys[at] ?? null) : null
    },
  }
  if (disabled || root.active !== name) return null
  // The web's title is the fieldset's <legend>: outside the flex gap, flush with the description under it.
  const parts = Children.toArray(children)
  const titles = parts.filter((p) => isValidElement(p) && p.type === QuestionnaireTitle)
  const rest = parts.filter((p) => !titles.includes(p))
  const described = rest.some((p) => isValidElement(p) && p.type === QuestionnaireDescription)
  return (
    <ItemContext.Provider value={value}>
      <Div data-slot="questionnaire-item" aria-invalid={invalid || undefined} {...props} className={`flex min-w-0 flex-col ${className}`}>
        {titles}
        <Div className={`flex min-w-0 flex-col gap-5 ${described ? "" : "mt-5"}`}>{rest}</Div>
      </Div>
    </ItemContext.Provider>
  )
}

/** The question; with no description after it the item keeps 20 px under it (the web's mb-5). */
export function QuestionnaireTitle({ className = "", ...props }: BoxProps) {
  return <Span data-slot="questionnaire-title" role="heading" {...props} className={`text-base font-semibold ${className}`} />
}

export function QuestionnaireDescription({ className = "", ...props }: BoxProps) {
  return <Span data-slot="questionnaire-description" {...props} className={`text-sm text-muted-foreground ${className}`} />
}

export function QuestionnaireChoices({ className = "", ...props }: BoxProps) {
  return <Div data-slot="questionnaire-choices" role="radiogroup" {...props} className={`flex flex-col min-w-0 gap-3 ${className}`} />
}

/** An answer to pick: a radio (one answer) or a checkbox (`multiple` on the item), the whole card pressable. */
export function QuestionnaireChoice({ className = "", value, checked, defaultChecked = false, disabled = false, onChange, children }: { className?: string; value: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean; onChange?: (event: { target: { checked: boolean; value: string } }) => void; children?: ReactNode }) {
  const item = useItem("QuestionnaireChoice")
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  const [hover, setHover] = useState(false)
  useLayoutEffect(() => item.registerChoice(value, disabled, defaultChecked), [value]) // eslint-disable-line react-hooks/exhaustive-deps
  const on = checked ?? item.selected.includes(value)
  const off = disabled || item.disabled
  const radio = !item.multiple
  const shortcut = item.shortcutOf(value)
  const described = Children.toArray(children).some((child) => isValidElement(child) && child.type === QuestionnaireChoiceDescription)
  const parsed = useTw(`relative flex flex-row min-h-11 items-start gap-2.5 rounded-3xl border px-4 py-3 ${item.invalid ? "border-destructive" : on ? "border-primary/40 bg-primary/10" : `border-input ${hover ? "bg-input/40" : ""}`}`)
  const press = () => {
    const next = radio ? true : !on
    onChange?.({ target: { checked: next, value } })
    if (checked === undefined) item.choose(value, next)
  }
  return (
    <Pressable role={radio ? "radio" : "checkbox"} aria-checked={on} aria-disabled={off} disabled={off} onPress={press} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={[parsed.view, { opacity: off ? 0.5 : 1 }]}>
      <View style={{ width: 16, height: 16, flexShrink: 0, transform: [{ translateY: described ? 2 : 1.8 }], borderRadius: radio ? 9999 : 5, borderWidth: 1, borderColor: on ? colors.primary : "transparent", backgroundColor: on ? colors.primary : colors.input, alignItems: "center", justifyContent: "center" }}>
        {on ? radio ? <View style={{ width: dark ? 10 : 8, height: dark ? 10 : 8, borderRadius: 9999, backgroundColor: colors.primaryForeground }} /> : <CheckIcon size={14} color={colors.primaryForeground} /> : null}
      </View>
      <Div data-slot="questionnaire-choice-label" className={`flex flex-col flex-1 min-w-0 gap-1 text-sm ${className}`}>
        {Children.map(children, (child) => (typeof child === "string" ? <Span style={{ lineHeight: 19.25 }}>{child}</Span> : child))}
      </Div>
      {shortcut ? (
        <View style={{ width: 20, height: 20, flexShrink: 0, marginLeft: "auto", transform: [{ translateY: described ? 2 : 1.8 }], borderRadius: 9999, borderWidth: 1, borderColor: colors.primary + "1a", backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
          <Span style={{ fontFamily: fonts.mono, fontSize: 10, lineHeight: 10, fontWeight: "500", color: colors.mutedForeground }}>{shortcut}</Span>
        </View>
      ) : null}
    </Pressable>
  )
}

export function QuestionnaireChoiceDescription({ className = "", ...props }: BoxProps) {
  return <Span data-slot="questionnaire-choice-description" {...props} className={`text-muted-foreground ${className}`} style={{ lineHeight: 19.25 }} />
}

/** A written answer. */
export function QuestionnaireInput({ className = "", placeholder, defaultValue, value, onChange, disabled, type, "aria-label": label }: { className?: string; placeholder?: string; defaultValue?: string; value?: string; onChange?: (event: { target: { value: string } }) => void; disabled?: boolean; type?: string; "aria-label"?: string }) {
  const item = useItem("QuestionnaireInput")
  const colors = useColors()
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (defaultValue) item.type(defaultValue)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const parsed = useTw(`h-9 min-h-11 w-full min-w-0 rounded-3xl border bg-input/50 px-3 py-1 text-base sm:min-h-0 md:text-sm ${item.invalid ? "border-destructive" : focused ? "border-ring" : "border-transparent"} ${className}`)
  return (
    <TextInput
      accessibilityLabel={label}
      aria-invalid={item.invalid || undefined}
      value={value ?? item.text}
      editable={!disabled && !item.disabled}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      secureTextEntry={type === "password"}
      keyboardType={type === "email" ? "email-address" : type === "number" ? "numeric" : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChangeText={(text) => {
        onChange?.({ target: { value: text } })
        item.type(text)
      }}
      style={[parsed.view as object, { color: colors.foreground, fontFamily: fonts.sans, fontSize: (parsed.text.fontSize as number) ?? 14, opacity: disabled ? 0.5 : 1 }]}
    />
  )
}

/** Shown when the question can't be left as it is. */
export function QuestionnaireError({ className = "", children, ...props }: BoxProps) {
  const item = useItem("QuestionnaireError")
  if (!item.invalid) return null
  return (
    <Span data-slot="questionnaire-error" role="alert" {...props} className={`mt-2 text-sm text-destructive ${className}`}>
      {children ?? (item.required ? "Choose an answer to continue." : "Choose an answer or skip this question.")}
    </Span>
  )
}

/** The buttons' row: Previous on the left, Skip and Next (or Submit) on the right. */
export function QuestionnaireActions({ className = "", children, ...props }: BoxProps) {
  const parts = Children.toArray(children).filter(isValidElement) as ReactElement[]
  const left = parts.filter((p) => p.type === QuestionnairePrevious)
  const right = parts.filter((p) => p.type !== QuestionnairePrevious)
  return (
    <Div data-slot="questionnaire-actions" {...props} className={`flex flex-row w-full min-h-11 sm:min-h-9 items-center gap-2 ${className}`}>
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row" }}>{left}</View>
      {right}
    </Div>
  )
}

type NavProps = { children?: ReactNode; className?: string; size?: ButtonSize; variant?: ButtonVariant; disabled?: boolean; onClick?: (event: unknown) => void }

function Nav({ visible, fallback, action, children, className = "", size = "default", variant, disabled, onClick, slot }: NavProps & { visible: boolean; fallback: string; action: () => void; slot: string }) {
  if (!visible) return null
  return (
    <Button data-slot={slot} size={size} variant={variant} disabled={disabled} className={className} onClick={(event: unknown) => (onClick?.(event), action())}>
      {children ?? fallback}
    </Button>
  )
}

export function QuestionnairePrevious({ variant = "outline", ...props }: NavProps) {
  const root = useRoot("QuestionnairePrevious")
  return <Nav {...props} variant={variant} slot="questionnaire-previous" visible={root.total > 1 && !root.first} fallback="Previous" action={root.goPrevious} />
}
export function QuestionnaireSkip({ variant = "outline", ...props }: NavProps) {
  const root = useRoot("QuestionnaireSkip")
  return <Nav {...props} variant={variant} slot="questionnaire-skip" visible={root.activeRequired === false} fallback="Skip" action={root.skip} />
}
export function QuestionnaireNext({ variant = "default", ...props }: NavProps) {
  const root = useRoot("QuestionnaireNext")
  return <Nav {...props} variant={variant} slot="questionnaire-next" visible={root.total > 1 && !root.last} fallback="Next" action={root.goNext} />
}
export function QuestionnaireSubmit({ variant = "default", ...props }: NavProps) {
  const root = useRoot("QuestionnaireSubmit")
  return <Nav {...props} variant={variant} slot="questionnaire-submit" visible={root.total > 0 && root.last} fallback="Submit" action={root.submit} />
}
