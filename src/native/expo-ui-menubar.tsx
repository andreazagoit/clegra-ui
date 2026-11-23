import { Menu } from "@expo/ui/swift-ui"
import { disabled as off, tint } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, type ReactElement, type ReactNode } from "react"

import { ExpoHost, plainLabel } from "./expo-ui-controls"
import { menuEntries } from "./expo-ui-menu"
import { useColors } from "./theme"
import * as D from "../components/menubar.native"

const kit = {
  Item: D.MenubarItem,
  CheckboxItem: D.MenubarCheckboxItem,
  RadioGroup: D.MenubarRadioGroup,
  RadioItem: D.MenubarRadioItem,
  Group: D.MenubarGroup,
  Label: D.MenubarLabel,
  Separator: D.MenubarSeparator,
  Shortcut: D.MenubarShortcut,
  Sub: D.MenubarSub,
  SubTrigger: D.MenubarSubTrigger,
  SubContent: D.MenubarSubContent,
  Portal: D.MenubarPortal,
}

type El = ReactElement<Record<string, unknown>>

/**
 * iOS: each menu of the bar is SwiftUI's Menu (Expo UI), the system's pop-up
 * menu, inside the drawn bar; its trigger's text is the label. Items are read
 * by native/expo-ui-menu.tsx (Buttons with SF Symbols, Toggles for checkbox
 * items, an inline Picker for a radio group, Sections for groups and labels,
 * nested Menus for submenus; shortcuts left out). A controlled `open` or an
 * `onOpenChange`, which SwiftUI's Menu doesn't report, a trigger with a
 * `render` or non-text content, and items it can't read stay drawn
 * (menubar.native.tsx).
 */
export function MenubarMenu(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const colors = useColors()
  const parts = Children.toArray(props.children).filter(isValidElement) as El[]
  const trigger = parts.find((p) => p.type === D.MenubarTrigger)
  const content = parts.find((p) => p.type === D.MenubarContent)
  const label = trigger && !trigger.props.render ? plainLabel(trigger.props.children as ReactNode) : null
  const entries = content ? menuEntries(content.props.children, kit) : null
  if (props.open !== undefined || props.onOpenChange || parts.length !== 2 || !trigger || !label?.text || !entries) return <D.MenubarMenu {...props} />
  return (
    <ExpoHost matchContents>
      <Menu label={label.text} systemImage={label.symbol} modifiers={[tint(colors.primary), off(Boolean(trigger.props.disabled))]}>
        {entries}
      </Menu>
    </ExpoHost>
  )
}
