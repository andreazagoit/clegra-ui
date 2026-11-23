import { useWindowDimensions } from "react-native"

import { useColors, useResolvedTheme } from "./theme"
import { tw } from "./tw"

/** `className` as styles, following the window's width and the theme. */
export function useTw(className?: string) {
  const { width } = useWindowDimensions()
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  return tw(className, { width, dark, colors })
}
