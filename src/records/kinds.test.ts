import assert from "node:assert/strict"
import { test } from "node:test"

import * as React from "react"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Building2Icon, CalendarDaysIcon, FileTextIcon, PackageIcon, ShapesIcon, ShoppingCartIcon, SquareCheckIcon, UserIcon } from "lucide-react"

import { groupRows, isPartial, kindIcon, KindResults, partialNotes, PartialLine, REF_STATES, RefChip, refLook, refText, type PartialWords, type RefWords, type SourceStatus } from "./kinds"

// The shadcn components are outside this package's tsconfig `include`, so the test runner compiles their JSX the classic way: it needs React in scope.
;(globalThis as { React?: unknown }).React = React

const refWords: RefWords = { noAccess: "No access", notLinked: (app) => `Link your ${app} account`, gone: "Deleted", unreachable: (app) => `${app} didn't answer`, unknownApp: "App not in this workspace" }
const partialWords: PartialWords = {
  timeout: (app) => `${app} did not answer`,
  error: (app) => `${app} had an error`,
  noAccess: (app) => `${app}: no access`,
  notLinked: (app) => `${app}: link your account`,
  pending: (app) => `${app}: loading`,
}
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

test("every standard kind has its icon; any other kind the generic one", () => {
  assert.equal(kindIcon("person"), UserIcon)
  assert.equal(kindIcon("organization"), Building2Icon)
  assert.equal(kindIcon("event"), CalendarDaysIcon)
  assert.equal(kindIcon("task"), SquareCheckIcon)
  assert.equal(kindIcon("document"), FileTextIcon)
  assert.equal(kindIcon("product"), PackageIcon)
  assert.equal(kindIcon("order"), ShoppingCartIcon)
  for (const other of ["com.acme.shipment", "invoice", "toString", "constructor", ""]) assert.equal(kindIcon(other), ShapesIcon, other)
})

test("the five reference states look distinct, and only ok opens", () => {
  const looks = REF_STATES.map((s) => refLook(s).className)
  assert.equal(new Set(looks).size, REF_STATES.length)
  assert.deepEqual(
    REF_STATES.filter((s) => refLook(s).opens),
    ["ok"],
  )
})

test("a reference shows its title only when ok, never a stale one", () => {
  assert.equal(refText("ok", "Ada Fernley", "CRM", refWords), "Ada Fernley")
  assert.equal(refText("no-access", "Ada Fernley", "CRM", refWords), "No access")
  assert.equal(refText("gone", "Ada Fernley", "CRM", refWords), "Deleted")
  assert.equal(refText("unreachable", "Ada Fernley", "CRM", refWords), "CRM didn't answer")
  assert.equal(refText("unknown-app", "Ada Fernley", "CRM", refWords), "App not in this workspace")
  for (const state of REF_STATES.filter((s) => s !== "ok")) {
    const html = renderToStaticMarkup(createElement(RefChip, { state, title: "Ada Fernley", kind: "person", kindLabel: "Person", source: { name: "CRM" }, href: "/r/1", words: refWords }))
    assert.ok(!html.includes("Ada Fernley"), state)
    assert.ok(!html.includes("href="), `${state} is not a link`)
    assert.ok(html.includes(`data-ref-state="${state}"`))
  }
  const ok = renderToStaticMarkup(createElement(RefChip, { state: "ok", title: "Ada Fernley", kind: "person", kindLabel: "Person", source: { name: "CRM" }, href: "/r/1", words: refWords }))
  assert.ok(ok.includes('href="/r/1"') && text(ok).startsWith("Ada Fernley"), ok)
  const inert = renderToStaticMarkup(createElement(RefChip, { state: "ok", title: "Ada Fernley", kind: "person", kindLabel: "Person", source: { name: "CRM" }, href: "/r/1", words: refWords, inert: true }))
  assert.ok(!inert.includes("href=") && !inert.includes("<button"), "inert inside another control")
})

test("the partial line names every source that is not ok, and nothing when all are", () => {
  const sources: SourceStatus[] = [
    { name: "CRM", state: "not-linked" },
    { name: "Warehouse", state: "no-access" },
    { name: "ERP", state: "timeout" },
    { name: "Mail", state: "ok" },
    { name: "Books", state: "error" },
    { name: "Calendar", state: "pending" },
  ]
  assert.deepEqual(
    partialNotes(sources, partialWords).map((n) => n.text),
    ["CRM: link your account", "Warehouse: no access", "ERP did not answer", "Books had an error", "Calendar: loading"],
  )
  assert.ok(isPartial(sources))
  const allOk = sources.map((s) => ({ ...s, state: "ok" as const }))
  assert.ok(!isPartial(allOk))
  assert.equal(renderToStaticMarkup(createElement(PartialLine, { sources: allOk, words: partialWords })), "")
})

test("grouped results keep the sources' order, a loading source its place, and drop ok sources without rows", () => {
  const sources: SourceStatus[] = [
    { name: "ERP", state: "ok" },
    { name: "CRM", state: "ok" },
    { name: "Warehouse", state: "pending" },
    { name: "Books", state: "ok" },
  ]
  const rows = [
    { uri: "clegra://crm/contact/1", title: "Ada Fernley", kind: "person", source: "CRM" },
    { uri: "clegra://erp/customer/7", title: "Ada Fernley", kind: "person", source: "ERP" },
    { uri: "clegra://crm/contact/2", title: "Adam Royce", kind: "person", source: "CRM" },
  ]
  assert.deepEqual(
    groupRows(rows, sources).map((g) => [g.source.name, g.rows.map((r) => r.uri)]),
    [
      ["ERP", ["clegra://erp/customer/7"]],
      ["CRM", ["clegra://crm/contact/1", "clegra://crm/contact/2"]],
      ["Warehouse", []],
    ],
  )
})

test("results show the empty state only when nothing is loading", () => {
  const words = { empty: "No records", loading: "Loading", partial: partialWords }
  const empty = renderToStaticMarkup(createElement(KindResults, { rows: [], sources: [{ name: "CRM", state: "ok" }], onSelect: () => {}, words }))
  assert.ok(empty.includes('data-kind-results-state="empty"') && text(empty).includes("No records"))
  const loading = renderToStaticMarkup(createElement(KindResults, { rows: [], sources: [{ name: "CRM", state: "pending" }], onSelect: () => {}, words }))
  assert.ok(loading.includes('data-kind-results-state="loading"') && !loading.includes("No records"))
})
