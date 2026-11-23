import { Toggle } from "@expo/ui/swift-ui"
import { accessibilityLabel, controlSize, disabled as off, labelsHidden, tint, toggleStyle } from "@expo/ui/swift-ui/modifiers"
import { useContext, useEffect, useRef, useState } from "react"

import { ExpoHost } from "./expo-ui-controls"
import { FormContext } from "./form-context"
import { useColors } from "./theme"

export type ToggleControlProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  /** What the Form gets under `name` when on. */
  value?: string
  size?: "sm" | "default"
  "aria-label"?: string
}

/**
 * SwiftUI's Toggle (Expo UI) without its label, tinted with the theme's
 * primary as the accent, in the system's switch style. `size` "sm" asks for
 * the small control size (iOS keeps one switch size). The value goes with the
 * Form under `name`.
 */
export function ToggleControl({ checked, defaultChecked, onCheckedChange, disabled, name, value = "on", size, "aria-label": label }: ToggleControlProps) {
  const colors = useColors()
  const form = useContext(FormContext)
  const [own, setOwn] = useState(Boolean(defaultChecked))
  const on = checked ?? own
  const latest = useRef(on)
  latest.current = on
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current ? value : []))
  }, [form, name, value])
  return (
    <ExpoHost matchContents>
      <Toggle
        isOn={on}
        onIsOnChange={(next) => {
          setOwn(next)
          onCheckedChange?.(next)
        }}
        modifiers={[toggleStyle("switch"), labelsHidden(), controlSize(size === "sm" ? "small" : "regular"), tint(colors.primary), off(Boolean(disabled)), ...(label ? [accessibilityLabel(label)] : [])]}
      />
    </ExpoHost>
  )
}
