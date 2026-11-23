import { Button as SwiftButton } from "@expo/ui/swift-ui"
import { fixedSize } from "@expo/ui/swift-ui/modifiers"

import { useFormSubmit } from "./form-context"
import { buttonModifiers, iconOnly, ExpoHost, ExpoLabelRow, isIconSize, labelParts, useHostLayout } from "./expo-ui-controls"
import { sfSymbolOf } from "./sf-symbols"
import { useColors } from "./theme"
import { Button as Drawn, type ButtonProps } from "../components/button.native"

/** What a web handler may call on the event; SwiftUI's press has none. */
const pressEvent = () => ({ preventDefault() {}, stopPropagation() {}, nativeEvent: {} })

/**
 * iOS: SwiftUI's Button (Expo UI) in every variant, in the system font:
 * default is borderedProminent, secondary and outline bordered, ghost and
 * link borderless, destructive bordered with the destructive role; sizes are
 * control sizes and the icon sizes show the icon alone. Icons become SF
 * Symbols (native/sf-symbols.ts), else the React Native icon is hosted in the
 * label. type="submit" submits the surrounding Form as the drawn one does.
 * A `render` element, or children that are more than text with an icon on
 * either side, stay drawn (button.native.tsx).
 */
export function Button(props: ButtonProps) {
  const { variant = "default", size = "default", children, disabled, onClick, render, type, name, value, className, style, "aria-label": aria, title } = props
  const colors = useColors()
  const submit = useFormSubmit()
  const layout = useHostLayout(className, style)
  const parts = render ? null : labelParts(children)
  if (!parts || (!parts.text && !parts.leading)) return <Drawn {...props} />
  if (layout.hidden) return null
  const press = () => (type === "submit" && submit ? submit(name ? [name, value ?? ""] : undefined) : onClick?.(pressEvent()))
  const iconic = isIconSize(size) || !parts.text
  const label = aria ?? title ?? (iconic ? parts.text : undefined)
  const modifiers = buttonModifiers({ variant, size, disabled, label }, colors)
  const symbol = parts.leading ? sfSymbolOf(parts.leading) : undefined
  const simple = !layout.fill && !parts.trailing && (!parts.leading || symbol)
  const role = variant === "destructive" ? "destructive" : "default"
  const iconColor = variant === "default" ? colors.primaryForeground : variant === "destructive" ? colors.destructive : colors.link
  return (
    <ExpoHost matchContents={layout.fill ? { vertical: true } : true} style={layout.style}>
      {simple ? (
        <SwiftButton label={iconic ? (aria ?? parts.text) : parts.text} systemImage={symbol} role={role} onPress={press} modifiers={[...modifiers, ...(iconic && symbol ? [iconOnly] : []), fixedSize()]} />
      ) : (
        <SwiftButton role={role} onPress={press} modifiers={layout.fill ? modifiers : [...modifiers, fixedSize()]}>
          <ExpoLabelRow parts={iconic ? { text: "", leading: parts.leading, trailing: parts.trailing } : parts} iconSize={size === "xs" || size === "icon-xs" ? 12 : 16} iconColor={iconColor} fill={layout.fill} />
        </SwiftButton>
      )}
    </ExpoHost>
  )
}
