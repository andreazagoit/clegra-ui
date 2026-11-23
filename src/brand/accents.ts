/**
 * THE APPS' ACCENTS (owner, 2026-11-20): every app has its own tint colour, like Apple's apps, picked from this
 * limited palette by name (never a free hex). The app's accent colours what is the app's own: its primary buttons,
 * selected and active states (an active pill, a selected row, a set filter), links, switches, progress and the focus
 * ring. Clegra's chrome (the rail, the shell's base, the account menu, the Faccina and the assistant) stays Clegra
 * blue, and the status colours (success, warning, danger) never change.
 *
 * The values are written once, here. src/brand/accents.css is generated from them (`npm run accents`, checked by
 * accents.test.ts), and React Native and MCP Apps hosts read them from here (`appAccentColors`).
 *
 * Each colour has, for light and for dark:
 *   accent      the fill: a primary button, a switch that is on, a progress bar, a checked box
 *   foreground  the text and icons on the fill
 *   text        the accent as text or a line on the page: links, an active item's words, the focus ring
 *   soft        a quiet ground: a selected row, an active pill, a set filter (the page's text and `text` read on it)
 * Every pair meets WCAG 2.2 AA (accents.test.ts computes them): foreground on accent, text on the page's grounds
 * (background, card, muted) and on soft at least 4.5:1; the fill against the page's background at least 3:1
 * (non-text contrast of a control).
 *
 * `blue` is Clegra's blue (src/brand/colors.css --palette-blue, Azzurro as text in dark): an app that declares no
 * accent, and Clegra itself, look as they always did.
 */

/** The palette's names, in the order a picker shows them. */
export const APP_ACCENT_NAMES = ["blue", "indigo", "purple", "pink", "red", "orange", "yellow", "green", "teal", "gray"] as const

export type AppAccentName = (typeof APP_ACCENT_NAMES)[number]

/** What an app gets when it names no accent: Clegra's blue. */
export const DEFAULT_APP_ACCENT: AppAccentName = "blue"

/** One accent in one mode. */
export type AppAccentTone = { accent: string; foreground: string; text: string; soft: string }

export type AppAccentColors = { light: AppAccentTone; dark: AppAccentTone }

const WHITE = "#FFFFFF"
const BLACK = "#0A0A0A"

/** The palette, light and dark, hand-tuned (accents.test.ts holds every pair to WCAG AA). */
export const appAccentColors: Readonly<Record<AppAccentName, AppAccentColors>> = {
  blue: {
    light: { accent: "#2D4BEE", foreground: WHITE, text: "#2D4BEE", soft: "#E2E5FF" },
    dark: { accent: "#2D4BEE", foreground: WHITE, text: "#8FA2FF", soft: "#1A2150" },
  },
  indigo: {
    light: { accent: "#4F46E5", foreground: WHITE, text: "#4338CA", soft: "#E0E7FF" },
    dark: { accent: "#5850EC", foreground: WHITE, text: "#A5B4FC", soft: "#1E1B4B" },
  },
  purple: {
    light: { accent: "#8B2FD9", foreground: WHITE, text: "#7E22CE", soft: "#F3E8FF" },
    dark: { accent: "#9340E0", foreground: WHITE, text: "#C9A6FF", soft: "#2A1745" },
  },
  pink: {
    light: { accent: "#C81E73", foreground: WHITE, text: "#BE185D", soft: "#FCE7F3" },
    dark: { accent: "#D42A82", foreground: WHITE, text: "#F9A8D4", soft: "#3A1229" },
  },
  red: {
    light: { accent: "#DC2626", foreground: WHITE, text: "#C81E1E", soft: "#FEE2E2" },
    dark: { accent: "#E0302F", foreground: WHITE, text: "#FCA5A5", soft: "#3B1414" },
  },
  orange: {
    light: { accent: "#EA580C", foreground: BLACK, text: "#B33E05", soft: "#FFEDD5" },
    dark: { accent: "#FB8C3C", foreground: BLACK, text: "#FB8C3C", soft: "#3A1D0B" },
  },
  yellow: {
    light: { accent: "#B88300", foreground: BLACK, text: "#875A00", soft: "#FEF3C7" },
    dark: { accent: "#FACC15", foreground: BLACK, text: "#FACC15", soft: "#3A2E08" },
  },
  green: {
    light: { accent: "#15803D", foreground: WHITE, text: "#15803D", soft: "#DCFCE7" },
    dark: { accent: "#34C759", foreground: BLACK, text: "#4ADE80", soft: "#0F2E1B" },
  },
  teal: {
    light: { accent: "#0F766E", foreground: WHITE, text: "#0F766E", soft: "#CCFBF1" },
    dark: { accent: "#2DD4BF", foreground: BLACK, text: "#2DD4BF", soft: "#0B2E2B" },
  },
  gray: {
    light: { accent: "#6B6B6B", foreground: WHITE, text: "#5C5C5C", soft: "#EDEDED" },
    dark: { accent: "#6B6B6B", foreground: WHITE, text: "#A3A3A3", soft: "#2A2A2A" },
  },
}

/** Is this one of the palette's names? */
export const isAppAccent = (value: unknown): value is AppAccentName => typeof value === "string" && (APP_ACCENT_NAMES as readonly string[]).includes(value)

/** An app's accent from what it declared: absent is the default (blue); anything else not in the palette is an error. */
export function appAccentOf(value: unknown): AppAccentName {
  if (value === undefined || value === null) return DEFAULT_APP_ACCENT
  if (!isAppAccent(value)) throw new Error(`accent: ${JSON.stringify(value)} is not one of ${APP_ACCENT_NAMES.join(", ")}`)
  return value
}

/** The custom properties an accent scope sets (src/brand/accents.css), for a mode. */
export const APP_ACCENT_VARIABLES = {
  accent: "--app-accent",
  foreground: "--app-accent-foreground",
  text: "--app-accent-text",
  soft: "--app-accent-soft",
} as const satisfies Record<keyof AppAccentTone, string>

/** An accent's colours as its custom properties, for a mode (an MCP Apps host, a style attribute). */
export function appAccentVariables(name: AppAccentName, mode: "light" | "dark"): Record<string, string> {
  const tone = appAccentColors[name][mode]
  return Object.fromEntries(Object.entries(APP_ACCENT_VARIABLES).map(([key, variable]) => [variable, tone[key as keyof AppAccentTone]]))
}
