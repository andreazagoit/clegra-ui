import { Children, cloneElement, createContext, isValidElement, useContext, type ReactNode } from "react"
import { View } from "react-native"

import { Div, Span, type BoxProps } from "../primitives.native"
import { useColors } from "../native/theme"
import { Label } from "./label.native"

type Orientation = "vertical" | "horizontal" | "responsive"
const FieldCtx = createContext<{ orientation: Orientation; invalid: boolean; disabled: boolean } | null>(null)

/** `leading-snug` and `leading-normal` on text-sm. */
const snug = { lineHeight: 19.25 }
const normal = { lineHeight: 21 }

/**
 * A fieldset: its children 24 px apart (12 for a radio group). The legend is
 * not one of them, as in the browser: it sits 12 px above, and a description
 * right after it 6 px closer.
 */
export function FieldSet({ className = "", children, ...props }: BoxProps) {
  const items = Children.toArray(children)
  const radios = items.some((c) => isValidElement(c) && (c.type as { slot?: string }).slot === "radio-group")
  const legend = isValidElement(items[0]) && items[0].type === FieldLegend ? items[0] : null
  const rest = legend ? items.slice(1) : items
  const lifted = rest.map((c, i) => (i === 0 && legend && isValidElement<BoxProps>(c) && c.type === FieldDescription ? cloneElement(c, { style: [{ marginTop: -6 }, c.props.style] }) : c))
  return (
    <Div {...props} role="group" className={`flex flex-col ${className}`}>
      {legend}
      <Div className={`flex flex-col ${radios ? "gap-3" : "gap-6"}`}>{lifted}</Div>
    </Div>
  )
}

export const FieldLegend = ({ className = "", variant = "legend", ...props }: BoxProps & { variant?: "legend" | "label" }) => <Div {...props} className={`mb-3 font-medium ${variant === "label" ? "text-sm" : "text-base"} ${className}`} />

export const FieldGroup = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex w-full flex-col gap-7 ${className}`} />

/** shadcn's Field: a label, its control, description and error, in a column or a row. `responsive` is a column here (no container queries). */
export function Field({ className = "", orientation = "vertical", children, style, ...props }: BoxProps & { orientation?: Orientation }) {
  const invalid = props["data-invalid"] === true || props["data-invalid"] === "true"
  const disabled = props["data-disabled"] === true || props["data-disabled"] === "true"
  const row = orientation === "horizontal"
  return (
    <FieldCtx.Provider value={{ orientation, invalid, disabled }}>
      <Div {...props} role="group" className={`flex w-full gap-3 ${row ? "flex-row items-center" : "flex-col"} ${invalid ? "text-destructive" : ""} ${className}`} style={style}>
        {children}
      </Div>
    </FieldCtx.Provider>
  )
}

export const FieldContent = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-1 flex-col gap-1 ${className}`} />

/** The label: grows to fill a horizontal field, as `*:data-[slot=field-label]:flex-auto` does. */
export function FieldLabel({ className = "", style, ...props }: BoxProps & { htmlFor?: string }) {
  const field = useContext(FieldCtx)
  const grow = field?.orientation === "horizontal"
  return <Label {...props} className={`gap-2 ${field?.disabled ? "opacity-50" : ""} ${className}`} style={[snug, grow ? { flex: 1 } : { alignSelf: "flex-start" }, style]} />
}

export function FieldTitle({ className = "", ...props }: BoxProps) {
  const field = useContext(FieldCtx)
  return <Div {...props} className={`flex flex-row items-center gap-2 text-sm font-medium ${field?.disabled ? "opacity-50" : ""} ${className}`} style={{ alignSelf: "flex-start" }} />
}

export const FieldDescription = ({ className = "", style, ...props }: BoxProps) => <Span {...props} className={`text-left text-sm font-normal text-muted-foreground ${className}`} style={[normal, style]} />

/** A line with, optionally, a word in the middle on the page's background. */
export function FieldSeparator({ className = "", children }: BoxProps) {
  const colors = useColors()
  return (
    <Div className={`relative -my-2 h-5 text-sm ${className}`} style={{ justifyContent: "center" }}>
      <View style={{ position: "absolute", left: 0, right: 0, top: 10, height: 1, backgroundColor: colors.border }} />
      {children ? (
        <View style={{ alignSelf: "center", backgroundColor: colors.background, paddingHorizontal: 8 }}>
          <Span className="text-muted-foreground">{children}</Span>
        </View>
      ) : null}
    </Div>
  )
}

/** The field's errors: `children`, or the messages of `errors` (one line, or a list when more). */
export function FieldError({ className = "", children, errors, ...props }: BoxProps & { errors?: Array<{ message?: string } | undefined> }) {
  const unique = [...new Map((errors ?? []).map((e) => [e?.message, e])).values()].filter((e) => e?.message)
  const content = children ?? (unique.length === 1 ? unique[0]!.message : unique.length ? (
    <Div className="ml-4 flex flex-col gap-1">
      {unique.map((e, i) => (
        <Span key={i}>{`• ${e!.message}`}</Span>
      ))}
    </Div>
  ) : null)
  if (!content) return null
  return (
    <Div {...props} role="alert" className={`text-sm font-normal text-destructive ${className}`}>
      {content}
    </Div>
  )
}
