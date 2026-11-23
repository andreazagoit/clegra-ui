import { Image, Picker, Text } from "@expo/ui/swift-ui"
import { accessibilityLabel, disabled as off, labelsHidden, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, useContext, useEffect, useRef, useState, type ReactNode } from "react"

import { FormContext } from "./form-context"
import { ExpoHost, plainLabel } from "./expo-ui-controls"
import { ToggleGroup as Drawn, ToggleGroupItem, type ToggleGroupProps } from "../components/toggle-group.native"

type ItemProps = { value: string; children?: ReactNode; disabled?: boolean }

/**
 * iOS: a single-choice group is SwiftUI's segmented Picker (Expo UI), the
 * system's segmented control; each item is its text, or its icon's SF Symbol
 * (native/sf-symbols.ts). It can't be left with none chosen, which the web
 * allows. Several at once (`multiple`), a vertical group, a disabled item or
 * icons without a symbol stay drawn (toggle-group.native.tsx). The value goes
 * with the Form under `name`.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const { value, defaultValue, onValueChange, multiple, disabled, orientation, name, children, "aria-label": aria } = props
  const [own, setOwn] = useState<string[]>(defaultValue ?? [])
  const shown = value ?? own
  const form = useContext(FormContext)
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => latest.current)
  }, [form, name])
  const items = Children.toArray(children)
  const options = items.map((c) => {
    if (!isValidElement<ItemProps & { "aria-label"?: string }>(c) || c.type !== ToggleGroupItem || c.props.disabled) return null
    const label = plainLabel(c.props.children)
    return label && (label.text || label.symbol) ? { value: c.props.value, ...label } : null
  })
  if (multiple || orientation === "vertical" || !options.length || options.some((o) => !o)) return <Drawn {...props} />
  return (
    <ExpoHost matchContents>
      <Picker label={aria ?? ""} selection={shown[0] ?? null} onSelectionChange={(next: string) => (setOwn([next]), onValueChange?.([next]))} modifiers={[pickerStyle("segmented"), labelsHidden(), off(Boolean(disabled)), ...(aria ? [accessibilityLabel(aria)] : [])]}>
        {options.map((o) =>
          o!.text ? (
            <Text key={o!.value} modifiers={[tag(o!.value)]}>
              {o!.text}
            </Text>
          ) : (
            <Image key={o!.value} systemName={o!.symbol} modifiers={[tag(o!.value)]} />
          ),
        )}
      </Picker>
    </ExpoHost>
  )
}
