import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Pressable, View } from "react-native"

import { FormContext } from "../native/form-context"
import { Div } from "../primitives.native"
import { useColors, useResolvedTheme } from "../native/theme"

type Ctx = { value: unknown; choose: (value: unknown) => void; disabled?: boolean }
const RadioCtx = createContext<Ctx | null>(null)

export type RadioGroupProps = {
  value?: unknown
  defaultValue?: unknown
  onValueChange?: (value: unknown) => void
  name?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  className?: string
  children?: ReactNode
  "aria-label"?: string
}

/** shadcn's RadioGroup, drawn: a column 12 px apart; its value goes with the form under `name`. */
export function RadioGroup({ value, defaultValue, onValueChange, name, disabled, readOnly, className = "", children, "aria-label": label }: RadioGroupProps) {
  const [own, setOwn] = useState<unknown>(defaultValue)
  const form = useContext(FormContext)
  const shown = value === undefined ? own : value
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current === undefined || latest.current === null ? [] : String(latest.current)))
  }, [form, name])
  return (
    <RadioCtx.Provider value={{ value: shown, disabled, choose: (next) => readOnly || (setOwn(next), onValueChange?.(next)) }}>
      <Div role="radiogroup" aria-label={label} className={`flex flex-col w-full gap-3 ${className}`}>
        {children}
      </Div>
    </RadioCtx.Provider>
  )
}
RadioGroup.slot = "radio-group"

/** A 16 px circle, input-coloured; chosen, primary with a dot of the primary's foreground (8 px, 10 in dark). */
export function RadioGroupItem({ value, disabled, className: _className, id: _id, "aria-label": label }: { value: unknown; disabled?: boolean; className?: string; id?: string; "aria-label"?: string }) {
  const group = useContext(RadioCtx)
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  const on = group?.value === value
  const off = disabled || group?.disabled
  return (
    <Pressable
      role="radio"
      aria-checked={on}
      aria-label={label}
      aria-disabled={off}
      disabled={off}
      hitSlop={{ left: 12, right: 12, top: 8, bottom: 8 }}
      onPress={() => group?.choose(value)}
      style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "transparent", backgroundColor: on ? colors.primary : withAlpha(colors.input, 0.9), alignItems: "center", justifyContent: "center", opacity: off ? 0.5 : 1, flexShrink: 0 }}
    >
      {on ? <View style={{ width: dark ? 10 : 8, height: dark ? 10 : 8, borderRadius: 5, backgroundColor: colors.primaryForeground }} /> : null}
    </Pressable>
  )
}

/** `bg-input/90`: the input colour at 90 % of its own alpha. */
function withAlpha(color: string, alpha: number) {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
  }
  const m = /rgba\((\d+),(\d+),(\d+),([\d.]+)\)/.exec(color.replace(/\s/g, ""))
  return m ? `rgba(${m[1]},${m[2]},${m[3]},${Number(m[4]) * alpha})` : color
}
