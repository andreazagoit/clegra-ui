import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { appAccentColors } from "../brand/accents"
import { colorsFor } from "../tokens"

import { CLEGRA_UI_META_KEY, DEFAULT_THEME, themeOfHostContext, type ClegraUiContext } from "./protocol"
import { CLEGRA_ROLE_NAMES, clegraStyleVariables, hostContextFor, variablesToApply } from "./theme"

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")

test("every role sent to a view is a role of the stylesheet", () => {
  const css = read("../brand/theme.css") + read("../brand/accents.css") + read("../styles.css")
  for (const role of CLEGRA_ROLE_NAMES) assert.match(css, new RegExp(`--${role}:`), `--${role} is not a custom property of the theme`)
})

test("the variables carry the mode's colours under the standard and Clegra's names", () => {
  for (const mode of ["light", "dark"] as const) {
    const colors = colorsFor(mode)
    const variables = clegraStyleVariables(mode)
    assert.equal(variables["--color-background-primary"], colors.background)
    assert.equal(variables["--color-text-primary"], colors.foreground)
    assert.equal(variables["--clegra-primary"], colors.primary)
    assert.equal(variables["--clegra-yes"], colors.yes)
    for (const [name, value] of Object.entries(variables)) assert.ok(/^--[a-z][a-z0-9-]*$/.test(name) && value.length > 0, name)
  }
})

test("a host context round-trips into the look, and the library's roles follow it", () => {
  const theme = themeOfHostContext(hostContextFor({ mode: "dark", textScale: 1.3, locale: "it-IT", os: "ios", reducedMotion: true }))
  assert.equal(theme.mode, "dark")
  assert.equal(theme.textScale, 1.3)
  assert.equal(theme.platform, "mobile")
  assert.equal(theme.os, "ios")
  assert.equal(theme.reducedMotion, true)
  const applied = variablesToApply(theme)
  assert.equal(applied["--primary"], colorsFor("dark").primary)
  assert.equal(applied["--background"], colorsFor("dark").background)
})

test("a host that sends only the standard variables still themes the library's roles", () => {
  const theme = themeOfHostContext({ theme: "dark", styles: { variables: { "--color-background-primary": "#111111", "--color-text-primary": "#eeeeee" } } })
  const applied = variablesToApply(theme)
  assert.equal(applied["--background"], "#111111")
  assert.equal(applied["--foreground"], "#eeeeee")
  assert.equal(applied["--primary"], undefined)
  assert.equal(theme.os, null)
})

test("Clegra's own variables travel in _meta, the standard ones alone in styles.variables", () => {
  const context = hostContextFor({ mode: "light" })
  const standard = Object.keys(context.styles?.variables ?? {})
  assert.ok(standard.length > 0 && standard.every((name) => !name.startsWith("--clegra-")), "styles.variables holds only the standard names")
  const own = context._meta?.[CLEGRA_UI_META_KEY] as ClegraUiContext
  assert.equal(own.variables?.["--clegra-primary"], colorsFor("light").primary)
  assert.equal(own.accent, undefined)
  const theme = themeOfHostContext(context)
  assert.equal(variablesToApply(theme)["--primary"], colorsFor("light").primary)
  assert.equal(theme.accent, null)
})

test("an app's accent reaches the view: its controls' roles, the standard info and rings, data-app-accent", () => {
  for (const mode of ["light", "dark"] as const) {
    const tone = appAccentColors.red[mode]
    const context = hostContextFor({ mode, accent: "red" })
    assert.equal((context._meta?.[CLEGRA_UI_META_KEY] as ClegraUiContext).accent, "red")
    assert.equal(context.styles?.variables?.["--color-text-info"], tone.text)
    assert.equal(context.styles?.variables?.["--color-ring-primary"], tone.text)
    assert.equal(context.styles?.variables?.["--color-background-info"], tone.soft)
    const theme = themeOfHostContext(context)
    assert.equal(theme.accent, "red")
    const applied = variablesToApply(theme)
    assert.equal(applied["--primary"], tone.accent)
    assert.equal(applied["--primary-foreground"], tone.foreground)
    assert.equal(applied["--link"], tone.text)
    assert.equal(applied["--ring"], tone.text)
    assert.equal(applied["--app-accent"], tone.accent)
    assert.equal(applied["--app-accent-soft"], tone.soft)
    assert.equal(applied["--selection"], tone.soft)
    // Clegra's own and the statuses stay.
    assert.equal(applied["--background"], colorsFor(mode).background)
    assert.equal(applied["--destructive"], colorsFor(mode).destructive)
    assert.equal(applied["--yes"], colorsFor(mode).yes)
  }
  // Without one, the accent roles are Clegra's blue.
  assert.equal(variablesToApply(themeOfHostContext(hostContextFor({ mode: "dark" })))["--app-accent-text"], appAccentColors.blue.dark.text)
})

test("an unknown accent or a foreign variable in _meta is dropped", () => {
  const theme = themeOfHostContext({ _meta: { [CLEGRA_UI_META_KEY]: { accent: "#ff0000", variables: { "--clegra-primary": "#123456", "--background": "#000000", "--clegra-bad": "url(https://x.example)" } } } })
  assert.equal(theme.accent, null)
  assert.deepEqual(theme.variables, { "--clegra-primary": "#123456" })
})

test("a change notification is partial: what it lacks stays", () => {
  const first = themeOfHostContext(hostContextFor({ mode: "light", textScale: 1.2 }))
  const next = themeOfHostContext({ theme: "dark" }, first)
  assert.equal(next.mode, "dark")
  assert.equal(next.textScale, 1.2)
  assert.equal(next.variables["--clegra-primary"], first.variables["--clegra-primary"])
})

test("malformed and unsafe input is dropped, never applied", () => {
  const theme = themeOfHostContext({
    theme: "sepia",
    locale: "<script>",
    styles: { variables: { "--ok": "#fff", "--bad": "red; background: url(https://x.example/a)", "not-a-variable": "#000", "--also-bad": "expression(alert(1))" } },
    _meta: { [CLEGRA_UI_META_KEY]: { os: "rainbow", textScale: 99 } },
  })
  assert.equal(theme.mode, DEFAULT_THEME.mode)
  assert.equal(theme.locale, DEFAULT_THEME.locale)
  assert.deepEqual(theme.variables, { "--ok": "#fff" })
  assert.equal(theme.os, null)
  assert.equal(theme.textScale, 3.2)
  assert.equal(themeOfHostContext(null), DEFAULT_THEME)
})
