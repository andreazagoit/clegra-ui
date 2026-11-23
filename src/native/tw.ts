import type { TextStyle, ViewStyle } from "react-native"

import { radius as radii, type as typeScale, type Colors } from "../tokens"

/**
 * The client's Tailwind classes as React Native styles, for the platforms with
 * no CSS: pages keep the `className` they have in Clegra's web app (on the web it is
 * real Tailwind). Interaction variants (hover:, focus:, group-*) are dropped:
 * a native control shows those by itself. `unknownClasses` lists what it can't
 * read, so a port can be checked (tw.test.ts).
 */
/** React Native 0.88 types styles as read-only; the parser builds them up in place. */
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

export type Parsed = { view: Mutable<ViewStyle>; text: Mutable<TextStyle>; hidden: boolean; icon?: { size?: number; color?: string }; grid?: number }
export type Context = { width: number; dark: boolean; colors: Colors }

const BREAKPOINTS: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
/** Variants that mean something only with a pointer or a state. */
const IGNORED = /^(hover|focus|focus-visible|focus-within|active|group-|peer-|has-|not-|aria-|data-|disabled|last|first|empty|placeholder|motion-|print|in-|\*|\[)/

const rem = (n: number) => n * 4
const camel = (name: string) => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())

const tailwindColors: Record<string, string> = { transparent: "transparent", white: "#ffffff", black: "#000000" }

function color(name: string, c: Context): string | undefined {
  const [base, alpha] = name.split("/") as [string, string | undefined]
  const value = tailwindColors[base] ?? (c.colors as Record<string, string>)[camel(base)]
  if (!value) return undefined
  if (!alpha) return value
  const opacity = Number(alpha) / 100
  if (value === "transparent") return value
  if (value.startsWith("#")) {
    const n = parseInt(value.slice(1), 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`
  }
  return value
}

/** A length: "4" → 16, "1/2" → "50%", "full", "px". */
function length(value: string): number | `${number}%` | undefined {
  if (value === "full") return "100%"
  if (value === "px") return 1
  if (value === "0") return 0
  if (value.includes("/")) {
    const [a, b] = value.split("/").map(Number) as [number, number]
    return `${(a / b) * 100}%`
  }
  const bracket = /^\[(\d+(?:\.\d+)?)(px|rem)\]$/.exec(value)
  if (bracket) return Number(bracket[1]) * (bracket[2] === "rem" ? 16 : 1)
  const n = Number(value)
  return Number.isNaN(n) ? undefined : rem(n)
}

const roundness: Record<string, number> = { "": radii.lg, none: 0, sm: radii.sm, md: radii.md, lg: radii.lg, xl: radii.xl, "2xl": radii["2xl"], "3xl": 30.8, "4xl": radii.pill, full: 9999 }
const widths: Record<string, number> = { xs: 320, sm: 384, md: 448, lg: 512, xl: 576, "2xl": 672, "3xl": 768, "4xl": 896, "5xl": 1024 }

const box: Record<string, string[]> = { "": [""], x: ["Horizontal"], y: ["Vertical"], t: ["Top"], b: ["Bottom"], l: ["Left"], r: ["Right"], s: ["Left"], e: ["Right"] }

const simple: Record<string, ViewStyle> = {
  flex: { display: "flex", flexDirection: "row" },
  "inline-flex": { display: "flex", flexDirection: "row", alignSelf: "flex-start" },
  block: { display: "flex" },
  "inline-block": { alignSelf: "flex-start" },
  grid: { display: "flex", flexDirection: "column" },
  "flex-row": { flexDirection: "row" },
  "flex-col": { flexDirection: "column" },
  "flex-wrap": { flexWrap: "wrap" },
  "flex-1": { flex: 1 },
  "flex-none": { flex: 0 },
  "flex-nowrap": { flexWrap: "nowrap" },
  shrink: { flexShrink: 1 },
  "shrink-0": { flexShrink: 0 },
  grow: { flexGrow: 1 },
  "items-start": { alignItems: "flex-start" },
  "items-center": { alignItems: "center" },
  "items-end": { alignItems: "flex-end" },
  "items-baseline": { alignItems: "baseline" },
  "items-stretch": { alignItems: "stretch" },
  "justify-start": { justifyContent: "flex-start" },
  "justify-center": { justifyContent: "center" },
  "justify-end": { justifyContent: "flex-end" },
  "justify-between": { justifyContent: "space-between" },
  "self-start": { alignSelf: "flex-start" },
  "self-center": { alignSelf: "center" },
  "self-end": { alignSelf: "flex-end" },
  "self-stretch": { alignSelf: "stretch" },
  "mx-auto": { alignSelf: "center" },
  "ml-auto": { marginLeft: "auto" },
  "mr-auto": { marginRight: "auto" },
  "mt-auto": { marginTop: "auto" },
  "mb-auto": { marginBottom: "auto" },
  relative: { position: "relative" },
  absolute: { position: "absolute" },
  fixed: { position: "absolute" },
  "inset-0": { top: 0, bottom: 0, left: 0, right: 0 },
  "overflow-hidden": { overflow: "hidden" },
  "overflow-y-auto": {},
  "overflow-x-auto": {},
  "overscroll-contain": {},
  border: { borderWidth: 1 },
  "border-0": { borderWidth: 0 },
  "border-t": { borderTopWidth: 1 },
  "border-b": { borderBottomWidth: 1 },
  "border-l": { borderLeftWidth: 1 },
  "border-r": { borderRightWidth: 1 },
  "border-b-2": { borderBottomWidth: 2 },
  "border-dashed": { borderStyle: "dashed" },
  shadow: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  "shadow-md": { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
  "shadow-lg": { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } },
  "shadow-xl": { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 20 } },
  "shadow-none": { shadowOpacity: 0 },
  "bg-clip-padding": {},
}

const textOnly: Record<string, TextStyle> = {
  truncate: {},
  "text-left": { textAlign: "left" },
  "text-center": { textAlign: "center" },
  "text-right": { textAlign: "right" },
  "font-normal": { fontWeight: "400" },
  "font-medium": { fontWeight: "500" },
  "font-semibold": { fontWeight: "600" },
  "font-bold": { fontWeight: "700" },
  "font-mono": { fontFamily: "Menlo" },
  "font-sans": {},
  underline: { textDecorationLine: "underline" },
  "tabular-nums": { fontVariant: ["tabular-nums"] },
  uppercase: { textTransform: "uppercase" },
  "whitespace-nowrap": {},
  "whitespace-normal": {},
  "whitespace-pre-wrap": {},
  "tracking-tight": { letterSpacing: -0.35 },
  "leading-tight": { lineHeight: 18 },
  "leading-relaxed": { lineHeight: 22 },
  "break-words": {},
}

/** Classes that only name a thing for the web, nothing to draw. */
const webOnly = /^(group|peer|group\/.*|cursor-.*|select-.*|outline-.*|transition.*|duration-.*|ease-.*|animate-.*|touch-.*|pointer-events-.*|ring.*|isolate|z-\d+|min-w-0|min-h-0|table-row|inline|contents|table-cell|scroll-.*|inert|resize-.*|appearance-.*|accent-.*|field-sizing-.*|has-.*|focus.*|backdrop-.*)$/

/** A display class at a breakpoint brings back what `hidden` took away ("hidden md:table-cell"). */
const SHOWN = /^(flex|inline-flex|block|inline-block|grid|table-cell|table-row|inline|contents)$/

function apply(token: string, out: Parsed, c: Context): boolean {
  if (SHOWN.test(token)) out.hidden = false
  if (token in simple) return void Object.assign(out.view, simple[token]), true
  if (token in textOnly) return void Object.assign(out.text, textOnly[token]), true
  if (token === "hidden") return (out.hidden = true), true
  if (token === "min-w-0") return (out.view.minWidth = 0), true
  if (token === "min-h-0") return (out.view.minHeight = 0), true
  if (webOnly.test(token)) return true

  let m: RegExpExecArray | null
  if ((m = /^text-(xs|sm|base|lg|xl|2xl|3xl)$/.exec(token))) return Object.assign(out.text, typeScale[m[1] as keyof typeof typeScale]), true
  if ((m = /^text-(.+)$/.exec(token))) {
    const value = color(m[1]!, c)
    if (value) return (out.text.color = value), ((out.icon ??= {}).color = value), true
  }
  if ((m = /^bg-(.+)$/.exec(token))) {
    const value = color(m[1]!, c)
    if (value) return (out.view.backgroundColor = value), true
  }
  if ((m = /^border-([a-z].*)$/.exec(token))) {
    const value = color(m[1]!, c)
    if (value) return (out.view.borderColor = value), true
  }
  if ((m = /^rounded(?:-(none|sm|md|lg|xl|2xl|3xl|4xl|full))?$/.exec(token))) return (out.view.borderRadius = roundness[m[1] ?? ""]), true
  if ((m = /^opacity-(\d+)$/.exec(token))) return (out.view.opacity = Number(m[1]) / 100), true
  if ((m = /^gap-(x-|y-)?(.+)$/.exec(token))) {
    const value = length(m[2]!)
    if (typeof value === "number") {
      if (m[1] === "x-") out.view.columnGap = value
      else if (m[1] === "y-") out.view.rowGap = value
      else out.view.gap = value
      return true
    }
  }
  if ((m = /^(-?)(p|m)(x|y|t|b|l|r|s|e)?-(.+)$/.exec(token))) {
    const value = length(m[4]!)
    if (value !== undefined && typeof value === "number") {
      const name = m[2] === "p" ? "padding" : "margin"
      for (const side of box[m[3] ?? ""]!) (out.view as Record<string, unknown>)[`${name}${side}`] = m[1] ? -value : value
      return true
    }
  }
  if ((m = /^size-(.+)$/.exec(token))) {
    const value = length(m[1]!)
    if (value !== undefined) {
      out.view.width = value
      out.view.height = value
      if (typeof value === "number") (out.icon ??= {}).size = value
      return true
    }
  }
  if ((m = /^(min-|max-)?(w|h)-(.+)$/.exec(token))) {
    const axis = m[2] === "w" ? "Width" : "Height"
    const key = (m[1] ? `${m[1].slice(0, 3)}${axis}` : axis.toLowerCase()) as "width"
    if (m[3] === "svh" || m[3] === "screen") return true
    const named = m[1] === "max-" && m[2] === "w" ? widths[m[3]!] : undefined
    const value = named ?? length(m[3]!)
    if (value !== undefined) return (out.view[key] = value), true
    if (m[3] === "auto" || m[3] === "fit") return true
  }
  if ((m = /^(top|bottom|left|right)-(.+)$/.exec(token))) {
    const value = length(m[2]!)
    if (value !== undefined) return (out.view[m[1] as "top"] = value), true
  }
  if ((m = /^grid-cols-(\d+)$/.exec(token))) return (out.grid = Number(m[1])), true
  if ((m = /^auto-rows-/.exec(token))) return true
  if ((m = /^(col|row)-span-/.exec(token))) return true
  if ((m = /^line-clamp-/.exec(token))) return true
  return false
}

const cache = new Map<string, Parsed>()

/** The styles of a class string, at this window's width and theme. */
export function tw(className: string | undefined, c: Context): Parsed {
  if (!className) return { view: {}, text: {}, hidden: false }
  const key = `${className}|${c.width}|${c.dark}|${c.colors.primary}`
  const hit = cache.get(key)
  if (hit) return hit
  const out: Parsed = { view: {}, text: {}, hidden: false }
  for (const raw of className.split(/\s+/).filter(Boolean)) {
    const parts = raw.split(":")
    const token = parts.pop()!.replace(/!$/, "")
    if (parts.some((v) => IGNORED.test(v))) continue
    if (parts.some((v) => (v === "dark" ? !c.dark : v in BREAKPOINTS ? c.width < BREAKPOINTS[v]! : false))) continue
    apply(token, out, c)
  }
  // Tailwind's base: a border with no colour of its own has the theme's.
  const { view } = out
  if (view.borderWidth !== undefined || view.borderTopWidth !== undefined || view.borderBottomWidth !== undefined || view.borderLeftWidth !== undefined || view.borderRightWidth !== undefined) view.borderColor ??= c.colors.border
  if (cache.size > 2000) cache.clear()
  cache.set(key, out)
  return out
}

/** The classes of a string that have no translation: for the check on a port. */
export function unknownClasses(className: string, c: Context) {
  return className.split(/\s+/).filter((raw) => {
    if (!raw) return false
    const parts = raw.split(":")
    const token = parts.pop()!
    if (parts.some((v) => IGNORED.test(v))) return false
    return !apply(token, { view: {}, text: {}, hidden: false }, c)
  })
}

export const truncates = (className?: string) => Boolean(className && /(^|\s)truncate(\s|$)/.test(className))
