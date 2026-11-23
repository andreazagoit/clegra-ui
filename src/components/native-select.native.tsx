import { Children, isValidElement, type ComponentType, type ReactNode } from "react"
import { View } from "react-native"

import * as Drawn from "./select.native"

type OptionProps = { value?: string; disabled?: boolean; children?: ReactNode; label?: string }

export type NativeSelectProps = {
  value?: string
  defaultValue?: string
  onChange?: (event: { target: { value: string } }) => void
  name?: string
  disabled?: boolean
  required?: boolean
  size?: "sm" | "default"
  className?: string
  id?: string
  children?: ReactNode
  "aria-label"?: string
}

export const NativeSelectOption = (_: OptionProps & { className?: string }) => null
export const NativeSelectOptGroup = (_: { label?: string; disabled?: boolean; className?: string; children?: ReactNode }) => null

type Item = { value: string; label: ReactNode; disabled?: boolean; group?: string }

function options(children: ReactNode, group?: string, off?: boolean): Item[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionProps & { label?: string }>(child)) return []
    if (child.type === NativeSelectOptGroup) return options(child.props.children, child.props.label, child.props.disabled)
    if (child.type === NativeSelectOption || child.type === "option") return [{ value: child.props.value ?? String(child.props.children ?? ""), label: child.props.children, disabled: off || child.props.disabled, group }]
    return []
  })
}

/** The Select parts a NativeSelect is built from: the drawn ones, or iOS's Picker (native-select.ios.tsx). */
export type SelectKit = { Select: ComponentType<any>; SelectTrigger: ComponentType<any>; SelectValue: ComponentType<any>; SelectContent: ComponentType<any>; SelectItem: ComponentType<any>; SelectGroup: ComponentType<any>; SelectLabel: ComponentType<any> }

export function nativeSelect(kit: SelectKit) {
  /**
   * shadcn's NativeSelect: on the web the browser's own <select>. Here the
   * platform's pop-up list: the drawn Select's (or iOS's menu Picker), with the
   * same box (h-9, or h-8 small, rounded, input-coloured, chevron on the right).
   */
  return function NativeSelect({ value, defaultValue, onChange, name, disabled, required, size = "default", className = "", children, "aria-label": label }: NativeSelectProps) {
    const items = options(children)
    const groups = [...new Set(items.map((i) => i.group))]
    return (
      <View style={{ alignSelf: /(^|\s)w-full(\s|$)/.test(className) ? "stretch" : "flex-start", opacity: disabled ? 0.5 : 1 }}>
        <kit.Select value={value} defaultValue={defaultValue ?? items[0]?.value} name={name} required={required} disabled={disabled} items={items.map((i) => ({ value: i.value, label: i.label }))} onValueChange={(next: string) => onChange?.({ target: { value: next } })}>
          <kit.SelectTrigger size={size} className={className} aria-label={label}>
            <kit.SelectValue />
          </kit.SelectTrigger>
          <kit.SelectContent>
            {groups.map((group) => {
              const rows = items.filter((i) => i.group === group).map((i) => (
                <kit.SelectItem key={i.value} value={i.value} disabled={i.disabled}>
                  {i.label}
                </kit.SelectItem>
              ))
              return group === undefined ? rows : (
                <kit.SelectGroup key={group}>
                  <kit.SelectLabel>{group}</kit.SelectLabel>
                  {rows}
                </kit.SelectGroup>
              )
            })}
          </kit.SelectContent>
        </kit.Select>
      </View>
    )
  }
}

export const NativeSelect = nativeSelect(Drawn)
