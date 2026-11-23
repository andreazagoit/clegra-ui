import { Button, Divider, Image, Menu, Picker, Section, Text, Toggle } from "@expo/ui/swift-ui"
import { disabled as off, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers"
import { Children, Fragment, isValidElement, useState, type ReactElement, type ReactNode } from "react"

import { plainLabel } from "./expo-ui-controls"

/** The parts of a shadcn menu (dropdown, context, menubar), to read its items. */
export type MenuKit = {
  Item: unknown
  CheckboxItem: unknown
  RadioGroup: unknown
  RadioItem: unknown
  Group: unknown
  Label: unknown
  Separator: unknown
  Shortcut: unknown
  Sub: unknown
  SubTrigger: unknown
  SubContent: unknown
  Portal?: unknown
}

type El = ReactElement<Record<string, unknown>>
const elements = (nodes: unknown): El[] | null => {
  const out: El[] = []
  for (const node of Children.toArray(nodes as ReactNode)) {
    if (isValidElement<Record<string, unknown>>(node)) {
      if (node.type === Fragment) {
        const inner = elements(node.props.children)
        if (!inner) return null
        out.push(...inner)
      } else out.push(node)
    } else return null
  }
  return out
}

/** A checkbox item: its own state when uncontrolled, as the drawn one keeps. */
function MenuToggle({ label, symbol, checked, defaultChecked, onCheckedChange, disabled }: { label: string; symbol?: Parameters<typeof Toggle>[0]["systemImage"]; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (v: boolean) => void; disabled?: boolean }) {
  const [own, setOwn] = useState(Boolean(defaultChecked))
  return <Toggle label={label} systemImage={symbol} isOn={checked ?? own} onIsOnChange={(v) => (setOwn(v), onCheckedChange?.(v))} modifiers={[off(Boolean(disabled))]} />
}

/**
 * An item with a second line (`description`, Clegra's): a Button whose label
 * is its symbol, its text and the line, which iOS's menu shows as the item's
 * image, title and subtitle. A checkbox item shows its check as the symbol.
 */
function MenuSubtitled({ label, symbol, description, onPress, disabled, destructive }: { label: string; symbol?: Parameters<typeof Toggle>[0]["systemImage"]; description: string; onPress?: () => void; disabled?: boolean; destructive?: boolean }) {
  return (
    <Button onPress={onPress} role={destructive ? "destructive" : "default"} modifiers={[off(Boolean(disabled))]}>
      {[...(symbol ? [<Image key="symbol" systemName={symbol} />] : []), <Text key="label">{label}</Text>, <Text key="description">{description}</Text>]}
    </Button>
  )
}

/** A radio group: SwiftUI's inline Picker, the system's checkmarked choices in the menu. */
function MenuPicker({ options, value, defaultValue, onValueChange }: { options: { value: string | number; label: string }[]; value?: unknown; defaultValue?: unknown; onValueChange?: (v: unknown) => void }) {
  const [own, setOwn] = useState<unknown>(defaultValue)
  const shown = value === undefined ? own : value
  return (
    <Picker label="" selection={typeof shown === "string" || typeof shown === "number" ? shown : null} onSelectionChange={(v: string | number | null) => (setOwn(v), onValueChange?.(v))} modifiers={[pickerStyle("inline")]}>
      {options.map((o) => (
        <Text key={String(o.value)} modifiers={[tag(o.value)]}>
          {o.label}
        </Text>
      ))}
    </Picker>
  )
}

/**
 * A shadcn menu's items as SwiftUI menu content: items are Buttons (an icon
 * as its SF Symbol, shortcuts left out: Expo UI has no keyboardShortcut modifier), checkbox
 * items Toggles, a radio group an inline Picker, separators Dividers, groups
 * and labels Sections, submenus nested Menus. Null when an item can't be
 * (an icon without an SF Symbol, other content), so the caller stays drawn.
 */
export function menuEntries(nodes: unknown, kit: MenuKit): ReactNode[] | null {
  const list = elements(nodes)
  if (!list) return null
  const skip = (el: ReactElement) => el.type === kit.Shortcut
  const out: ReactNode[] = []
  for (let i = 0; i < list.length; i++) {
    const el = list[i]
    const p = el.props
    if (el.type === kit.Separator) out.push(<Divider key={i} />)
    else if (el.type === kit.Portal) {
      const inner = menuEntries(p.children, kit)
      if (!inner) return null
      out.push(<Fragment key={i}>{inner}</Fragment>)
    } else if (el.type === kit.Item) {
      const label = plainLabel(p.children as ReactNode, skip)
      if (!label?.text) return null
      const click = p.onClick as ((e?: unknown) => void) | undefined
      if (typeof p.description === "string" && p.description) {
        out.push(<MenuSubtitled key={i} label={label.text} symbol={label.symbol} description={p.description} onPress={click ? () => click() : undefined} disabled={Boolean(p.disabled)} destructive={p.variant === "destructive"} />)
        continue
      }
      out.push(<Button key={i} label={label.text} systemImage={label.symbol} role={p.variant === "destructive" ? "destructive" : "default"} onPress={click ? () => click() : undefined} modifiers={[off(Boolean(p.disabled))]} />)
    } else if (el.type === kit.CheckboxItem) {
      const label = plainLabel(p.children as ReactNode, skip)
      if (!label?.text) return null
      if (typeof p.description === "string" && p.description) {
        const change = p.onCheckedChange as ((v: boolean) => void) | undefined
        out.push(<MenuSubtitled key={i} label={label.text} symbol={p.checked ? "checkmark" : label.symbol} description={p.description} onPress={() => change?.(!p.checked)} disabled={Boolean(p.disabled)} />)
        continue
      }
      out.push(<MenuToggle key={i} label={label.text} symbol={label.symbol} checked={p.checked as boolean | undefined} defaultChecked={p.defaultChecked as boolean | undefined} onCheckedChange={p.onCheckedChange as ((v: boolean) => void) | undefined} disabled={p.disabled as boolean | undefined} />)
    } else if (el.type === kit.RadioGroup) {
      const items = elements(p.children)
      if (!items) return null
      const options: { value: string | number; label: string }[] = []
      for (const item of items) {
        const v = item.props.value
        const label = plainLabel(item.props.children as ReactNode, skip)
        if (item.type !== kit.RadioItem || (typeof v !== "string" && typeof v !== "number") || !label?.text || label.symbol || item.props.disabled) return null
        options.push({ value: v, label: label.text })
      }
      out.push(<MenuPicker key={i} options={options} value={p.value} defaultValue={p.defaultValue} onValueChange={p.onValueChange as ((v: unknown) => void) | undefined} />)
    } else if (el.type === kit.Group) {
      const inner = elements(p.children)
      if (!inner) return null
      const title = inner[0]?.type === kit.Label ? inner[0].props.children : undefined
      if (title !== undefined && typeof title !== "string") return null
      const content = menuEntries(title === undefined ? inner : inner.slice(1), kit)
      if (!content) return null
      out.push(
        <Section key={i} title={title}>
          {content}
        </Section>,
      )
    } else if (el.type === kit.Label) {
      // A label outside a group heads the items after it, up to the next separator.
      if (typeof p.children !== "string") return null
      let end = i + 1
      while (end < list.length && list[end].type !== kit.Separator) end++
      const content = menuEntries(list.slice(i + 1, end), kit)
      if (!content) return null
      out.push(
        <Section key={i} title={p.children}>
          {content}
        </Section>,
      )
      i = end - 1
    } else if (el.type === kit.Sub) {
      const parts = elements(p.children)
      const trigger = parts?.find((c) => c.type === kit.SubTrigger)
      const content = parts?.find((c) => c.type === kit.SubContent)
      const label = trigger ? plainLabel(trigger.props.children as ReactNode) : null
      const inner = content ? menuEntries(content.props.children, kit) : null
      if (!parts || parts.length !== 2 || !label?.text || !inner) return null
      out.push(
        <Menu key={i} label={label.text} systemImage={label.symbol}>
          {inner}
        </Menu>,
      )
    } else return null
  }
  return out
}
