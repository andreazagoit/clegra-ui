import { HStack, Host, Image, RNHostView, Text, type HostProps } from "@expo/ui/swift-ui"
import { accessibilityLabel, buttonStyle, controlSize, disabled as off, frame, labelStyle, tint } from "@expo/ui/swift-ui/modifiers"
import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { IconContext } from "./icon-context"
import { sfSymbolOf, type SFSymbol } from "./sf-symbols"
import { useResolvedTheme, type Colors } from "./theme"
import { useTw } from "./use-tw"

/** Expo UI's Host in the app's colour scheme (the theme chosen in the app, which may differ from the system's). */
export function ExpoHost(props: HostProps) {
  const scheme = useResolvedTheme()
  return <Host colorScheme={scheme} {...props} />
}

const layoutKeys = ["width", "minWidth", "maxWidth", "flex", "flexGrow", "flexShrink", "flexBasis", "alignSelf", "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginHorizontal", "marginVertical", "marginStart", "marginEnd"] as const

/**
 * Where a native control sits in its React Native row: the layout part of
 * `className` and `style` (width, flex, margins), for the Host. `fill` is
 * true when the control should take the row's width (w-full, flex-1).
 */
export function useHostLayout(className?: string, style?: StyleProp<ViewStyle>) {
  const parsed = useTw(className)
  const all = { ...parsed.view, ...(StyleSheet.flatten(style) ?? {}) } as Record<string, unknown>
  const picked = Object.fromEntries(layoutKeys.filter((k) => all[k] !== undefined).map((k) => [k, all[k]])) as ViewStyle
  const fill = picked.width === "100%" || Number(picked.flex ?? 0) > 0 || Number(picked.flexGrow ?? 0) > 0 || picked.alignSelf === "stretch"
  return { style: fill && picked.width === undefined && !picked.flex && !picked.flexGrow ? { ...picked, alignSelf: "stretch" as const } : picked, fill, hidden: parsed.hidden }
}

/** SwiftUI's frame(maxWidth: .infinity): the bridge can't carry Infinity, a width no screen reaches does the same. */
export const fillWidth = frame({ maxWidth: 100000 })

export type ButtonLook = { variant?: string | null; size?: string | null; disabled?: boolean; label?: string }

const styles = { default: "borderedProminent", secondary: "bordered", outline: "bordered", destructive: "bordered", ghost: "borderless", link: "borderless" } as const
const sizes = { default: "regular", xs: "mini", sm: "small", lg: "large", icon: "regular", "icon-xs": "mini", "icon-sm": "small", "icon-lg": "large" } as const

/**
 * The shadcn button's variant and size as SwiftUI's button style and control
 * size, tinted with the theme's primary as the app's accent colour (an
 * AccentColor would do the same). The filled one (default) takes the primary
 * with white words; the others write in the tint, so they take the link colour
 * (Blu in light, Azzurro in dark, where Blu as text on Notte is 2.5:1).
 * Destructive takes the system's red through its role, so it gets no tint.
 */
export function buttonModifiers({ variant, size, disabled, label }: ButtonLook, colors: Colors) {
  const look = (variant ?? "default") as keyof typeof styles
  return [
    buttonStyle(styles[look] ?? "borderedProminent"),
    controlSize(sizes[(size ?? "default") as keyof typeof sizes] ?? "regular"),
    ...(look === "destructive" ? [] : [tint(look === "default" ? colors.primary : colors.link)]),
    off(Boolean(disabled)),
    ...(label ? [accessibilityLabel(label)] : []),
  ]
}

export const isIconSize = (size?: string | null) => Boolean(size?.startsWith("icon"))

/** A button's or item's children split into its text and the elements before and after it (icons). */
export type LabelParts = { text: string; leading?: ReactElement; trailing?: ReactElement }

const flat = (nodes: ReactNode): ReactNode[] => Children.toArray(nodes).flatMap((n) => (isValidElement<{ children?: ReactNode }>(n) && n.type === Fragment ? flat(n.props.children) : [n]))

/** Text with at most one element before it and one after; anything else, null. `skip` drops elements (e.g. a shortcut). */
export function labelParts(children: ReactNode, skip?: (el: ReactElement) => boolean): LabelParts | null {
  const out: LabelParts = { text: "" }
  let seenText = false
  for (const node of flat(children)) {
    if (typeof node === "string" || typeof node === "number") {
      out.text += String(node)
      seenText = true
    } else if (isValidElement(node)) {
      if (skip?.(node)) continue
      if (!seenText && !out.leading) out.leading = node
      else if (seenText && !out.trailing) out.trailing = node
      else return null
    } else if (node !== null && node !== undefined && node !== false) return null
  }
  out.text = out.text.trim()
  return out
}

/** A label's plain-text form, for menus: text and an optional leading SF Symbol; null when an element has no symbol. */
export function plainLabel(children: ReactNode, skip?: (el: ReactElement) => boolean): { text: string; symbol?: SFSymbol } | null {
  const parts = labelParts(children, skip)
  if (!parts || parts.trailing) return null
  const symbol = parts.leading ? sfSymbolOf(parts.leading) : undefined
  if (parts.leading && !symbol) return null
  return { text: parts.text, symbol }
}

/** An icon in a SwiftUI label: its SF Symbol, or the React Native icon itself (RNHostView) in the given colour and size. */
export function ExpoIcon({ icon, size, color }: { icon: ReactElement; size: number; color: string }) {
  const symbol = sfSymbolOf(icon)
  if (symbol) return <Image systemName={symbol} />
  return (
    <RNHostView matchContents>
      <View pointerEvents="none">
        <IconContext.Provider value={{ size, color }}>{icon}</IconContext.Provider>
      </View>
    </RNHostView>
  )
}

/** A SwiftUI label row: icon, text, icon, in the system font. */
export function ExpoLabelRow({ parts, iconSize, iconColor, fill }: { parts: LabelParts; iconSize: number; iconColor: string; fill?: boolean }) {
  return (
    <HStack spacing={6} modifiers={fill ? [fillWidth] : []}>
      {parts.leading ? <ExpoIcon icon={parts.leading} size={iconSize} color={iconColor} /> : null}
      {parts.text ? <Text>{parts.text}</Text> : null}
      {parts.trailing ? <ExpoIcon icon={parts.trailing} size={iconSize} color={iconColor} /> : null}
    </HStack>
  )
}

/** labelStyle for a label shown as its icon alone. */
export const iconOnly = labelStyle("iconOnly")
