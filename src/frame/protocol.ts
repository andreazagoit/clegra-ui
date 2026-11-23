/**
 * AN APPLICATION'S OWN VIEW AND ITS HOST: the part of the MCP Apps standard
 * (SEP-1865, `io.modelcontextprotocol/ui`) that says how a view should look
 * and how big it is. A view is an HTML resource (`ui://<app>/<name>`) the host
 * shows in a sandboxed frame; the two talk JSON-RPC 2.0 over `postMessage`:
 *
 *   view → host   ui/initialize                           request; the result carries `hostContext`
 *   view → host   ui/notifications/initialized            «I applied it»
 *   host → view   ui/notifications/host-context-changed   the fields that changed (theme, styles, locale…)
 *   view → host   ui/notifications/size-changed           the content's size, in CSS px
 *
 * The look rides in the standard `hostContext`: `theme`, `styles.variables`
 * (only the standard names, `--color-background-primary`…: the official client
 * refuses a context with any other), `locale`, `platform`; what the standard
 * lacks is under `hostContext._meta["clegra/ui"]`: Clegra's own roles as
 * `variables` (prefixed `--clegra-`), the app's `accent` (src/brand/accents.ts),
 * the person's text size. A view written to this renders in any MCP Apps host
 * (the standard variables carry the accent too: info, the rings).
 *
 * Declared structurally: no dependency on `@modelcontextprotocol/ext-apps`, nor
 * on @clegra/sdk (a view bundles only @clegra/ui).
 */
import { isAppAccent, type AppAccentName } from "../brand/accents"

export const MCP_APPS_PROTOCOL_VERSION = "2026-01-26"
export const CLEGRA_UI_META_KEY = "clegra/ui"
export const CLEGRA_STYLE_PREFIX = "--clegra-"

export type ClegraMode = "light" | "dark"

/** A custom property Clegra sends of its own (`_meta["clegra/ui"].variables`). */
const OWN_VARIABLE = /^--clegra-[a-z][a-z0-9-]*$/

/** What Clegra adds to the standard host context (`hostContext._meta["clegra/ui"]`). */
export type ClegraUiContext = {
  /** The person's text size: 1 is the default; iOS Dynamic Type and the app's own setting change it. */
  textScale: number
  reducedMotion?: boolean
  contrast?: "normal" | "more"
  /** Which Clegra the view is in. */
  os: "web" | "mac" | "ios"
  /** The app's tint (src/brand/accents.ts); the colours themselves are in `variables`. */
  accent?: AppAccentName
  /** Clegra's roles, `--clegra-<role>` (theme.ts CLEGRA_ROLE_NAMES), beside the standard ones of `styles.variables`. */
  variables?: Record<string, string>
}

export type SafeAreaInsets = { top: number; right: number; bottom: number; left: number }

/** The fields of the standard `McpUiHostContext` this library reads. Every one is optional, and a change notification carries only what changed. */
export type HostContextLike = {
  theme?: ClegraMode
  styles?: { variables?: Record<string, string | undefined>; css?: { fonts?: string } }
  locale?: string
  timeZone?: string
  platform?: "web" | "desktop" | "mobile"
  safeAreaInsets?: SafeAreaInsets
  _meta?: Record<string, unknown>
  [key: string]: unknown
}

/** The look in use, worked out from a host context. */
export type ClegraTheme = {
  mode: ClegraMode
  /** CSS custom properties with their leading `--`, as the host sent them (checked). */
  variables: Record<string, string>
  textScale: number
  /** BCP 47, e.g. "it-IT". */
  locale: string
  timeZone?: string
  platform: "web" | "desktop" | "mobile"
  /** Null outside Clegra (another MCP Apps host, a preview). */
  os: ClegraUiContext["os"] | null
  reducedMotion: boolean
  contrast: "normal" | "more"
  safeAreaInsets?: SafeAreaInsets
  /** The app's tint the host said, or null (another host, a preview). */
  accent: AppAccentName | null
}

export const DEFAULT_THEME: ClegraTheme = {
  mode: "light",
  variables: {},
  textScale: 1,
  locale: "it-IT",
  platform: "web",
  os: null,
  reducedMotion: false,
  contrast: "normal",
  accent: null,
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)

/** A custom property a host may set: a plain name and a value that can't leave the declaration. */
export function isSafeVariable(name: string, value: unknown): value is string {
  if (!/^--[a-z][a-z0-9-]{0,79}$/.test(name) || typeof value !== "string") return false
  return value.length > 0 && value.length <= 300 && !/[;{}<>\\]|url\(|expression\(|@import/i.test(value)
}

const insetsOf = (value: unknown): SafeAreaInsets | undefined => {
  if (!isRecord(value)) return undefined
  const side = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.min(n, 400) : 0)
  return { top: side(value.top), right: side(value.right), bottom: side(value.bottom), left: side(value.left) }
}

/**
 * The look after a host context (the `ui/initialize` result's, or a change
 * notification's partial one) on top of the look so far. Every field is
 * checked; a malformed one keeps its previous value, an unsafe variable is
 * dropped.
 */
export function themeOfHostContext(context: unknown, previous: ClegraTheme = DEFAULT_THEME): ClegraTheme {
  if (!isRecord(context)) return previous
  const next: ClegraTheme = { ...previous }
  if (context.theme === "light" || context.theme === "dark") next.mode = context.theme
  if (isRecord(context.styles) && isRecord(context.styles.variables)) {
    const variables = { ...previous.variables }
    for (const [name, value] of Object.entries(context.styles.variables)) {
      if (value === undefined || value === null) delete variables[name]
      else if (isSafeVariable(name, value)) variables[name] = value
    }
    next.variables = variables
  }
  if (typeof context.locale === "string" && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(context.locale)) next.locale = context.locale
  if (typeof context.timeZone === "string" && /^[A-Za-z0-9_+\-/]{1,64}$/.test(context.timeZone)) next.timeZone = context.timeZone
  if (context.platform === "web" || context.platform === "desktop" || context.platform === "mobile") next.platform = context.platform
  if ("safeAreaInsets" in context) next.safeAreaInsets = insetsOf(context.safeAreaInsets)
  const own = isRecord(context._meta) ? context._meta[CLEGRA_UI_META_KEY] : undefined
  if (isRecord(own)) {
    if (typeof own.textScale === "number" && Number.isFinite(own.textScale)) next.textScale = Math.min(3.2, Math.max(0.8, own.textScale))
    if (typeof own.reducedMotion === "boolean") next.reducedMotion = own.reducedMotion
    if (own.contrast === "normal" || own.contrast === "more") next.contrast = own.contrast
    if (own.os === "web" || own.os === "mac" || own.os === "ios") next.os = own.os
    if (isAppAccent(own.accent)) next.accent = own.accent
    if (isRecord(own.variables)) {
      const variables = { ...next.variables }
      for (const [name, value] of Object.entries(own.variables)) {
        if (!OWN_VARIABLE.test(name)) continue
        if (value === undefined || value === null) delete variables[name]
        else if (isSafeVariable(name, value)) variables[name] = value
      }
      next.variables = variables
    }
  }
  return next
}
