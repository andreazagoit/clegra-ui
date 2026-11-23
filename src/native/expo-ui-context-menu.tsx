import { ContextMenu as SwiftMenu, RNHostView } from "@expo/ui/swift-ui"
import { Children, isValidElement, type ReactElement, type ReactNode } from "react"
import { View } from "react-native"

import { ExpoHost } from "./expo-ui-controls"
import { menuEntries } from "./expo-ui-menu"
import { Div } from "../primitives.native"
import * as D from "../components/context-menu.native"

const kit = {
  Item: D.ContextMenuItem,
  CheckboxItem: D.ContextMenuCheckboxItem,
  RadioGroup: D.ContextMenuRadioGroup,
  RadioItem: D.ContextMenuRadioItem,
  Group: D.ContextMenuGroup,
  Label: D.ContextMenuLabel,
  Separator: D.ContextMenuSeparator,
  Shortcut: D.ContextMenuShortcut,
  Sub: D.ContextMenuSub,
  SubTrigger: D.ContextMenuSubTrigger,
  SubContent: D.ContextMenuSubContent,
  Portal: D.ContextMenuPortal,
}

type El = ReactElement<Record<string, unknown>>

/**
 * iOS: SwiftUI's context menu (Expo UI), the system's menu on a long press (with
 * its preview lift), around the drawn trigger. Items are read by
 * native/expo-ui-menu.tsx (Buttons with SF Symbols, Toggles, an inline Picker
 * for a radio group, Sections, nested Menus for submenus; shortcuts left
 * out). A controlled `open` or an `onOpenChange`, which SwiftUI doesn't
 * report, or items it can't read stay drawn (context-menu.native.tsx).
 */
export function ContextMenu(props: Parameters<typeof D.ContextMenu>[0]) {
  const parts = Children.toArray(props.children).filter(isValidElement) as El[]
  const trigger = parts.find((p) => p.type === D.ContextMenuTrigger)
  const content = parts.find((p) => p.type === D.ContextMenuContent)
  const list = content ? menuEntries(content.props.children, kit) : null
  if (props.open !== undefined || props.onOpenChange || !trigger || !content || parts.length !== 2 || !list) return <D.ContextMenu {...props} />
  return (
    <ExpoHost matchContents>
      <SwiftMenu>
        <SwiftMenu.Items>{list}</SwiftMenu.Items>
        <SwiftMenu.Trigger>
          <RNHostView matchContents>
            <View>
              <Div className={trigger.props.className as string | undefined}>{trigger.props.children as ReactNode}</Div>
            </View>
          </RNHostView>
        </SwiftMenu.Trigger>
      </SwiftMenu>
    </ExpoHost>
  )
}
