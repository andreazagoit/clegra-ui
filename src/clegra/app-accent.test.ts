import assert from "node:assert/strict"
import { test } from "node:test"

import { readdirSync, readFileSync } from "node:fs"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { AppShell } from "../shell/frame"

import { AppAccent, AppAccentContext, appAccentProps, useAppAccent, useAppAccentProps } from "./app-accent"

function Probe({ id }: { id: string }) {
  return h("i", { "data-probe": id, "data-accent": useAppAccent() })
}

test("<AppAccent> marks its element and tells its accent to what is inside; outside it is Clegra's blue", () => {
  const html = renderToStaticMarkup(h("div", null, h(Probe, { id: "out" }), h(AppAccent, { accent: "green", className: "x" }, h(Probe, { id: "in" }), h(AppAccent, { accent: "orange" }, h(Probe, { id: "nested" })))))
  assert.match(html, /<div class="x" data-app-accent="green">/)
  assert.match(html, /data-probe="out" data-accent="blue"/)
  assert.match(html, /data-probe="in" data-accent="green"/)
  assert.match(html, /data-probe="nested" data-accent="orange"/)
  assert.deepEqual(appAccentProps("teal"), { "data-app-accent": "teal" })
})

test("<AppShell accent> tints the app's bar and content, never the rail or the assistant's aside", () => {
  const html = renderToStaticMarkup(
    h(AppShell, { accent: "red", rail: h(Probe, { id: "rail" }), nav: h(Probe, { id: "nav" }), header: h(Probe, { id: "header" }), aside: h(Probe, { id: "aside" }), children: h(Probe, { id: "page" }) }),
  )
  assert.match(html, /data-sidebar-panel="nav" data-app-accent="red"/)
  assert.match(html, /data-page-area="" data-app-accent="red"/)
  assert.doesNotMatch(html, /data-sidebar-panel="rail"[^>]*data-app-accent/)
  for (const [id, accent] of [["rail", "blue"], ["nav", "red"], ["header", "red"], ["page", "red"], ["aside", "blue"]]) assert.match(html, new RegExp(`data-probe="${id}" data-accent="${accent}"`), id)
  // Clegra's own page: no accent anywhere.
  assert.doesNotMatch(renderToStaticMarkup(h(AppShell, { rail: null, children: "page" })), /data-app-accent/)
})

function PortalProbe({ id }: { id: string }) {
  return h("i", { "data-probe": id, ...useAppAccentProps() })
}

test("an overlay's portal takes the accent in force where it is opened, none outside every app's area", () => {
  const html = renderToStaticMarkup(
    h("div", null, h(PortalProbe, { id: "out" }), h(AppAccentContext, { accent: "red", children: h(PortalProbe, { id: "in" }) }), h(AppAccent, { accent: "blue" }, h(PortalProbe, { id: "blue" }))),
  )
  assert.match(html, /<i data-probe="out"><\/i>/)
  assert.match(html, /data-probe="in" data-app-accent="red"/)
  assert.match(html, /data-probe="blue" data-app-accent="blue"/)
})

test("every web overlay that portals out of the page carries the app's accent on its portal", () => {
  const dir = new URL("../components/", import.meta.url)
  const web = readdirSync(dir).filter((f) => f.endsWith(".tsx") && !/\.(native|ios)\.tsx$/.test(f))
  const portals = web.filter((f) => /Primitive\.Portal\b/.test(readFileSync(new URL(f, dir), "utf8")))
  assert.ok(portals.length >= 10, portals.join(","))
  for (const f of portals) {
    const source = readFileSync(new URL(f, dir), "utf8")
    for (const tag of source.match(/<\w+Primitive\.Portal\b[^>]*>/g) ?? []) assert.match(tag, /useAppAccentProps\(\)/, `${f}: ${tag}`)
  }
})

test("<AppShell accent>'s chrome (the search, the app's menu) portals in the app's accent", () => {
  const html = renderToStaticMarkup(h(AppShell, { accent: "green", rail: null, chrome: h(PortalProbe, { id: "chrome" }), children: null }))
  assert.match(html, /data-probe="chrome" data-app-accent="green"/)
})
