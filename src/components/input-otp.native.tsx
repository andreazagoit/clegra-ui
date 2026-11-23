import { Children, createContext, isValidElement, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Animated, Platform, StyleSheet, TextInput, View } from "react-native"

import { FormContext } from "../native/form-context"
import { MinusIcon as Minus } from "lucide-react-native"
import { wrapIcon, type IconProps } from "../native/icons"
import type { ComponentType } from "react"
import { Div, Span, type BoxProps } from "../primitives.native"
import { fonts, useColors } from "../native/theme"

const MinusIcon = wrapIcon("MinusIcon", Minus as unknown as ComponentType<IconProps>)

type Slot = { char: string | null; isActive: boolean; hasFakeCaret: boolean }
type Ctx = { slots: Slot[]; invalid: boolean }

/** As the `input-otp` package's context: what each slot shows. */
export const OTPInputContext = createContext<Ctx>({ slots: [], invalid: false })
const PlaceCtx = createContext<{ first: boolean; last: boolean }>({ first: true, last: true })

export const REGEXP_ONLY_DIGITS = "^\\d+$"
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$"
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$"

export type InputOTPProps = {
  maxLength: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  pattern?: string | RegExp
  disabled?: boolean
  autoFocus?: boolean
  name?: string
  inputMode?: "numeric" | "text" | "decimal" | "tel" | "search" | "email" | "url"
  className?: string
  containerClassName?: string
  children?: ReactNode
  "aria-label"?: string
  "aria-invalid"?: boolean
}

/**
 * shadcn's InputOTP, drawn: one text field over the slots takes the keys (and,
 * on iOS, the code from a message: textContentType oneTimeCode); the slots
 * show its characters, the active one ringed with a blinking caret.
 */
export function InputOTP({ maxLength, value, defaultValue, onChange, onComplete, pattern, disabled, autoFocus, name, inputMode, containerClassName = "", children, "aria-label": label, "aria-invalid": invalid }: InputOTPProps) {
  const [own, setOwn] = useState(defaultValue ?? "")
  const [focused, setFocused] = useState(false)
  const shown = (value ?? own).slice(0, maxLength)
  const form = useContext(FormContext)
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => latest.current)
  }, [form, name])
  const re = pattern === undefined ? null : typeof pattern === "string" ? new RegExp(pattern) : pattern
  const digits = re?.source === REGEXP_ONLY_DIGITS
  const active = Math.min(shown.length, maxLength - 1)
  const slots: Slot[] = Array.from({ length: maxLength }, (_, i) => ({ char: shown[i] ?? null, isActive: focused && i === active, hasFakeCaret: focused && i === active && shown[i] === undefined }))
  return (
    <OTPInputContext.Provider value={{ slots, invalid: Boolean(invalid) }}>
      <Div className={`flex flex-row items-center ${containerClassName}`} style={{ opacity: disabled ? 0.5 : 1, alignSelf: "flex-start" }}>
        {children}
        <TextInput
          accessibilityLabel={label}
          value={shown}
          editable={!disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          caretHidden
          contextMenuHidden
          spellCheck={false}
          autoCorrect={false}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          inputMode={inputMode ?? (digits ? "numeric" : "text")}
          keyboardType={digits ? "number-pad" : "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => {
            const next = text.slice(0, maxLength)
            if (next && re && !re.test(next)) return
            setOwn(next)
            onChange?.(next)
            if (next.length === maxLength) onComplete?.(next)
          }}
          style={[StyleSheet.absoluteFill, styles.input, Platform.OS === "web" ? ({ outlineStyle: "none", caretColor: "transparent" } as object) : null]}
        />
      </Div>
    </OTPInputContext.Provider>
  )
}

export function InputOTPGroup({ className = "", children }: BoxProps) {
  const items = Children.toArray(children).filter(isValidElement)
  return (
    <Div className={`flex flex-row items-center rounded-3xl ${className}`}>
      {items.map((child, index) => (
        <PlaceCtx.Provider key={child.key ?? index} value={{ first: index === 0, last: index === items.length - 1 }}>
          {child}
        </PlaceCtx.Provider>
      ))}
    </Div>
  )
}

/** size-9, input-coloured, bordered top, bottom and right (left too on the first); rounded ends; ring when active. */
export function InputOTPSlot({ index, className = "" }: BoxProps & { index: number }) {
  const { slots, invalid } = useContext(OTPInputContext)
  const place = useContext(PlaceCtx)
  const colors = useColors()
  const slot = slots[index]
  const r = 30.8
  const border = invalid ? colors.destructive : slot?.isActive ? colors.mutedForeground : colors.input
  return (
    <Div
      className={`flex items-center justify-center size-9 bg-input/50 text-sm ${className}`}
      style={{ borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderLeftWidth: place.first ? 1 : 0, borderColor: border, borderTopLeftRadius: place.first ? r : 0, borderBottomLeftRadius: place.first ? r : 0, borderTopRightRadius: place.last ? r : 0, borderBottomRightRadius: place.last ? r : 0, zIndex: slot?.isActive ? 10 : 0, ...(slot?.isActive ? { boxShadow: `0 0 0 3px ${colors.ring}` } : {}) }}
    >
      {slot?.char ? <Span style={{ fontFamily: fonts.sans }}>{slot.char}</Span> : null}
      {slot?.hasFakeCaret ? <Caret /> : null}
    </Div>
  )
}

function Caret() {
  const colors = useColors()
  const blink = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: false }), Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: false })]))
    loop.start()
    return () => loop.stop()
  }, [blink])
  return <Animated.View style={{ width: 1, height: 16, backgroundColor: colors.foreground, opacity: blink }} />
}

export function InputOTPSeparator() {
  return (
    <View role="separator" style={{ alignItems: "center" }}>
      <MinusIcon size={16} />
    </View>
  )
}

const styles = StyleSheet.create({
  // Over the slots, invisible: it takes the touches and the keys.
  input: { opacity: 0, color: "transparent", fontSize: 1 },
})
