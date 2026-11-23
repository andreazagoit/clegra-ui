import { Image, Picker, Text } from "@expo/ui/swift-ui"
import { accessibilityLabel, labelsHidden, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, useContext, type ReactNode } from "react"

import { ExpoHost, plainLabel } from "./expo-ui-controls"
import { TabsContext, TabsList as DrawnList, TabsTrigger } from "../components/tabs.native"

type TriggerProps = { value: unknown; children?: ReactNode }

/**
 * iOS: the tab list is SwiftUI's segmented Picker (Expo UI), the system's own
 * segmented control. Each tab shows its text, or its icon's SF Symbol when it
 * has no text (the system's segments hold one or the other, so an icon beside
 * text is left out). Icons without a symbol, other content or values that
 * aren't strings or numbers stay drawn (tabs.native.tsx).
 */
export function TabsList(props: { className?: string; children?: ReactNode; "aria-label"?: string }) {
  const tabs = useContext(TabsContext)
  const options = Children.toArray(props.children).map((child) => {
    if (!isValidElement<TriggerProps>(child) || child.type !== TabsTrigger) return null
    const value = child.props.value
    const label = plainLabel(child.props.children)
    return (typeof value === "string" || typeof value === "number") && label && (label.text || label.symbol) ? { value, ...label } : null
  })
  if (!options.length || options.some((o) => !o)) return <DrawnList {...props} />
  return (
    <ExpoHost matchContents>
      <Picker label={props["aria-label"] ?? ""} selection={tabs.value as string | number} onSelectionChange={(next) => tabs.set(next)} modifiers={[pickerStyle("segmented"), labelsHidden(), ...(props["aria-label"] ? [accessibilityLabel(props["aria-label"])] : [])]}>
        {options.map((o) =>
          o!.text ? (
            <Text key={String(o!.value)} modifiers={[tag(o!.value)]}>
              {o!.text}
            </Text>
          ) : (
            <Image key={String(o!.value)} systemName={o!.symbol} modifiers={[tag(o!.value)]} />
          ),
        )}
      </Picker>
    </ExpoHost>
  )
}
