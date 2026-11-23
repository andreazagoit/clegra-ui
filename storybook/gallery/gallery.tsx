import { useEffect, useState } from "react"
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native"

import { OverlayHost } from "@clegra/ui/native/overlay"
import { setThemeChoice, useColors, useResolvedTheme } from "@clegra/ui/native/theme"
import { cases } from "./cases"
import { statusLine } from "./native-status"
import { Toaster as DrawnToaster } from "./drawn-base"
import { applyTheme, platformName, Toaster } from "./platform-base"

/**
 * Every component of the library in both versions, side by side: this
 * platform's (the web's shadcn in a browser; Expo UI or drawn in an app)
 * and the drawn one. The same file on every platform; in a browser it needs
 * react-native aliased to react-native-web (gallery/vite.config.ts; Expo does it).
 */
export function ComponentGallery() {
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  const { width } = useWindowDimensions()
  const wide = width >= 760
  const [, redraw] = useState(0)
  useEffect(() => applyTheme(dark), [dark])
  const toggle = () => {
    setThemeChoice(dark ? "light" : "dark")
    redraw((n) => n + 1)
  }
  const label = { color: colors.mutedForeground, fontSize: 12, fontWeight: "500" as const, textTransform: "uppercase" as const }
  return (
    <OverlayHost>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, gap: 16, maxWidth: 1200, width: "100%", alignSelf: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "600" }}>@clegra/ui: both versions</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Left: {platformName}. Right: drawn with the same props and tokens, what iOS falls back to. Under each name: what iOS uses.</Text>
          </View>
          <Pressable testID="theme" accessibilityRole="button" onPress={toggle} style={{ paddingHorizontal: 12, height: 36, justifyContent: "center", borderRadius: 36, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 14 }}>{dark ? "Light" : "Dark"}</Text>
          </Pressable>
        </View>
        {cases.map((item) => (
          <View key={item.name} testID={`case:${item.name}`} style={{ gap: 8, borderTopWidth: 1, borderColor: colors.border, paddingTop: 16, flexDirection: wide ? "row" : "column" }}>
            <View style={{ gap: 2, width: wide ? 160 : undefined }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}>{item.name}</Text>
              <Text testID={`status:${item.name}`} style={{ color: colors.mutedForeground, fontSize: 12 }}>{statusLine(item.name)}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: wide ? "row" : "column", gap: 24 }}>
              <View testID={`platform:${item.name}`} style={{ flex: 1, gap: 6, minWidth: 0 }}>
                {wide ? null : <Text style={label}>{platformName}</Text>}
                {item.render(item.platform)}
              </View>
              <View testID={`drawn:${item.name}`} style={{ flex: 1, gap: 6, minWidth: 0 }}>
                {wide ? null : <Text style={label}>Drawn</Text>}
                {item.render(item.drawn)}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <Toaster />
      <DrawnToaster />
    </OverlayHost>
  )
}

export default ComponentGallery
