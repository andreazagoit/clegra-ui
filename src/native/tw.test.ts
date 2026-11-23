import assert from "node:assert/strict"
import { test } from "node:test"

import { dark, light } from "../tokens"
import { tw, unknownClasses } from "./tw"

const at = (width: number, isDark = false) => ({ width, dark: isDark, colors: isDark ? dark : light })

test("spacing, colours and layout", () => {
  const { view, text } = tw("flex flex-col gap-2 px-4 py-3 rounded-lg border bg-muted text-sm text-muted-foreground", at(1200))
  assert.equal(view.flexDirection, "column")
  assert.equal(view.gap, 8)
  assert.equal(view.paddingHorizontal, 16)
  assert.equal(view.paddingVertical, 12)
  assert.equal(view.borderWidth, 1)
  assert.equal(view.backgroundColor, light.muted)
  assert.equal(text.fontSize, 14)
  assert.equal(text.color, light.mutedForeground)
})

test("breakpoints and dark", () => {
  assert.equal(tw("flex-col sm:flex-row", at(500)).view.flexDirection, "column")
  assert.equal(tw("flex-col sm:flex-row", at(800)).view.flexDirection, "row")
  assert.equal(tw("bg-muted dark:bg-card", at(800, true)).view.backgroundColor, dark.card)
  assert.equal(tw("hidden lg:hidden", at(500)).hidden, true)
})

test("interaction variants are dropped, sizes reach icons", () => {
  assert.equal(tw("hover:bg-muted", at(800)).view.backgroundColor, undefined)
  assert.equal(tw("size-4 text-primary", at(800)).icon?.size, 16)
  assert.equal(tw("bg-primary/50", at(800)).view.backgroundColor, "rgba(45,75,238,0.5)")
})

test("unknown classes are reported", () => {
  assert.deepEqual(unknownClasses("flex wibble-3", at(800)), ["wibble-3"])
})

test("what the first drawn run showed", () => {
  assert.equal(tw("hidden md:table-cell", at(1200)).hidden, false)
  assert.equal(tw("hidden md:table-cell", at(500)).hidden, true)
  assert.equal(tw("border-b", at(800)).view.borderColor, light.border)
  assert.equal(tw("border border-input", at(800)).view.borderColor, light.input)
  assert.equal(tw("grid gap-2", at(800)).view.flexDirection, "column")
  assert.equal(tw("grid sm:grid-cols-2", at(800)).grid, 2)
})
