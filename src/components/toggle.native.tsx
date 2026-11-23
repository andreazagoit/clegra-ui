import { useContext, useMemo, useState, type ReactNode } from "react"
import { Pressable, type ViewStyle } from "react-native"

import { IconContext } from "../native/icon-context"
import { Span } from "../primitives.native"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

export type ToggleVariant = "default" | "outline"
export type ToggleSize = "default" | "sm" | "lg"

const sizes: Record<ToggleSize, string> = { default: "h-9 min-w-9 px-3", sm: "h-8 min-w-8 px-3", lg: "h-10 min-w-10 px-4" }

/** The web's toggle classes, as far as a native view shows them (pressed and hover add bg-muted). */
export function toggleVariants({ variant = "default", size = "default", className = "" }: { variant?: ToggleVariant | null; size?: ToggleSize | null; className?: string } = {}) {
  return `flex flex-row items-center justify-center gap-1 rounded-3xl text-sm font-medium ${variant === "outline" ? "border border-input" : ""} ${sizes[size ?? "default"]} ${className}`
}

export type ToggleProps = {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant | null
  size?: ToggleSize | null
  disabled?: boolean
  value?: string
  className?: string
  style?: ViewStyle
  children?: ReactNode
  "aria-label"?: string
}

/** shadcn's Toggle, drawn: a two-state button, muted when on. */
export function Toggle({ pressed, defaultPressed, onPressedChange, ...rest }: ToggleProps) {
  const [own, setOwn] = useState(Boolean(defaultPressed))
  const on = pressed ?? own
  return <ToggleView {...rest} on={on} onPress={() => (setOwn(!on), onPressedChange?.(!on))} />
}

/** The look alone, for the toggle group too. */
export function ToggleView({ on, onPress, variant = "default", size = "default", disabled, className = "", style, children, "aria-label": label }: Omit<ToggleProps, "pressed" | "defaultPressed" | "onPressedChange"> & { on: boolean; onPress: () => void }) {
  const [hover, setHover] = useState(false)
  const colors = useColors()
  const parsed = useTw(`${toggleVariants({ variant, size })}${on || (hover && !disabled) ? " bg-muted" : ""} ${className}`)
  const around = useContext(IconContext)
  const color = (parsed.text.color as string | undefined) ?? colors.foreground
  const icons = useMemo(() => ({ ...around, size: 16, color }), [around, color])
  return (
    <Pressable
      role="button"
      aria-pressed={on}
      aria-label={label}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[parsed.view, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <IconContext.Provider value={icons}>
        {(Array.isArray(children) ? children : [children]).map((child, index) =>
          typeof child === "string" || typeof child === "number" ? (
            <Span key={index} className="text-sm font-medium" style={{ color }}>
              {child}
            </Span>
          ) : (
            <Fragmentless key={index}>{child as ReactNode}</Fragmentless>
          ),
        )}
      </IconContext.Provider>
    </Pressable>
  )
}

const Fragmentless = ({ children }: { children: ReactNode }) => <>{children}</>
