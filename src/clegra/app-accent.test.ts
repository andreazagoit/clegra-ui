import assert from "node:assert/strict"
import { test } from "node:test"

import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { AppShell } from "../shell/frame"

import { AppAccent, appAccentProps, useAppAccent } from "./app-accent"

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
