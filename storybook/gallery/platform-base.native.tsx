import { Platform } from "react-native"

/** What every case gets in a React Native app: the same as the drawn side, with this platform's toaster. */
export * from "@clegra/ui/react-native/primitives"
export { toast } from "@clegra/ui/native/toast"
export { icons } from "./icons.native"

/** In an app both sides share one toast store: the drawn side's Toaster shows them, once. */
export const Toaster = () => null

/** The theme follows setThemeChoice (native/theme.ts) alone. */
export function applyTheme(_dark: boolean) {}

const names: Record<string, string> = { ios: "iOS (Expo UI where there is one)", android: "Android" }
export const platformName = names[Platform.OS] ?? Platform.OS
