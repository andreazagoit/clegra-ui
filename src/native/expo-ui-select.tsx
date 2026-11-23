import { Picker, Text } from "@expo/ui/swift-ui"
import { disabled as off, labelsHidden, pickerStyle, tag, tint } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, useContext, useEffect, useRef, useState, type ReactNode } from "react"

import { ExpoHost } from "./expo-ui-controls"
import { FormContext } from "./form-context"
import { useColors } from "./theme"
import { Select as Drawn, SelectContent, SelectGroup, SelectItem } from "../components/select.native"

type Value = string | number
type Option = { value: Value; label: string }
type SelectProps = Parameters<typeof Drawn>[0]

const isValue = (v: unknown): v is Value => typeof v === "string" || typeof v === "number"

/** The options, when every one is a plain value with a text label; else null. */
function optionsOf(items: SelectProps["items"], children: ReactNode): Option[] | null {
  if (items) return items.every((i) => isValue(i.value) && typeof i.label === "string") ? (items as Option[]) : null
  const found: Option[] = []
  const walk = (nodes: ReactNode): boolean =>
    Children.toArray(nodes).every((child) => {
      if (!isValidElement<{ value?: unknown; children?: ReactNode }>(child)) return true
      if (child.type === SelectItem) return isValue(child.props.value) && typeof child.props.children === "string" ? (found.push({ value: child.props.value, label: child.props.children }), true) : false
      if (child.type === SelectContent || child.type === SelectGroup) return walk(child.props.children)
      return true
    })
  return walk(children) && found.length ? found : null
}

/**
 * iOS: SwiftUI's Picker in its menu style (Expo UI), the system's pop-up list,
 * when the options are plain values with text labels. Anything richer (icons
 * in items, object values) stays drawn (select.native.tsx).
 */
export function Select(props: SelectProps) {
  const { value, defaultValue, onValueChange, items, disabled, name, children } = props
  const colors = useColors()
  const form = useContext(FormContext)
  const [own, setOwn] = useState<unknown>(defaultValue ?? null)
  const shown = value ?? own
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => String(latest.current ?? ""))
  }, [form, name])
  const options = optionsOf(items, children)
  if (!options) return <Drawn {...props} />
  return (
    <ExpoHost matchContents>
      <Picker
        label=""
        selection={isValue(shown) ? shown : undefined}
        onSelectionChange={(next: Value) => {
          setOwn(next)
          onValueChange?.(next as never)
        }}
        modifiers={[pickerStyle("menu"), labelsHidden(), tint(colors.primary), off(Boolean(disabled))]}
      >
        {options.map((option) => (
          <Text key={String(option.value)} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </ExpoHost>
  )
}
