import { keyboardType, submitLabel, textContentType, textInputAutocapitalization } from "@expo/ui/swift-ui/modifiers"

import { inputFor, isPlainText, type Modifier } from "../native/expo-ui-input"
import type { InputProps } from "./input.native"

export type { InputProps } from "./input.native"

type Keyboard = Parameters<typeof keyboardType>[0]
type Content = Parameters<typeof textContentType>[0]
type Submit = Parameters<typeof submitLabel>[0]

const byType: Record<string, Keyboard> = { email: "email-address", number: "decimal-pad", tel: "phone-pad", url: "url", search: "web-search" }
const byMode: Record<string, Keyboard> = { email: "email-address", numeric: "numeric", decimal: "decimal-pad", tel: "phone-pad", url: "url", search: "web-search" }
const keyboards = new Set<string>(["default", "email-address", "numeric", "phone-pad", "ascii-capable", "numbers-and-punctuation", "url", "name-phone-pad", "decimal-pad", "twitter", "web-search", "ascii-capable-number-pad"])
const contentByType: Record<string, Content> = { email: "emailAddress", password: "password", tel: "telephoneNumber", url: "URL" }
const submits = new Set<string>(["continue", "done", "go", "join", "next", "return", "route", "search", "send"])
const caps = { none: "never", sentences: "sentences", words: "words", characters: "characters" } as const

/** What only iOS has: the software keyboard's type, capitalisation and return key, and the autofill content type. */
function iosModifiers({ type, inputMode, autoCapitalize, returnKeyType, ...props }: InputProps): Modifier[] {
  const keyboard = props.keyboardType && keyboards.has(props.keyboardType) ? (props.keyboardType as Keyboard) : (inputMode && byMode[inputMode]) || (type && byType[type])
  const content = (props.textContentType as Content | undefined) ?? (type ? contentByType[type] : undefined)
  const capital = autoCapitalize ? caps[autoCapitalize] : isPlainText(type) ? "never" : undefined
  return [
    ...(keyboard ? [keyboardType(keyboard)] : []),
    ...(content ? [textContentType(content)] : []),
    ...(capital ? [textInputAutocapitalization(capital)] : []),
    ...(returnKeyType && submits.has(returnKeyType) ? [submitLabel(returnKeyType as Submit)] : []),
  ]
}

/**
 * iOS: SwiftUI's TextField or SecureField (Expo UI), from
 * native/expo-ui-input.tsx, plus the keyboard, autofill, capitalisation and
 * return key that only iOS has. Read-only it is drawn (input.native.tsx).
 */
export const Input = inputFor(iosModifiers)
