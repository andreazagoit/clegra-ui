import { Slider as SwiftSlider } from "@expo/ui/swift-ui"
import { accessibilityLabel, disabled as off, tint } from "@expo/ui/swift-ui/modifiers"
import { useState } from "react"

import { ExpoHost, useHostLayout } from "./expo-ui-controls"
import { useColors } from "./theme"
import { Slider as Drawn, type SliderProps } from "../components/slider.native"

const first = (v: number | number[] | undefined) => (Array.isArray(v) ? v[0] : v)

/**
 * iOS: SwiftUI's Slider (Expo UI), one thumb, tinted with the app's accent.
 * A range (two thumbs), which SwiftUI has no slider for, stays drawn
 * (slider.native.tsx).
 */
export function Slider(props: SliderProps) {
  const { value, defaultValue, min = 0, max = 100, step = 1, disabled, onValueChange, className, "aria-label": label } = props
  const colors = useColors()
  const layout = useHostLayout(`w-full ${className ?? ""}`)
  const [own, setOwn] = useState(first(defaultValue) ?? min)
  const given = value ?? defaultValue
  if (Array.isArray(given) && given.length > 1) return <Drawn {...props} />
  const shown = first(value) ?? own
  return (
    <ExpoHost matchContents={{ vertical: true }} style={layout.style}>
      <SwiftSlider
        value={shown}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => {
          setOwn(next)
          onValueChange?.(Array.isArray(given) ? [next] : next)
        }}
        modifiers={[tint(colors.primary), off(Boolean(disabled)), ...(label ? [accessibilityLabel(label)] : [])]}
      />
    </ExpoHost>
  )
}
