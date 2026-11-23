import { Children, createContext, isValidElement, startTransition, useContext, useEffect, useMemo, useRef, type ReactNode } from "react"

import { FormContext, SubmitContext, useFormFields } from "./native/form-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select.native"
import { Pressable, Text as RNText, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native"

import { IconContext } from "./native/icon-context"
import { fonts, useColors } from "./native/theme"
import { type as typeScale } from "./tokens"
import { truncates } from "./native/tw"
import { useTw } from "./native/use-tw"

/**
 * HTML's elements for the pages ported from Clegra's web app: `<div className="…">`
 * becomes `<Div className="…">`. On the web they are the real elements
 * (primitives.web.tsx), so Tailwind applies; here the classes become styles.
 * Text inherits as in CSS: a box's text classes reach the text inside it.
 */
export type BoxProps = {
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
  children?: ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the DOM's event on the web, nothing on React Native
  onClick?: (event: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyDown?: (event: any) => void
  /** Anything else of the element (`ref`, `htmlFor`, `onKeyDown`, aria-*, data-*): the web's; ignored where it means nothing. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const TextStyleContext = createContext<TextStyle>({})

/** Neighbouring bits of text are one text: `dal {date}` is a single line. */
function runs(children: ReactNode) {
  const out: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") return
    const text = typeof child === "string" || typeof child === "number" ? String(child) : null
    if (text !== null && typeof out.at(-1) === "string") out[out.length - 1] = `${out.at(-1) as string}${text}`
    else out.push(text ?? child)
  })
  return out
}

/** Strings can't sit directly in a View. */
function Wrapped({ children, numberOfLines }: { children: ReactNode; numberOfLines?: number }) {
  return (
    <>
      {runs(children).map((run, index) => (typeof run === "string" ? <Inline key={index} numberOfLines={numberOfLines}>{run}</Inline> : run))}
    </>
  )
}

function Inline({ children, numberOfLines, style, testID }: { children: ReactNode; numberOfLines?: number; style?: StyleProp<TextStyle>; testID?: string }) {
  const inherited = useContext(TextStyleContext)
  const colors = useColors()
  return (
    <RNText numberOfLines={numberOfLines} testID={testID} style={[typeScale.sm, { color: colors.foreground, fontFamily: fonts.sans }, inherited, style]}>
      {children}
    </RNText>
  )
}

const hasBlock = (children: ReactNode): boolean =>
  Children.toArray(children).some((child) => isValidElement(child) && (child.type === Div || (child.type as { block?: boolean }).block))

export function Div({ className, style, children, onClick, ...props }: BoxProps) {
  const parsed = useTw(className)
  const inherited = useContext(TextStyleContext)
  const text = useMemo(() => ({ ...inherited, ...parsed.text }), [inherited, parsed.text])
  const icons = useMemo(() => (parsed.icon?.color ? { color: parsed.icon.color } : {}), [parsed.icon?.color])
  if (parsed.hidden) return null
  // Columns of a grid: its gap as padding, so they add up to the width.
  const gap = (parsed.view.gap as number | undefined) ?? 0
  const cells = parsed.grid
    ? Children.toArray(children).map((child, index) => (
        <View key={index} style={{ width: `${100 / parsed.grid!}%`, padding: gap / 2 }}>
          {child}
        </View>
      ))
    : children
  const box: ViewStyle = parsed.grid ? { ...parsed.view, flexDirection: "row", flexWrap: "wrap", gap: 0, margin: -gap / 2 } : parsed.view
  const content = (
    <TextStyleContext.Provider value={text}>
      <IconContext.Provider value={icons}>
        <Wrapped numberOfLines={truncates(className) ? 1 : undefined}>{cells}</Wrapped>
      </IconContext.Provider>
    </TextStyleContext.Provider>
  )
  if (onClick)
    return (
      <Pressable {...(props as object)} onPress={onClick as never} style={[box, style as ViewStyle]}>
        {content}
      </Pressable>
    )
  return (
    <View {...(props as object)} style={[box, style as ViewStyle]}>
      {content}
    </View>
  )
}

/** Text; a flex class, or a box inside, makes it a box (a `<span className="flex …">`). */
/** Inline text. `numberOfLines` (React Native's) wins over `truncate`/`line-clamp` in `className`, so a name ends in «…» instead of wrapping out of its box. */
export function Span({ className, style, children, onClick, numberOfLines, ...props }: BoxProps & { numberOfLines?: number }) {
  const parsed = useTw(className)
  if (parsed.hidden) return null
  if (parsed.view.display === "flex" || hasBlock(children))
    return (
      <Div className={className} style={style} onClick={onClick} {...props}>
        {children}
      </Div>
    )
  return (
    <Inline numberOfLines={numberOfLines ?? (truncates(className) ? 1 : undefined)} testID={props.testID as string | undefined} style={[parsed.text, style as TextStyle, parsed.view as TextStyle]}>
      {children}
    </Inline>
  )
}
Span.block = false

export const P = Span
export const Label = Span
export const Strong = (props: BoxProps) => <Span {...props} className={`font-semibold ${props.className ?? ""}`} />
export const Code = (props: BoxProps) => <Span {...props} className={`font-mono ${props.className ?? ""}`} />
export const Kbd = Span
export const H1 = (props: BoxProps) => <Span {...props} role="heading" aria-level={1} />
export const H2 = (props: BoxProps) => <Span {...props} role="heading" aria-level={2} />
export const H3 = (props: BoxProps) => <Span {...props} role="heading" aria-level={3} />
export const Section = Div
export const Aside = Div
export const Nav = Div
export const Header = Div
export const Main = Div
export const Ul = Div
export const Li = Div
export const Dl = Div
export const Dt = Span
export const Dd = Div
export const SpanBox = Div

/** A bare <input>: no border of its own, the box around it draws one. */
export function RawInput({ value, onChange, placeholder, className, type: _type, autoFocus, ...props }: { value?: string; onChange?: (event: { target: { value: string } }) => void; placeholder?: string; className?: string; type?: string; autoFocus?: boolean; onKeyDown?: (event: any) => void; [key: string]: unknown }) {
  const parsed = useTw(className)
  const colors = useColors()
  return <TextInput autoFocus={autoFocus} value={value} placeholder={placeholder} accessibilityLabel={props["aria-label"] as string | undefined} placeholderTextColor={colors.mutedForeground} onChangeText={(text) => onChange?.({ target: { value: text } })} style={[parsed.view as object, { color: colors.foreground, fontFamily: fonts.sans, fontSize: 14 }]} />
}

/** `<input type="hidden">`: a value for the form around it. */
export function HiddenField({ name, value }: { name: string; value: string }) {
  const form = useContext(FormContext)
  const latest = useRef(value)
  latest.current = value
  useEffect(() => form?.register(name, () => latest.current), [form, name])
  return null
}

export const Datalist = (_: { id?: string; children?: ReactNode }) => null

type OptionProps = { value?: string; children?: ReactNode }
export const Option = (_: OptionProps) => null

/** `<select>`: its <Option> children become the package's Select. */
export function SelectEl({ value, defaultValue, onChange, name, required, children, className, "aria-label": label }: { value?: string; defaultValue?: string; onChange?: (event: { target: { value: string } }) => void; name?: string; required?: boolean; id?: string; className?: string; children?: ReactNode; "aria-label"?: string }) {
  const options = Children.toArray(children).flatMap((child) => (isValidElement<OptionProps>(child) && child.type === Option ? [child.props] : isValidElement<{ children?: ReactNode }>(child) ? Children.toArray(child.props.children).filter(isValidElement).map((c) => (c as { props: OptionProps }).props) : []))
  return (
    <Select value={value} defaultValue={defaultValue} name={name} required={required} items={options.map((o) => ({ value: o.value ?? "", label: o.children }))} onValueChange={(next: never) => onChange?.({ target: { value: next } })}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value ?? ""} value={o.value ?? ""}>
            {o.children}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const TableEl = Div
export const Thead = Div
export const Tbody = Div
export const Tr = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row ${className}`} />
export const Th = ({ className = "", style, ...props }: BoxProps) => <Div {...props} className={className} style={[{ flex: 1 }, style]} />
export const Td = Th

/** A plain <button>, styled by its classes (not the design's Button). */
export const Btn = Div

/**
 * `<form>`: the fields inside are read at submit into a FormData, as a browser
 * does, and given to `onSubmit`; a <Button type="submit"> inside submits it.
 */
export function Form({ action, onSubmit, className, role, children }: { action?: (data: FormData) => unknown; onSubmit?: (event: { preventDefault: () => void; currentTarget: { reset: () => void; elements?: never }; formData: FormData }) => void; className?: string; role?: string; children?: ReactNode }) {
  const fields = useFormFields(children)
  const submit = (submitter?: [string, string]) => {
    const data = new FormData()
    for (const [name, value] of fields.values()) data.append(name, value)
    if (submitter) data.append(...submitter)
    onSubmit?.({ preventDefault: () => {}, currentTarget: { reset: () => {} }, formData: data })
    if (action) startTransition(() => void action(data))
  }
  return (
    <FormContext.Provider value={fields}>
      <SubmitContext.Provider value={submit}>
        <Div role={role} className={className}>
          {children}
        </Div>
      </SubmitContext.Provider>
    </FormContext.Provider>
  )
}

export { Checkbox } from "./native/checkbox-el"
export { useFormSubmit } from "./native/form-context"
