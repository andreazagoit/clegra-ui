import assert from "node:assert/strict"
import { test } from "node:test"

import * as React from "react"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { labels, shipment, shipments } from "./fixtures"
import { derive } from "./derive"
import { RecordCard, RecordChip, RecordDetail, RecordRow, RecordSkeleton, RecordState } from "./record"

// The shadcn components are outside this package's tsconfig `include`, so the test runner compiles their JSX the classic way: it needs React in scope.
;(globalThis as { React?: unknown }).React = React

const record = shipments[0]!
const source = { app: "Spedizioni", type: "Spedizione" }
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

test("a card is drawn with its anatomy: «App · Tipo», status, title, subtitle, amount, fields, two actions and «⋯»", () => {
  const d = derive(shipment, record, "card", labels)
  const html = renderToStaticMarkup(createElement(RecordCard, { source, d, menu: [{ id: "share", label: "Condividi in una chat" }] }))
  const words = text(html)
  const head = "Spedizioni · Spedizione In viaggio SP-2026-0481 · Rossi Srl"
  assert.equal(words.slice(0, head.length), head)
  // Money and dates come with non-breaking spaces: compared as the words they are.
  const plain = (value: string) => value.replace(/\s+/g, " ")
  for (const field of d.fields) assert.ok(words.includes(field.label) && words.includes(plain(field.text)), field.label)
  assert.ok(words.includes(plain(d.amount!)))
  assert.equal((html.match(/data-record-action=/g) ?? []).length, 2)
  assert.ok(html.includes("data-record-more"), "the rest is under «⋯»")
  assert.ok(html.includes('data-record="card"'))
})

test("a card without actions nor host entries has no footer; a row carries one value; a chip the title", () => {
  const bare = { ...derive(shipment, record, "card", labels), actions: [], more: [] }
  assert.ok(!renderToStaticMarkup(createElement(RecordCard, { source, d: bare })).includes("data-record-more"))
  const row = text(renderToStaticMarkup(createElement(RecordRow, { source, d: derive(shipment, record, "row", labels) })))
  assert.ok(row.includes("SP-2026-0481 · Rossi Srl") && row.includes("Spedizioni · Spedizione") && row.includes("In viaggio"), row)
  const chip = renderToStaticMarkup(createElement(RecordChip, { source, d: derive(shipment, record, "chip", labels) }))
  assert.equal(text(chip), "SP-2026-0481 · Rossi Srl")
  assert.ok(chip.startsWith("<span"), "not a button without something to open")
  assert.ok(renderToStaticMarkup(createElement(RecordChip, { source, d: derive(shipment, record, "chip", labels), onOpen: () => {} })).startsWith("<button"))
  const detail = text(renderToStaticMarkup(createElement(RecordDetail, { source, d: derive(shipment, record, "detail", labels) })))
  assert.ok(detail.includes("SP-2026-0481 · Rossi Srl") && detail.includes("Importo"), detail)
})

test("a record that can't be shown: the application's name, never the record; a button only with its handler", () => {
  for (const surface of ["card", "row", "detail"] as const) {
    const noAccess = renderToStaticMarkup(createElement(RecordState, { state: "no-access", source, surface }))
    assert.equal(text(noAccess), "Non hai accesso a questo contenuto di Spedizioni")
    assert.ok(!noAccess.includes("SP-2026") && !noAccess.includes("<button"))
  }
  const down = renderToStaticMarkup(createElement(RecordState, { state: "unreachable", source, lastContact: "10:42", onRetry: () => {} }))
  assert.equal(text(down), "Spedizioni non raggiungibile Ultimo contatto 10:42 Riprova")
  assert.ok(down.includes('data-record-state="unreachable"') && down.includes('role="status"'))
  assert.equal(text(renderToStaticMarkup(createElement(RecordState, { state: "unreachable", source }))), "Spedizioni non raggiungibile")
  assert.equal(text(renderToStaticMarkup(createElement(RecordState, { state: "uninstalled", source }))), "Spedizioni non è più installata")
  assert.equal(text(renderToStaticMarkup(createElement(RecordState, { state: "gone", source }))), "Questo elemento non esiste più Spedizione")
  // A chip says only where it is from.
  assert.equal(text(renderToStaticMarkup(createElement(RecordState, { state: "no-access", source, surface: "chip" }))), "Spedizioni")
  assert.ok(renderToStaticMarkup(createElement(RecordSkeleton, { surface: "card" })).includes('aria-busy="true"'))
})
