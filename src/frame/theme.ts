import { appAccentColors, appAccentVariables, DEFAULT_APP_ACCENT, type AppAccentName } from "../brand/accents"
import { colorsFor, radius, type as typeScale, type Colors } from "../tokens"

import { CLEGRA_STYLE_PREFIX, CLEGRA_UI_META_KEY, type ClegraMode, type ClegraTheme, type ClegraUiContext, type HostContextLike } from "./protocol"

/**
 * THE LOOK A HOST SENDS A VIEW, AND HOW A VIEW APPLIES IT.
 *
 * Host side: `hostContextFor` gives the standard fields (theme, the standard
 * style variables, locale, platform) and under `_meta["clegra/ui"]` Clegra's
 * roles as `--clegra-<role>` (`variables`), the app's accent and the text size.
 * With an `accent` (src/brand/accents.ts) the roles of the app's own controls
 * (primary, its foreground, link, ring, the app-accent ones, selection) and the
 * standard info and ring variables are the accent's.
 * The values are the worked-out colours of src/tokens.ts (the ones the
 * stylesheet resolves to: tokens.test.ts).
 *
 * View side: `applyClegraTheme` sets the variables on the document and points
 * this library's own roles (`--background`, `--primary`…) at them, so its
 * components, or plain `var(--background)` in the view's CSS, follow the host.
 */

/** Clegra's role → its value in the colours of a scheme and mode. Sent as `--clegra-<role>`. */
const ROLES: Record<string, (c: Colors, mode: ClegraMode) => string> = {
  background: (c) => c.background,
  foreground: (c) => c.foreground,
  card: (c) => c.card,
  "card-foreground": (c) => c.cardForeground,
  popover: (c) => c.popover,
  "popover-foreground": (c) => c.popoverForeground,
  primary: (c) => c.primary,
  "primary-foreground": (c) => c.primaryForeground,
  secondary: (c) => c.secondary,
  "secondary-foreground": (c) => c.secondaryForeground,
  muted: (c) => c.muted,
  "muted-foreground": (c) => c.mutedForeground,
  accent: (c) => c.accent,
  "accent-foreground": (c) => c.accentForeground,
  destructive: (c) => c.destructive,
  border: (c) => c.border,
  input: (c) => c.input,
  ring: (c) => c.ring,
  link: (c) => c.link,
  success: (c) => c.emerald,
  warning: (c) => c.amber,
  /* The one accent: the «sì» and a figure to notice. Never a second brand colour. */
  yes: (c) => c.yes,
  "on-yes": (c) => c.onYes,
  "yes-edge": (c, mode) => (mode === "dark" ? "transparent" : c.foreground),
  highlight: (c) => c.yes,
  "on-highlight": (c) => c.onYes,
}

/** The accent's roles (src/brand/accents.css): sent for every view, Clegra's blue unless the app has its own. */
const ACCENT_ROLES = ["app-accent", "app-accent-foreground", "app-accent-text", "app-accent-soft", "selection"] as const

/** Clegra's roles a view receives (as `--clegra-<name>`) and this library's stylesheet reads (as `--<name>`). */
export const CLEGRA_ROLE_NAMES: readonly string[] = [...Object.keys(ROLES), ...ACCENT_ROLES, "radius"]

/** A hex colour at an alpha, as rgba(): the soft grounds of the status colours. */
function soft(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return /^#[0-9a-f]{6}$/i.test(hex) ? `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})` : hex
}

const rem = (px: number) => `${px / 16}rem`

/** The standard MCP Apps style variables, from Clegra's colours. */
function standardVariables(c: Colors, mode: ClegraMode): Record<string, string> {
  const wash = mode === "dark" ? 0.2 : 0.12
  return {
    "--color-background-primary": c.background,
    "--color-background-secondary": c.card,
    "--color-background-tertiary": c.muted,
    "--color-background-inverse": c.foreground,
    "--color-background-ghost": "transparent",
    "--color-background-info": c.primarySoft,
    "--color-background-danger": c.destructiveSoft,
    "--color-background-success": soft(c.emerald, wash),
    "--color-background-warning": soft(c.amber, wash),
    "--color-background-disabled": c.muted,
    "--color-text-primary": c.foreground,
    "--color-text-secondary": c.mutedForeground,
    "--color-text-tertiary": c.mutedForeground,
    "--color-text-inverse": c.background,
    "--color-text-ghost": c.mutedForeground,
    "--color-text-info": c.link,
    "--color-text-danger": c.destructive,
    "--color-text-success": c.emerald,
    "--color-text-warning": c.amber,
    "--color-text-disabled": c.mutedForeground,
    "--color-border-primary": c.border,
    "--color-border-secondary": c.input,
    "--color-border-tertiary": c.border,
    "--color-border-inverse": c.foreground,
    "--color-border-ghost": "transparent",
    "--color-border-info": c.primary,
    "--color-border-danger": c.destructive,
    "--color-border-success": c.emerald,
    "--color-border-warning": c.amber,
    "--color-border-disabled": c.border,
    "--color-ring-primary": c.ring,
    "--color-ring-secondary": c.ring,
    "--color-ring-inverse": c.background,
    "--color-ring-info": c.ring,
    "--color-ring-danger": c.destructive,
    "--color-ring-success": c.emerald,
    "--color-ring-warning": c.amber,
    "--font-sans": "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif",
    "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    "--font-weight-normal": "400",
    "--font-weight-medium": "500",
    "--font-weight-semibold": "600",
    "--font-weight-bold": "700",
    "--font-text-xs-size": rem(typeScale.xs.fontSize),
    "--font-text-sm-size": rem(typeScale.sm.fontSize),
    "--font-text-md-size": rem(typeScale.base.fontSize),
    "--font-text-lg-size": rem(typeScale.lg.fontSize),
    "--font-text-xs-line-height": rem(typeScale.xs.lineHeight),
    "--font-text-sm-line-height": rem(typeScale.sm.lineHeight),
    "--font-text-md-line-height": rem(typeScale.base.lineHeight),
    "--font-text-lg-line-height": rem(typeScale.lg.lineHeight),
    "--font-heading-xs-size": rem(typeScale.sm.fontSize),
    "--font-heading-sm-size": rem(typeScale.base.fontSize),
    "--font-heading-md-size": rem(typeScale.lg.fontSize),
    "--font-heading-lg-size": rem(typeScale.xl.fontSize),
    "--font-heading-xl-size": rem(typeScale["2xl"].fontSize),
    "--font-heading-2xl-size": rem(typeScale["3xl"].fontSize),
    "--font-heading-3xl-size": rem(36),
    "--font-heading-xs-line-height": rem(typeScale.sm.lineHeight),
    "--font-heading-sm-line-height": rem(typeScale.base.lineHeight),
    "--font-heading-md-line-height": rem(typeScale.lg.lineHeight),
    "--font-heading-lg-line-height": rem(typeScale.xl.lineHeight),
    "--font-heading-xl-line-height": rem(typeScale["2xl"].lineHeight),
    "--font-heading-2xl-line-height": rem(typeScale["3xl"].lineHeight),
    "--font-heading-3xl-line-height": rem(40),
    "--border-radius-xs": rem(4),
    "--border-radius-sm": rem(radius.sm),
    "--border-radius-md": rem(radius.md),
    "--border-radius-lg": rem(radius.lg),
    "--border-radius-xl": rem(radius.xl),
    "--border-radius-full": "9999px",
    "--border-width-regular": "1px",
    "--shadow-hairline": `0 0 0 1px ${c.border}`,
    "--shadow-sm": "0 1px 2px rgba(0,0,0,0.06)",
    "--shadow-md": "0 4px 12px rgba(0,0,0,0.1)",
    "--shadow-lg": "0 12px 32px rgba(0,0,0,0.16)",
  }
}

/**
 * Every style variable Clegra sends for a mode: the standard names, then Clegra's roles as `--clegra-<role>`. With an
 * `accent`, the app's own controls' roles and the standard info and ring variables are the accent's.
 */
export function clegraStyleVariables(mode: ClegraMode, accent?: AppAccentName): Record<string, string> {
  const colors = colorsFor(mode)
  const variables = standardVariables(colors, mode)
  for (const [name, read] of Object.entries(ROLES)) variables[`${CLEGRA_STYLE_PREFIX}${name}`] = read(colors, mode)
  const own = appAccentColors[accent ?? DEFAULT_APP_ACCENT][mode]
  for (const [name, value] of Object.entries(appAccentVariables(accent ?? DEFAULT_APP_ACCENT, mode))) variables[`${CLEGRA_STYLE_PREFIX}${name.slice(2)}`] = value
  variables[`${CLEGRA_STYLE_PREFIX}selection`] = accent ? own.soft : mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(10,10,10,0.1)"
  if (accent) {
    Object.assign(variables, {
      [`${CLEGRA_STYLE_PREFIX}primary`]: own.accent,
      [`${CLEGRA_STYLE_PREFIX}primary-foreground`]: own.foreground,
      [`${CLEGRA_STYLE_PREFIX}link`]: own.text,
      [`${CLEGRA_STYLE_PREFIX}ring`]: own.text,
      "--color-background-info": own.soft,
      "--color-text-info": own.text,
      "--color-border-info": own.accent,
      "--color-ring-primary": own.text,
      "--color-ring-secondary": own.text,
      "--color-ring-info": own.text,
    })
  }
  variables[`${CLEGRA_STYLE_PREFIX}radius`] = rem(radius.lg)
  return variables
}

export type HostContextOptions = {
  mode: ClegraMode
  textScale?: number
  locale?: string
  timeZone?: string
  os?: ClegraUiContext["os"]
  reducedMotion?: boolean
  contrast?: "normal" | "more"
  /** The app's tint (its manifest's `accent`); none: Clegra's blue. */
  accent?: AppAccentName
}

/** HOST SIDE: the look as the fields of a standard host context (to merge into the `ui/initialize` result and to send whole on a change). */
export function hostContextFor(options: HostContextOptions): HostContextLike {
  const { mode, textScale = 1, locale = "it-IT", timeZone, os = "web", reducedMotion, contrast, accent } = options
  const all = clegraStyleVariables(mode, accent)
  const standard = Object.fromEntries(Object.entries(all).filter(([name]) => !name.startsWith(CLEGRA_STYLE_PREFIX)))
  const variables = Object.fromEntries(Object.entries(all).filter(([name]) => name.startsWith(CLEGRA_STYLE_PREFIX)))
  const own: ClegraUiContext = { textScale, os, ...(reducedMotion === undefined ? {} : { reducedMotion }), ...(contrast ? { contrast } : {}), ...(accent ? { accent } : {}), variables }
  return {
    theme: mode,
    styles: { variables: standard },
    locale,
    ...(timeZone ? { timeZone } : {}),
    platform: os === "ios" ? "mobile" : os === "mac" ? "desktop" : "web",
    _meta: { [CLEGRA_UI_META_KEY]: own },
  }
}

/** This library's role → the standard variable that stands in for it in a host that sends no `--clegra-` ones. Roles not listed keep the stylesheet's value. */
const STANDARD_FALLBACK: Record<string, string> = {
  background: "--color-background-primary",
  foreground: "--color-text-primary",
  card: "--color-background-secondary",
  "card-foreground": "--color-text-primary",
  popover: "--color-background-secondary",
  "popover-foreground": "--color-text-primary",
  secondary: "--color-background-tertiary",
  "secondary-foreground": "--color-text-primary",
  muted: "--color-background-tertiary",
  "muted-foreground": "--color-text-secondary",
  accent: "--color-background-tertiary",
  "accent-foreground": "--color-text-primary",
  destructive: "--color-text-danger",
  border: "--color-border-primary",
  input: "--color-border-secondary",
  ring: "--color-ring-primary",
  link: "--color-text-info",
  success: "--color-text-success",
  warning: "--color-text-warning",
  radius: "--border-radius-lg",
}

/** The custom properties to set for a look: the host's own, plus this library's roles pointed at them. */
export function variablesToApply(theme: ClegraTheme): Record<string, string> {
  const out: Record<string, string> = { ...theme.variables }
  for (const role of CLEGRA_ROLE_NAMES) {
    const value = theme.variables[`${CLEGRA_STYLE_PREFIX}${role}`] ?? (STANDARD_FALLBACK[role] ? theme.variables[STANDARD_FALLBACK[role]!] : undefined)
    if (value !== undefined) out[`--${role}`] = value
  }
  return out
}

const applied = new WeakMap<HTMLElement, string[]>()

/**
 * VIEW SIDE: applies a look to an element (the view's `<html>` by default):
 * the variables, the `dark` class and `data-theme`, `color-scheme`, the app's accent (`data-app-accent`), and, on the document's root only, `lang` and the
 * text size (the root's font size, so everything in rem follows the
 * person's setting). Variables of an earlier look that the new one lacks are
 * removed.
 */
export function applyClegraTheme(theme: ClegraTheme, element?: HTMLElement) {
  if (typeof document === "undefined") return
  const target = element ?? document.documentElement
  const variables = variablesToApply(theme)
  for (const old of applied.get(target) ?? []) if (!(old in variables)) target.style.removeProperty(old)
  for (const [name, value] of Object.entries(variables)) target.style.setProperty(name, value)
  applied.set(target, Object.keys(variables))
  target.classList.toggle("dark", theme.mode === "dark")
  target.dataset.theme = theme.mode
  target.style.colorScheme = theme.mode
  if (theme.os) target.dataset.os = theme.os
  else delete target.dataset.os
  if (theme.contrast === "more") target.dataset.contrast = "more"
  else delete target.dataset.contrast
  if (theme.reducedMotion) target.dataset.reducedMotion = "true"
  else delete target.dataset.reducedMotion
  if (theme.accent) target.dataset.appAccent = theme.accent
  else delete target.dataset.appAccent
  if (target === document.documentElement) {
    target.lang = theme.locale
    target.style.fontSize = theme.textScale === 1 ? "" : `${theme.textScale * 100}%`
  }
}
