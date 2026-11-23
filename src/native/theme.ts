import { useSyncExternalStore } from "react"
import { Platform, useColorScheme } from "react-native"

import { colorsFor, type Colors } from "../tokens"

export * from "../tokens"

/** «Chiaro», «Scuro», «Sistema»: the client's choice, under the same key as next-themes. */
export type ThemeChoice = "light" | "dark" | "system"
const KEY = "theme"

const stored = (): ThemeChoice => {
  try {
    const value = localStorage.getItem(KEY)
    return value === "light" || value === "dark" ? value : "system"
  } catch {
    return "system"
  }
}

let choice: ThemeChoice | null = null
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export const themeChoice = () => (choice ??= stored())

export function setThemeChoice(next: ThemeChoice) {
  choice = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // no storage: it lasts as long as the app
  }
  for (const listener of listeners) listener()
}

export const useThemeChoice = () => useSyncExternalStore(subscribe, themeChoice, themeChoice)

/** The appearance in use: the person's choice, or the system's. */
export function useResolvedTheme(): "light" | "dark" {
  const system = useColorScheme()
  const chosen = useThemeChoice()
  return chosen === "system" ? (system === "dark" ? "dark" : "light") : chosen
}

/** The colours of the theme in use. */
export const useColors = (): Colors => colorsFor(useResolvedTheme())

/** Inter, as on the web; ui-monospace there is the system's mono here. */
export const fonts = {
  sans: Platform.select({ web: "'Inter Variable', ui-sans-serif, system-ui, sans-serif", default: "Inter" }),
  mono: Platform.select({ web: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", default: "Menlo" }),
}

