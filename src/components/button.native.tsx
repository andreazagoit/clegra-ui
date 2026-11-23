import { useContext, useMemo, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"

import { useFormSubmit } from "../native/form-context"
import { IconContext } from "../native/icon-context"
import { Span } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
export type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

const looks: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-border bg-background",
  secondary: "bg-secondary text-secondary-foreground",
  ghost: "",
  destructive: "bg-destructive/10 text-destructive",
  link: "text-primary",
}
const hovers: Partial<Record<ButtonVariant, string>> = { default: "bg-primary/80", outline: "bg-muted", ghost: "bg-muted", secondary: "bg-secondary", destructive: "bg-destructive/10" }
const sizes: Record<ButtonSize, string> = {
  default: "h-9 gap-1.5 px-3",
  xs: "h-6 gap-1 px-2.5 text-xs",
  sm: "h-8 gap-1 px-3",
  lg: "h-10 gap-1.5 px-4",
  icon: "size-9",
  "icon-xs": "size-6",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
}

/** The same classes as @clegra/ui's web, as far as a native view can show them; a Link takes them (Link's `className`). */
export function buttonVariants({ variant = "default", size = "default", className = "" }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `flex flex-row shrink-0 items-center justify-center rounded-4xl border border-transparent text-sm font-medium ${looks[variant]} ${sizes[size]} ${className}`
}

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: any) => void
  render?: ReactElement
  children?: ReactNode
  title?: string
  /** With type="submit": sent with the form's fields, as on the web. */
  name?: string
  value?: string
  style?: ViewStyle
  "aria-label"?: string
  [key: `aria-${string}`]: unknown
  [key: `data-${string}`]: unknown
}

export function Button({ variant = "default", size = "default", className, disabled, onClick, render, children, style, "aria-label": label, type, name, value, ...props }: ButtonProps) {
  const [hover, setHover] = useState(false)
  const submit = useFormSubmit()
  const press = type === "submit" && submit ? () => submit(name ? [name, value ?? ""] : undefined) : onClick
  const classes = `${buttonVariants({ variant, size, className })}${hover && !disabled ? ` ${hovers[variant] ?? ""}` : ""}`
  const parsed = useTw(classes)
  const colors = useColors()
  const around = useContext(IconContext)
  const color = (parsed.text.color as string | undefined) ?? colors.foreground
  const icons = useMemo(() => ({ ...around, size: size === "xs" || size === "icon-xs" ? 12 : 16, color }), [around, size, color])
  if (parsed.hidden) return null
  // The web's bg-clip-padding: the fill stops inside the 1 px border, which stays the border's colour (or transparent).
  const { backgroundColor: fill, ...box } = parsed.view
  const content = (
    <IconContext.Provider value={icons}>
      {(Array.isArray(children) ? children : [children]).map((child, index) =>
        typeof child === "string" || typeof child === "number" ? (
          <Span key={index} className={`font-medium ${size === "xs" ? "text-xs" : "text-sm"}`} style={{ color }}>
            {child}
          </Span>
        ) : (
          <Fragmentless key={index}>{child as ReactNode}</Fragmentless>
        ),
      )}
    </IconContext.Provider>
  )
  return rendered(
    render,
    { className: classes, disabled, onClick: press },
    () => (
      <Pressable
        {...(props as object)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={press as never}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={[box, { opacity: disabled ? 0.5 : 1 }, style]}
      >
        {fill ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: fill, ...inner(parsed.view, style) }]} /> : null}
        {content}
      </Pressable>
    ),
    content,
  )
}

const corners = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"] as const

/** The fill's corners: the button's own (or those a group gives it), 1 px tighter inside the border. */
function inner(view: ViewStyle, style: ViewStyle | undefined) {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle
  const base = (flat.borderRadius ?? view.borderRadius ?? 0) as number
  return Object.fromEntries(corners.map((corner) => [corner, Math.max(0, ((flat[corner] ?? view[corner] ?? base) as number) - 1)]))
}

const Fragmentless = ({ children }: { children: ReactNode }) => <>{children}</>

