import { ToggleControl } from "../native/expo-ui-switch"
import type { SwitchProps } from "./switch.native"

export type { SwitchProps } from "./switch.native"

/** iOS: SwiftUI's Toggle (Expo UI) as the system's switch, in the theme's primary (native/expo-ui-switch.tsx). */
export function Switch(props: SwitchProps) {
  return <ToggleControl {...props} />
}
