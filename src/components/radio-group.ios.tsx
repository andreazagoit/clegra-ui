import { Picker, Text } from "@expo/ui/swift-ui"
import { accessibilityLabel, disabled as off, labelsHidden, pickerStyle, tag, tint } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, useContext, useEffect, useRef, useState, type ReactNode } from "react"

import { FormContext } from "../native/form-context"
import { ExpoHost, useHostLayout } from "../native/expo-ui-controls"
import { useColors } from "../native/theme"
import { RadioGroup as Drawn, RadioGroupItem, type RadioGroupProps } from "./radio-group.native"

export { RadioGroupItem, type RadioGroupProps } from "./radio-group.native"

type Value = string | number
type Option = { value: Value; label: string }
type Props = Record<string, unknown> & { children?: ReactNode }

const kids = (nodes: ReactNode) => Children.toArray(nodes)
const holdsItem = (node: ReactNode): boolean => isValidElement<Props>(node) && (node.type === RadioGroupItem || kids(node.props.children).some(holdsItem))
const texts = (node: ReactNode): string[] => (typeof node === "string" || typeof node === "number" ? [String(node).trim()].filter(Boolean) : isValidElement<Props>(node) ? kids(node.props.children).flatMap(texts) : [])

/**
 * The options, when each item is a plain value with one text beside it (the
 * Label or FieldLabel next to it, or its aria-label) and nothing else (no
 * descriptions, no disabled items); else null.
 */
function optionsOf(children: ReactNode): Option[] | null {
  const found: Option[] = []
  const walk = (nodes: ReactNode): boolean => {
    const list = kids(nodes)
    const items = list.filter((n) => isValidElement<Props>(n) && n.type === RadioGroupItem) as { props: Props }[]
    const others = list.filter((n) => !(isValidElement(n) && n.type === RadioGroupItem))
    for (const item of items) {
      const value = item.props.value
      if ((typeof value !== "string" && typeof value !== "number") || item.props.disabled) return false
      const beside = items.length === 1 ? others.flatMap(texts) : []
      const label = (item.props["aria-label"] as string | undefined) ?? (beside.length === 1 ? beside[0] : undefined)
      if (!label || (items.length === 1 && beside.length > 1)) return false
      found.push({ value, label })
    }
    if (items.length) return others.every((n) => !holdsItem(n))
    return others.filter(holdsItem).every((n) => walk((n as { props: Props }).props.children))
  }
  return walk(children) && found.length ? found : null
}

/**
 * iOS: SwiftUI has no radio buttons (no radio-group picker style on iOS),
 * so a group of text options is SwiftUI's Picker (Expo UI): segmented,
 * every option in sight as on the web, when there are up to four short
 * labels; else the menu style, the system's pop-up list. Items with
 * descriptions or other content beside them, disabled items, or a read-only
 * group stay drawn (radio-group.native.tsx). The value goes with the Form
 * under `name`.
 */
export function RadioGroup(props: RadioGroupProps) {
  const { value, defaultValue, onValueChange, name, disabled, readOnly, className, children, "aria-label": aria } = props
  const colors = useColors()
  const form = useContext(FormContext)
  const layout = useHostLayout(className)
  const [own, setOwn] = useState<unknown>(defaultValue)
  const shown = value === undefined ? own : value
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current === undefined || latest.current === null ? [] : String(latest.current)))
  }, [form, name])
  const options = optionsOf(children)
  if (!options || readOnly) return <Drawn {...props} />
  const segmented = options.length <= 4 && options.every((o) => o.label.length <= 20)
  return (
    <ExpoHost matchContents={segmented ? { vertical: true } : true} style={segmented ? { alignSelf: "stretch", ...layout.style } : layout.style}>
      <Picker
        label={aria ?? ""}
        selection={typeof shown === "string" || typeof shown === "number" ? shown : undefined}
        onSelectionChange={(next: Value) => (setOwn(next), onValueChange?.(next))}
        modifiers={[pickerStyle(segmented ? "segmented" : "menu"), labelsHidden(), ...(segmented ? [] : [tint(colors.primary)]), off(Boolean(disabled)), ...(aria ? [accessibilityLabel(aria)] : [])]}
      >
        {options.map((o) => (
          <Text key={String(o.value)} modifiers={[tag(o.value)]}>
            {o.label}
          </Text>
        ))}
      </Picker>
    </ExpoHost>
  )
}
RadioGroup.slot = "radio-group"
