import { Menu } from "@expo/ui/swift-ui"
import { accessibilityLabel, fixedSize, tint } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, type ReactElement, type ReactNode } from "react"

import { buttonModifiers, iconOnly, ExpoHost, isIconSize, plainLabel } from "./expo-ui-controls"
import { menuEntries } from "./expo-ui-menu"
import { useColors } from "./theme"
import { Button as ExpoButton } from "./expo-ui-button"
import { Button as DrawnButton } from "../components/button.native"
import * as D from "../components/dropdown-menu.native"

const kit = {
  Item: D.DropdownMenuItem,
  CheckboxItem: D.DropdownMenuCheckboxItem,
  RadioGroup: D.DropdownMenuRadioGroup,
  RadioItem: D.DropdownMenuRadioItem,
  Group: D.DropdownMenuGroup,
  Label: D.DropdownMenuLabel,
  Separator: D.DropdownMenuSeparator,
  Shortcut: D.DropdownMenuShortcut,
  Sub: D.DropdownMenuSub,
  SubTrigger: D.DropdownMenuSubTrigger,
  SubContent: D.DropdownMenuSubContent,
  Portal: D.DropdownMenuPortal,
}

type El = ReactElement<Record<string, unknown>>

/**
 * iOS: SwiftUI's Menu (Expo UI), the system's pop-up menu. The trigger is the
 * Menu's label: its text and SF Symbol, styled as the Button it renders
 * (variant, size); items are read by native/expo-ui-menu.tsx (Buttons, Toggles, an
 * inline Picker for a radio group, Dividers, Sections, nested Menus). A
 * controlled `open` or an `onOpenChange` (SwiftUI's Menu reports neither), a
 * trigger with its own onClick or a non-button `render`, icons without an SF
 * Symbol and other content stay drawn (dropdown-menu.native.tsx).
 */
export function DropdownMenu(props: Parameters<typeof D.DropdownMenu>[0]) {
  const colors = useColors()
  const parts = Children.toArray(props.children).filter(isValidElement) as El[]
  const trigger = parts.find((p) => p.type === D.DropdownMenuTrigger)
  const content = parts.find((p) => p.type === D.DropdownMenuContent)
  const drawn = <D.DropdownMenu {...props} />
  if (props.open !== undefined || props.onOpenChange || !trigger || !content || parts.length !== 2 || trigger.props.onClick) return drawn
  const render = trigger.props.render as El | undefined
  if (render && render.type !== DrawnButton && render.type !== ExpoButton) return drawn
  const look = (render?.props ?? {}) as { variant?: string; size?: string; disabled?: boolean; children?: ReactNode }
  const label = plainLabel((trigger.props.children as ReactNode) ?? look.children)
  const entries = menuEntries(content.props.children, kit)
  if (!label || (!label.text && !label.symbol) || !entries) return drawn
  const aria = trigger.props["aria-label"] as string | undefined
  const textless = !label.text || isIconSize(look.size)
  const modifiers = render ? buttonModifiers({ ...look, label: aria }, colors) : [tint(colors.primary), ...(aria ? [accessibilityLabel(aria)] : [])]
  return (
    <ExpoHost matchContents>
      <Menu label={textless ? (aria ?? label.text) : label.text} systemImage={label.symbol} modifiers={[...modifiers, ...(textless && label.symbol ? [iconOnly] : []), fixedSize()]}>
        {entries}
      </Menu>
    </ExpoHost>
  )
}
