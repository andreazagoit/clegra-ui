import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { ReceiptIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { SiteShell } from "./index"

// An app's own website on its frame, as the first HTML: the docked sidebar and the phone's top bar are both drawn (CSS picks one), the drawer is not.
const page = (accent?: "green") =>
  renderToStaticMarkup(
    h(SiteShell, {
      accent,
      brand: { name: "Invoices", icon: ReceiptIcon, href: "/" },
      label: "Invoices sections",
      sections: [
        { id: "main", items: [{ id: "invoices", label: "Invoices", href: "/invoices", icon: ReceiptIcon, active: true }] },
        { id: "people", label: "People", items: [{ id: "customers", label: "Customers", href: "/customers", icon: UsersIcon }] },
      ],
      footer: [{ id: "settings", label: "Settings", href: "/settings", icon: SettingsIcon }],
      footerExtra: h("p", { "data-probe-user": "" }, "Ada Example"),
      menuLabel: "Open menu",
      closeLabel: "Close",
      children: h("main", { "data-probe-page": "" }, "Page"),
    }),
  )

describe("SiteShell: an app's website with its sidebar", () => {
  test("the sidebar: the brand, the sections, the open one, the settings and the extra at the bottom", () => {
    const html = page()
    assert.match(html, /data-site-shell=""/)
    assert.match(html, /data-site-sidebar=""/)
    assert.match(html, /<aside aria-label="Invoices sections" data-app-bar="site" data-app-bar-place="docked"/)
    assert.match(html, /<nav aria-label="Invoices sections"/)
    assert.match(html, /href="\/invoices" aria-current="page"/)
    assert.doesNotMatch(html, /href="\/customers" aria-current/)
    assert.match(html, />People</)
    assert.match(html, /href="\/settings"/)
    assert.match(html, /data-probe-user=""/)
    assert.match(html, /data-site-brand=""[^>]*>|href="\/"[^>]*data-site-brand/)
    assert.match(html, /data-probe-page=""/)
  })

  test("the phone's ☰: names the drawer it opens, closed at first; the drawer is not in the first HTML", () => {
    const html = page()
    const menu = html.match(/<button[^>]*data-site-menu=""[^>]*>/)?.[0]
    assert.ok(menu, "the ☰ is drawn")
    assert.match(menu, /aria-label="Open menu"/)
    assert.match(menu, /aria-expanded="false"/)
    assert.match(menu, /aria-controls="[^"]+"/)
    assert.doesNotMatch(html, /data-site-drawer/)
  })

  test("an accent marks the whole site; none, Clegra's blue", () => {
    assert.match(page("green"), /data-site-shell="" data-app-accent="green"/)
    assert.doesNotMatch(page(), /data-app-accent/)
  })
})
