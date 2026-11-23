import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { APP_ACCENT_NAMES, appAccentColors, type AppAccentName, type AppAccentTone } from "@clegra/ui/accents"
import { AppAccent } from "@clegra/ui/clegra/app-accent"
import { Button } from "@clegra/ui/components/button"
import { Checkbox } from "@clegra/ui/components/checkbox"
import { Progress } from "@clegra/ui/components/progress"
import { Switch } from "@clegra/ui/components/switch"

/**
 * The apps' accents (src/brand/accents.ts): every app has its own tint, like Apple's apps, one of ten names. Each
 * swatch shows the fill with its foreground (also every selected state's) and the accent as text, in light and dark; below, the
 * same controls inside `<AppAccent>` for each name (the toolbar's theme switches the mode). Every pair is WCAG AA
 * (src/brand/accents.test.ts).
 */
const meta = { title: "Brand/App accents" } satisfies Meta
export default meta

function Swatch({ name, mode, tone }: { name: AppAccentName; mode: "light" | "dark"; tone: AppAccentTone }) {
  const page = mode === "light" ? "#FFFFFF" : "#0A0A0A"
  const ink = mode === "light" ? "#0A0A0A" : "#FAFAFA"
  return (
    <div style={{ background: page, color: ink, padding: 12, borderRadius: 14, border: "1px solid rgb(128 128 128 / 25%)", display: "grid", gap: 8, minWidth: 150 }}>
      <div style={{ font: "600 12px/1 Inter, sans-serif", opacity: 0.7 }}>
        {name} · {mode}
      </div>
      <div style={{ background: tone.accent, color: tone.foreground, borderRadius: 9999, padding: "6px 12px", font: "600 13px/1.2 Inter, sans-serif" }}>{tone.accent}</div>
      <div style={{ color: tone.text, font: "600 13px/1.2 Inter, sans-serif" }}>Link {tone.text}</div>
    </div>
  )
}

export const Palette: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {APP_ACCENT_NAMES.map((name) => (
        <div key={name} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Swatch name={name} mode="light" tone={appAccentColors[name].light} />
          <Swatch name={name} mode="dark" tone={appAccentColors[name].dark} />
        </div>
      ))}
    </div>
  ),
}

export const InAnApp: StoryObj = {
  render: () => (
    <div className="grid gap-3">
      {APP_ACCENT_NAMES.map((name) => (
        <AppAccent key={name} accent={name} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
          <span className="w-16 text-sm font-medium">{name}</span>
          <Button>Salva</Button>
          <Button variant="link">Apri</Button>
          <Switch defaultChecked aria-label={`${name} switch`} />
          <Checkbox defaultChecked aria-label={`${name} checkbox`} />
          <Progress value={60} className="w-32" />
          <span className="selected rounded-full px-2.5 py-1 text-sm font-semibold">Selezionato</span>
          <input aria-label={`${name} focus`} className="h-8 rounded-md border px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="Focus" />
        </AppAccent>
      ))}
    </div>
  ),
}
