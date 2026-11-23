import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"

import { ACCENTS_SVG, accentsCss, accentsSvg } from "../../scripts/accents"
import { dark, light } from "../tokens"

import { APP_ACCENT_NAMES, DEFAULT_APP_ACCENT, appAccentColors, appAccentOf, appAccentVariables, isAppAccent } from "./accents"

/** WCAG 2.2 relative luminance of an opaque #RRGGBB. */
function luminance(hex: string) {
  assert.match(hex, /^#[0-9A-F]{6}$/i, `${hex} is not an opaque #RRGGBB`)
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/** The WCAG contrast ratio of two colours. */
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** The glass fill's share of the accent (glass.css «THE GLASS FILL»: color-mix(… var(--glass-fill) 90%, transparent)). */
const GLASS_FILL = 0.9

/** An opaque #RRGGBB at `share` over an opaque ground, as #RRGGBB. */
function over(fill: string, ground: string, share: number) {
  const channels = (hex: string) => [16, 8, 0].map((shift) => (parseInt(hex.slice(1), 16) >> shift) & 255)
  const [f, g] = [channels(fill), channels(ground)]
  return `#${f.map((v, i) => Math.round(v * share + g[i]! * (1 - share)).toString(16).padStart(2, "0")).join("")}`
}

/** The grounds an app's text and controls sit on, per mode (the theme's background, card and muted fills). */
const GROUNDS = {
  light: { background: light.background, card: light.card, muted: light.muted, sidebar: light.sidebar },
  dark: { background: dark.background, card: dark.card, muted: dark.muted, sidebar: dark.sidebar },
}

test("every accent meets WCAG AA in light and dark", () => {
  const rows: string[] = []
  for (const name of APP_ACCENT_NAMES) {
    for (const mode of ["light", "dark"] as const) {
      const tone = appAccentColors[name][mode]
      const page = mode === "light" ? light : dark
      const at = `${name} ${mode}`
      const onFill = contrast(tone.foreground, tone.accent)
      assert.ok(onFill >= 4.5, `${at}: foreground on the accent is ${onFill.toFixed(2)}:1`)
      for (const [ground, colour] of Object.entries(GROUNDS[mode])) {
        const ratio = contrast(tone.text, colour)
        assert.ok(ratio >= 4.5, `${at}: the accent as text on ${ground} is ${ratio.toFixed(2)}:1`)
        // The glass fill (glass.css): the accent at 90% over what is behind it, and its foreground on that.
        const glass = contrast(tone.foreground, over(tone.accent, colour, GLASS_FILL))
        assert.ok(glass >= 4.5, `${at}: the foreground on the glass fill over ${ground} is ${glass.toFixed(2)}:1`)
      }
      const control = contrast(tone.accent, page.background)
      assert.ok(control >= 3, `${at}: the accent's fill against the background is ${control.toFixed(2)}:1 (a control needs 3:1)`)
      rows.push(`${at.padEnd(13)} fill ${tone.accent} fg ${onFill.toFixed(2)} | text ${tone.text} ${contrast(tone.text, page.background).toFixed(2)} | control ${control.toFixed(2)}`)
    }
  }
  if (process.env.ACCENTS_TABLE) console.log(rows.join("\n"))
})

test("blue is Clegra's blue, and the default", () => {
  assert.equal(DEFAULT_APP_ACCENT, "blue")
  assert.equal(appAccentColors.blue.light.accent, light.primary)
  assert.equal(appAccentColors.blue.light.foreground, light.primaryForeground)
  assert.equal(appAccentColors.blue.light.text, light.link)
  assert.equal(appAccentColors.blue.dark.accent, dark.primary)
  assert.equal(appAccentColors.blue.dark.text, dark.link)
})

test("the palette is closed: names only, absent is blue, anything else an error", () => {
  assert.deepEqual(Object.keys(appAccentColors), [...APP_ACCENT_NAMES])
  assert.equal(new Set(APP_ACCENT_NAMES.map((n) => appAccentColors[n].light.accent)).size, APP_ACCENT_NAMES.length, "two accents share a fill")
  assert.ok(isAppAccent("red"))
  for (const bad of ["#FF0000", "Red", "rose", "", 3, null]) assert.equal(isAppAccent(bad), false, String(bad))
  assert.equal(appAccentOf(undefined), "blue")
  assert.equal(appAccentOf("teal"), "teal")
  assert.throws(() => appAccentOf("#00FF00"), /is not one of blue, indigo/)
  assert.deepEqual(appAccentVariables("red", "dark"), { "--app-accent": "#E0302F", "--app-accent-foreground": "#FFFFFF", "--app-accent-text": "#FCA5A5" })
})

/** @clegra/sdk's sources beside this package: where both are developed together, not in this package's own repository. */
const SDK = new URL("../../../sdk/", import.meta.url)
const withSdk = existsSync(SDK) ? {} : { skip: "needs @clegra/sdk's sources beside this package (checked where both are developed)" }

test("accents.css is what scripts/accents.ts writes from the palette (npm run accents)", () => {
  assert.equal(readFileSync(new URL("./accents.css", import.meta.url), "utf8"), accentsCss())
})

test("the SDK docs' swatches are what scripts/accents.ts writes from the palette (npm run accents)", withSdk, () => {
  assert.equal(readFileSync(ACCENTS_SVG, "utf8"), accentsSvg())
})

test("the stylesheet scopes every accent in light and dark and maps the app's controls to it", () => {
  const css = readFileSync(new URL("./accents.css", import.meta.url), "utf8")
  for (const name of APP_ACCENT_NAMES) {
    assert.ok(css.includes(`[data-app-accent="${name}"] {\n  --app-accent: ${appAccentColors[name].light.accent};`), name)
    assert.ok(css.includes(`[data-app-accent="${name}"]:is(.dark, .dark *) {\n  --app-accent: ${appAccentColors[name].dark.accent};`), `${name} dark`)
  }
  for (const role of ["--primary: var(--app-accent)", "--primary-foreground: var(--app-accent-foreground)", "--ring: var(--app-accent-text)", "--link: var(--app-accent-text)", "--sidebar-active: var(--app-accent-text)"])
    assert.ok(css.includes(role), role)
  // The status colours are never the accent's.
  assert.doesNotMatch(css, /--(destructive|success|warning):/)
  assert.match(readFileSync(new URL("./theme.css", import.meta.url), "utf8"), /@import "\.\/accents\.css";/)
})

test("the SDK's manifest names the same palette (@clegra/sdk spec/src/protocol.ts APP_ACCENTS)", withSdk, () => {
  // A repository check only: the SDK must not depend on this package, so it writes the names itself.
  const sdk = readFileSync(new URL("spec/src/protocol.ts", SDK), "utf8")
  const list = /export const APP_ACCENTS = \[([^\]]*)\] as const/.exec(sdk)
  assert.ok(list, "APP_ACCENTS is not in the SDK's protocol.ts")
  assert.deepEqual(JSON.parse(`[${list[1]}]`), [...APP_ACCENT_NAMES])
  assert.match(sdk, /export const DEFAULT_APP_ACCENT[^=]*= "blue"/)
})
