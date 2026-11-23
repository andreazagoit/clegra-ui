import { textareaFor } from "../native/expo-ui-input"
import { Input } from "./input.ios"

/**
 * iOS: SwiftUI's TextField growing downward (axis vertical), `rows` lines at
 * least, as input.ios.tsx makes it. Read-only it is the drawn one
 * (textarea.native.tsx).
 */
export const Textarea = textareaFor(Input)
