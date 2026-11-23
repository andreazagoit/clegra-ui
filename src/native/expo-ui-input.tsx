import { SecureField, TextField, useNativeState, type CommonViewModifierProps, type SecureFieldProps, type TextFieldProps } from "@expo/ui/swift-ui"
import { accessibilityLabel, autocorrectionDisabled, disabled as off, lineLimit, onSubmit, textFieldStyle } from "@expo/ui/swift-ui/modifiers"
import { useContext, useEffect, useRef, type ReactNode } from "react"

import { Input as Drawn, type InputProps } from "../components/input.native"
import { Textarea as DrawnTextarea } from "../components/textarea.native"
import { fillWidth, ExpoHost, useHostLayout } from "./expo-ui-controls"
import { FormContext } from "./form-context"

export type Modifier = NonNullable<CommonViewModifierProps["modifiers"]>[number]

/** The iOS-only modifiers (keyboard, autofill, capitalisation, return key), from the field's props. */
export type PlatformInputModifiers = (props: InputProps) => Modifier[]

/** Props the SwiftUI field can't keep, so the drawn one is used (input.native.tsx). */
const staysDrawn = (props: InputProps) => Boolean(props.readOnly) || props.secureTextEntry !== undefined || props.multiline !== undefined

/** Plain text that the system shouldn't correct (email, URL, password). */
export const isPlainText = (type?: string) => type === "email" || type === "url" || type === "password"

/**
 * SwiftUI's TextField (Expo UI) in the system's rounded border, or its
 * SecureField for type="password"; with `rows` (Textarea) it grows downward.
 * The text lives in a native state (useNativeState): a changed `value` is
 * written into it, typing reports through onTextChange. maxLength is the
 * field's own. The value goes with the Form under `name`. A read-only field
 * stays drawn (input.native.tsx), as does an Input inside an InputGroup
 * (input-group uses the drawn one). `platform` adds the keyboard, autofill,
 * capitalisation and return key modifiers (input.ios.tsx).
 */
export function inputFor(platform: PlatformInputModifiers) {
  return function Input(props: InputProps) {
    const { type, name, value, defaultValue, onChange, onChangeText, placeholder, disabled, editable, maxLength, autoFocus, rows, className, style, onFocus, onBlur, onSubmitEditing, autoCorrect, "aria-label": label } = props
    const form = useContext(FormContext)
    const layout = useHostLayout(`w-full ${className ?? ""}`, style as never)
    const text = useRef(value ?? defaultValue ?? "")
    const state = useNativeState(text.current)
    useEffect(() => {
      if (value === undefined || value === text.current) return
      text.current = value
      state.set(value)
    }, [state, value])
    useEffect(() => {
      if (!name || !form) return
      return form.register(name, () => text.current)
    }, [form, name])
    if (staysDrawn(props)) return <Drawn {...props} />
    if (layout.hidden) return null
    const onTextChange = (next: string) => {
      text.current = next
      onChangeText?.(next)
      onChange?.({ target: { value: next } })
    }
    const onFocusChange = (focused: boolean) => (focused ? onFocus?.() : onBlur?.({} as never))
    const modifiers: Modifier[] = [
      textFieldStyle("roundedBorder"),
      fillWidth,
      off(Boolean(disabled) || editable === false),
      ...(label ? [accessibilityLabel(label)] : []),
      ...(autoCorrect === false || (autoCorrect === undefined && isPlainText(type)) ? [autocorrectionDisabled()] : []),
      ...(onSubmitEditing ? [onSubmit(() => onSubmitEditing({ nativeEvent: { text: text.current } } as never))] : []),
      ...(rows !== undefined ? [lineLimit({ min: rows, max: Math.max(rows, 10) })] : []),
      ...platform(props),
    ]
    if (type === "password") {
      const field: SecureFieldProps = { text: state, placeholder, autoFocus, maxLength, onTextChange, onFocusChange, modifiers }
      return (
        <ExpoHost matchContents={{ vertical: true }} style={layout.style}>
          <SecureField {...field} />
        </ExpoHost>
      )
    }
    const field: TextFieldProps = { text: state, placeholder, autoFocus, maxLength, onTextChange, onFocusChange, axis: rows !== undefined ? "vertical" : "horizontal", modifiers }
    return (
      <ExpoHost matchContents={{ vertical: true }} style={layout.style}>
        <TextField {...field} />
      </ExpoHost>
    )
  }
}

/** Textarea: the platform's Input growing downward (axis vertical), `rows` lines at least; drawn when the Input would be. */
export function textareaFor(Input: (props: InputProps) => ReactNode) {
  return function Textarea({ rows = 3, ...props }: InputProps) {
    if (staysDrawn(props)) return <DrawnTextarea {...props} rows={rows} />
    return <Input {...props} rows={rows} />
  }
}
