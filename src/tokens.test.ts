import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { dark, light, radius, type Colors } from "./tokens"

/**
 * The tokens are the stylesheet's theme as plain values (for platforms with no
 * CSS). This keeps them one theme: every role of src/brand/theme.css (the
 * theme src/theme.css brings in) is resolved through src/brand/colors.css,
 * for each scheme, and compared with tokens.ts.
 */
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
const styles = read("./styles.css")
const theme = read("./brand/theme.css")
const colors = read("./brand/colors.css")

/** The custom properties of every `selector {` block in a stylesheet, in order (later blocks win). */
function block(css: string, selector: string) {
  const vars: Record<string, string> = {}
  let at = css.indexOf(`${selector} {`)
  while (at !== -1) {
    const body = css.slice(at, css.indexOf("}", at))
    for (const m of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) vars[m[1]!] = m[2]!.trim()
    at = css.indexOf(`${selector} {`, at + 1)
  }
  return vars
}

const palette = block(colors, ":root")

type Rgba = [number, number, number, number]

function hex(value: string): Rgba {
  const n = parseInt(value.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
}

/** A theme value (a palette variable, rgb(r g b / a%), or a colour-mix of one with transparent) as sRGB and alpha. */
function resolve(value: string, vars: Record<string, string>): Rgba {
  value = value.replace(/\/\*.*?\*\//g, "").trim()
  if (value.startsWith("#")) return hex(value)
  const ref = /^var\(--([a-z0-9-]+)\)$/.exec(value)
  if (ref) {
    const next = vars[ref[1]!]
    assert.ok(next, `--${ref[1]} is not in colors.css`)
    return resolve(next, vars)
  }
  const rgb = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)%\)$/.exec(value)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4]) / 100]
  const mix = /^color-mix\(in srgb, (var\(--[a-z0-9-]+\)) (\d+)%, transparent\)$/.exec(value)
  if (mix) {
    const [r, g, b] = resolve(mix[1]!, vars)
    return [r, g, b, Number(mix[2]) / 100]
  }
  throw new Error(`not a colour: ${value}`)
}

function rgba(value: string): Rgba {
  if (value.startsWith("#")) return hex(value)
  const m = /^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(value)
  if (!m) throw new Error(`not a colour: ${value}`)
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]
}

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
/** Tokens with no variable of the same name: mixes the components make (bg-primary/80, the overlay) and status colours. */
const derived = new Set(["ring", "destructiveSoft", "primarySoft", "primaryHover", "amber", "emerald", "overlay"])

const cases: [string, string, Colors, Record<string, string>][] = [
  ["light", ":root", light, palette],
  ["dark", ".dark", dark, palette],
]

for (const [name, selector, tokens, vars] of cases) {
  test(`colours of ${name} match the theme`, () => {
    const roles = block(theme, selector)
    let compared = 0
    for (const [key, value] of Object.entries(tokens)) {
      if (derived.has(key)) continue
      const variable = Object.keys(roles).find((role) => camel(role) === key)
      assert.ok(variable, `${key}: no --variable in theme.css`)
      // A role may name another role (--sidebar: var(--panel)): the theme's own roles resolve too.
      const want = resolve(roles[variable], { ...vars, ...roles })
      const got = rgba(value)
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(want[i]! - got[i]!) <= 1, `${name} ${key}: ${value} is not ${roles[variable]} (${want.join(",")})`)
      assert.ok(Math.abs(want[3] - got[3]) < 0.01, `${name} ${key}: alpha`)
      compared++
    }
    assert.ok(compared >= 20)
  })
}

test("radii follow --radius", () => {
  const base = Number(/--radius: ([\d.]+)rem/.exec(styles)![1]) * 16
  assert.equal(radius.lg, base)
  assert.equal(radius.sm, +(base * 0.6).toFixed(1))
  assert.equal(radius.md, +(base * 0.8).toFixed(1))
  assert.equal(radius.xl, +(base * 1.4).toFixed(1))
  assert.equal(radius["2xl"], +(base * 1.8).toFixed(1))
})

test("the face's palette is colors.css's", async () => {
  const { palette: tones } = await import("./tokens")
  const name = { blue: "palette-blue-electric", cream: "palette-cream", white: "palette-white" } as const
  for (const [tone, value] of Object.entries(tones)) assert.equal(value.toUpperCase(), palette[name[tone as keyof typeof name]]!.toUpperCase(), tone)
})
