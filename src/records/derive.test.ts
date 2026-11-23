import assert from "node:assert/strict"
import { test } from "node:test"

import { contactTime, derive, fill, spoken, stateMessage } from "./derive"
import { labels, shipment, shipments } from "./fixtures"

const record = shipments[0]!

test("a card carries up to 4 fields and 2 actions, and the amount instead of the quantity", () => {
  const card = derive(shipment, record, "card", labels)
  assert.equal(card.title, "SP-2026-0481 · Rossi Srl")
  assert.equal(card.status?.text, "In viaggio")
  assert.equal(card.status?.tone, "info")
  assert.ok(card.amount)
  assert.equal(card.quantity, undefined)
  assert.equal(card.fields.length, 4)
  assert.equal(card.actions.length, 2)
  assert.equal(card.more.length, 1)
})

test("a row shows one of amount, quantity, date; a chip only title and status", () => {
  const row = derive(shipment, record, "row", labels)
  assert.ok(row.amount && !row.quantity && !row.date)
  assert.equal(row.fields.length + row.actions.length, 0)
  const withoutPrices = derive(shipment, record, "row", labels, { prices: false })
  assert.ok(!withoutPrices.amount && withoutPrices.quantity === "3 colli" && !withoutPrices.date)
  const chip = derive(shipment, record, "chip", labels)
  assert.ok(chip.status && !chip.subtitle && !chip.amount)
})

test("money leaves with the prices permission, on every surface", () => {
  const detail = derive(shipment, record, "detail", labels, { prices: false })
  assert.equal(detail.amount, undefined)
  assert.ok(detail.fields.every((f) => f.format !== "money"))
  assert.ok(detail.groups.every((g) => g.fields.every((f) => f.format !== "money")))
})

test("the spoken sentence is the summary, else derived; states have words", () => {
  assert.equal(spoken(shipment, record, labels), "Spedizione SP-2026-0481 per Rossi Srl: in viaggio, consegna prevista il 12 novembre.")
  assert.match(spoken({ ...shipment, summary: undefined }, record, labels), /^Spedizione SP-2026-0481 · Rossi Srl, In viaggio, /)
  assert.equal(stateMessage("no-access", shipment).title, "Non hai accesso a questo contenuto di Spedizioni")
})

test("a template leaves nothing for a missing value, and reads a dotted path", () => {
  assert.equal(fill("{number} · {customer}", { number: "L2026-004" }), "L2026-004")
  assert.equal(fill("{a.b} di {c}", { a: { b: "Uno" }, c: 2 }), "Uno di 2")
})

test("an unreachable application says its name and the last contact, only when there was one", () => {
  const now = new Date(2026, 10, 11, 12, 0)
  assert.equal(contactTime(new Date(2026, 10, 11, 10, 42).toISOString(), now), "10:42")
  assert.match(contactTime(new Date(2026, 10, 10, 10, 42).toISOString(), now) ?? "", /^10 nov, 10:42$/)
  assert.equal(contactTime(null, now), null)
  assert.equal(contactTime("not a date", now), null)
  assert.deepEqual(stateMessage("unreachable", { app: "Lavori" }, "10:42"), { title: "Lavori non raggiungibile", hint: "Ultimo contatto 10:42", action: "Riprova" })
  assert.deepEqual(stateMessage("unreachable", { app: "Lavori" }, null), { title: "Lavori non raggiungibile", action: "Riprova" })
  assert.deepEqual(stateMessage("uninstalled", { app: "Lavori" }), { title: "Lavori non è più installata" })
})
