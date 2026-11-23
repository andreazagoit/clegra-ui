import { Toggle as SwiftToggle } from "@expo/ui/swift-ui"
import { accessibilityLabel, controlSize, disabled as off, tint, toggleStyle } from "@expo/ui/swift-ui/modifiers"
import { useState } from "react"

import { iconOnly, ExpoHost, plainLabel } from "./expo-ui-controls"
import { useColors } from "./theme"
import { Toggle as Drawn, type ToggleProps } from "../components/toggle.native"

const sizes = { default: "regular", sm: "small", lg: "large" } as const

/**
 * iOS: SwiftUI's Toggle in its button style (Expo UI), highlighted when on,
 * in the system font, tinted with the app's accent. A text label, an icon
 * with an SF Symbol (native/sf-symbols.ts), or both. An icon without a
 * symbol, or other content, stays drawn (toggle.native.tsx).
 */
export function Toggle(props: ToggleProps) {
  const { pressed, defaultPressed, onPressedChange, disabled, size, children, "aria-label": aria } = props
  const colors = useColors()
  const [own, setOwn] = useState(Boolean(defaultPressed))
  const label = plainLabel(children)
  if (!label || (!label.text && !label.symbol)) return <Drawn {...props} />
  const on = pressed ?? own
  return (
    <ExpoHost matchContents>
      <SwiftToggle
        isOn={on}
        label={label.text || aria || ""}
        systemImage={label.symbol}
        onIsOnChange={(next) => (setOwn(next), onPressedChange?.(next))}
        modifiers={[toggleStyle("button"), controlSize(sizes[size ?? "default"]), tint(colors.primary), off(Boolean(disabled)), ...(label.text ? [] : [iconOnly]), ...(aria ? [accessibilityLabel(aria)] : [])]}
      />
    </ExpoHost>
  )
}
