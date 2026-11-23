import { useContext, useEffect, useRef, useState } from "react"
import { TextInput, type TextInputProps } from "react-native"

import { FormContext } from "../native/form-context"
import { fonts, useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

export type InputProps = Omit<TextInputProps, "onChange" | "value" | "defaultValue" | "style" | "onFocus" | "onKeyDown"> & {
  type?: string
  name?: string
  value?: string
  defaultValue?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  min?: string
  max?: string
  id?: string
  list?: string
  rows?: number
  inputMode?: TextInputProps["inputMode"]
  className?: string
  style?: TextInputProps["style"]
  onChange?: (event: { target: { value: string } }) => void
  onFocus?: () => void
  onKeyDown?: (event: any) => void
  "aria-label"?: string
}

/** NSTextField and UITextField, through React Native's own text input. */
export function Input({ type, name, value, defaultValue, onChange, className = "", required: _required, readOnly, disabled, id: _id, list: _list, min: _min, max: _max, rows, style, "aria-label": label, onKeyDown: _onKeyDown, ...props }: InputProps) {
  const colors = useColors()
  const form = useContext(FormContext)
  const parsed = useTw(`h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm ${className}`)
  const [own, setOwn] = useState(defaultValue ?? "")
  const shown = value ?? own
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => latest.current)
  }, [form, name])
  return (
    <TextInput
      {...props}
      accessibilityLabel={label}
      value={shown}
      editable={!readOnly && !disabled}
      secureTextEntry={type === "password"}
      keyboardType={type === "email" ? "email-address" : undefined}
      multiline={rows !== undefined}
      placeholderTextColor={colors.mutedForeground}
      onChangeText={(text) => {
        setOwn(text)
        onChange?.({ target: { value: text } })
      }}
      style={[parsed.view as object, { color: colors.foreground, fontFamily: fonts.sans, fontSize: 14 }, style]}
    />
  )
}
