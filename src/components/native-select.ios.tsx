import * as Picker from "./select.ios"
import { nativeSelect } from "./native-select.native"

export { nativeSelect, NativeSelectOptGroup, NativeSelectOption, type NativeSelectProps, type SelectKit } from "./native-select.native"

/**
 * iOS: the browser's <select> is, on iOS, SwiftUI's Picker in its menu style
 * (Expo UI, through select.ios.tsx) when the options are text; else drawn.
 */
export const NativeSelect = nativeSelect(Picker)
