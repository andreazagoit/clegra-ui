import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { HouseIcon } from "lucide-react"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { AppShell, ShellHeader, ShellMain, ShellRail, useShell } from "./index"

// The shell in a server render, as a page's first HTML: with chrome, and embedded (inside Clegra) without any.
function Probe() {
  const { embedded } = useShell()
  return h("p", { "data-probe": embedded ? "embedded" : "standalone" }, "Ordini")
}
const page = (embedded?: boolean) =>
  renderToStaticMarkup(
    h(AppShell, {
      embedded,
      rail: h(ShellRail, { groups: [{ id: "pages", items: [{ id: "orders", label: "Ordini", href: "/orders", icon: HouseIcon, active: true }] }], user: { name: "Anna Rossi", email: "anna@prova.test", href: "/account" } }),
      nav: h("nav", { "data-probe-nav": "" }, "nav"),
      header: h(ShellHeader, { phone: false }, h("span", null, "header")),
      bottomBar: h("div", { "data-probe-bottom": "" }),
      aside: h("aside", { "data-probe-aside": "" }),
      chrome: h("span", { "data-probe-chrome": "" }),
      children: h(ShellMain, { label: "Ordini" }, h(Probe)),
    }),
  )

describe("AppShell: embedded inside Clegra, only the page", () => {
  test("standalone: the rail, the nav, the header and the slots are drawn", () => {
    const html = page()
    assert.match(html, /data-sidebar-panels/)
    assert.match(html, /data-sidebar-panel="rail"/)
    // The rail in blocks: the group's glass pill, and the account's detached under it.
    assert.match(html, /data-rail-block="pages"[\s\S]*data-rail-account=""/)
    assert.match(html, /data-app="orders"/)
    assert.match(html, /data-probe-nav/)
    assert.match(html, /data-header-bar/)
    assert.match(html, /data-probe-bottom/)
    assert.match(html, /data-probe-aside/)
    assert.match(html, /data-probe-chrome/)
    assert.match(html, /data-probe="standalone"/)
    assert.doesNotMatch(html, /data-shell-embedded/)
  })

  test("embedded: no rail, nav, header, bottom bar, aside or chrome; the page, with the header's room given back", () => {
    const html = page(true)
    for (const mark of ["data-sidebar-panels", "data-sidebar-panel", "data-app=", "account-button", "data-probe-nav", "data-header-bar", "data-probe-bottom", "data-probe-aside", "data-probe-chrome", "data-window-buttons"]) assert.ok(!html.includes(mark), `embedded draws no ${mark}`)
    assert.match(html, /data-shell-embedded=""/)
    assert.match(html, /data-shell-main=""[^>]*>|aria-label="Ordini"/)
    assert.match(html, /data-probe="embedded"/, "useShell() says embedded")
    assert.match(html, /--shell-header:var\(--shell-gutter\)/)
  })
})
