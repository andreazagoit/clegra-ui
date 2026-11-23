import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { Badge } from "@clegra/ui/components/badge"
import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { Input } from "@clegra/ui/components/input"
import { colorsFor, radius, type, type Colors } from "@clegra/ui/tokens"

/**
 * Clegra's theme, shared by Web and Native: one source (brand's
 * colors.css → theme.css for the web's CSS variables; src/tokens.ts, checked
 * against them by tokens.test.ts, for React Native). Each token shows its CSS
 * variable and its TS token side by side, for the toolbar's theme.
 */
const meta = { title: "Brand/Theme" } satisfies Meta
export default meta

const roles: [string, keyof Colors][] = [
  ["background", "background"],
  ["foreground", "foreground"],
  ["card", "card"],
  ["card-foreground", "cardForeground"],
  ["popover", "popover"],
  ["primary", "primary"],
  ["primary-foreground", "primaryForeground"],
  ["secondary", "secondary"],
  ["secondary-foreground", "secondaryForeground"],
  ["muted", "muted"],
  ["muted-foreground", "mutedForeground"],
  ["accent", "accent"],
  ["accent-foreground", "accentForeground"],
  ["destructive", "destructive"],
  ["border", "border"],
  ["input", "input"],
  ["sidebar", "sidebar"],
  ["sidebar-foreground", "sidebarForeground"],
  ["sidebar-accent", "sidebarAccent"],
  ["sidebar-border", "sidebarBorder"],
  ["yes", "yes"],
  ["link", "link"],
]

const Swatch = ({ color }: { color: string }) => <span className="inline-block h-8 w-14 rounded-md border" style={{ background: color }} />

/** Every colour role: the web's variable (live, from the stylesheet) beside the native token (from tokens.ts). */
export const Colours: StoryObj = {
  render: (_, { globals }) => {
    const tokens = colorsFor(globals.theme === "dark" ? "dark" : "light")
    return (
      <table className="w-full max-w-4xl text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Web · CSS variable</th>
            <th className="py-2 pr-4 font-medium">Web</th>
            <th className="py-2 pr-4 font-medium">Native</th>
            <th className="py-2 pr-4 font-medium">Native · tokens.ts</th>
            <th className="py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(([css, ts]) => (
            <tr key={css} className="border-b last:border-b-0">
              <td className="py-2 pr-4">
                <code>--{css}</code>
              </td>
              <td className="py-2 pr-4">
                <Swatch color={`var(--${css})`} />
              </td>
              <td className="py-2 pr-4">
                <Swatch color={tokens[ts]} />
              </td>
              <td className="py-2 pr-4">
                <code>colors.{ts}</code>
              </td>
              <td className="py-2 font-mono text-xs text-muted-foreground">{tokens[ts]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
}

/** Radii: the web's --radius scale and the native `radius` token, the same numbers. */
export const Radii: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(Object.entries(radius) as [string, number][]).map(([name, px]) => (
        <div key={name} className="flex flex-col items-center gap-2 text-sm">
          <div className="size-20 border-2 border-primary bg-card" style={{ borderRadius: px }} />
          <code>rounded-{name}</code>
          <code className="text-xs text-muted-foreground">
            radius.{name} = {px}
          </code>
        </div>
      ))}
    </div>
  ),
}

/** The type scale: Tailwind's text sizes on the web, the `type` token on native. */
export const TypeScale: StoryObj = {
  name: "Type scale",
  render: () => (
    <div className="flex flex-col gap-3">
      {(Object.entries(type) as [string, { fontSize: number; lineHeight: number }][]).map(([name, t]) => (
        <div key={name} className="flex items-baseline gap-6">
          <code className="w-56 shrink-0 text-xs text-muted-foreground">
            text-{name} · type[&quot;{name}&quot;] {t.fontSize}/{t.lineHeight}
          </code>
          <span style={{ fontSize: t.fontSize, lineHeight: `${t.lineHeight}px` }}>Quote 2026-014 for the new customer</span>
        </div>
      ))}
    </div>
  ),
}

/** The theme on the components (web). */
export const WithComponents: StoryObj = {
  name: "With components",
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Quote 2026-014</CardTitle>
        <CardDescription>Prepared from the ERP's price list for the customer's request in your inbox.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Badge>Draft</Badge>
          <Badge variant="secondary">3 lines</Badge>
        </div>
        <Input placeholder="Add a note for the customer" />
        <div className="flex gap-2">
          <Button>Open in Quotes</Button>
          <Button variant="outline">Later</Button>
          <Button className="btn-yes">Accent</Button>
        </div>
      </CardContent>
    </Card>
  ),
}
