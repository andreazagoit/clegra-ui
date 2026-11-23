import assert from "node:assert/strict"
import { test } from "node:test"

import { countLabel, initials, isCurrentPath, railBlocks } from "./model"

test("counts past 99 read 99+", () => {
  assert.equal(countLabel(3), "3")
  assert.equal(countLabel(99), "99")
  assert.equal(countLabel(100), "99+")
})

test("initials: two words of the name, else the address", () => {
  assert.equal(initials("Anna Rossi", "anna@prova.test"), "AR")
  assert.equal(initials("anna maria rossi"), "AM")
  assert.equal(initials("", "anna@prova.test"), "A")
  assert.equal(initials("  ", ""), "?")
})

test("the current place: sub-pages count, the root only itself", () => {
  assert.equal(isCurrentPath("/", "/"), true)
  assert.equal(isCurrentPath("/profile", "/"), false)
  assert.equal(isCurrentPath("/platform/billing/clienti", "/platform/billing"), true)
  assert.equal(isCurrentPath("/platformx", "/platform"), false)
  assert.equal(isCurrentPath("/store", "/store?app=x"), true)
})

test("the rail's blocks: one per shown group; a joining group goes on in the block of the group shown before it, after a line when it asks for one", () => {
  const ids = (blocks: { group: { id: string }; line: boolean }[][]) => blocks.map((block) => block.map(({ group, line }) => (line ? `| ${group.id}` : group.id)))
  // The client's rail: Home and the apps of base in one pill, then a line, the installed apps, a line, the store.
  assert.deepEqual(
    ids(railBlocks([{ id: "home", items: [1] }, { id: "builtin", items: [1], join: "flush" }, { id: "installed", items: [1, 2], join: "line" }, { id: "store", items: [1], join: "line" }])),
    [["home", "builtin", "| installed", "| store"]]
  )
  // No installed apps: the store still goes on in the same block, after one line.
  assert.deepEqual(
    ids(railBlocks([{ id: "home", items: [1] }, { id: "builtin", items: [1], join: "flush" }, { id: "installed", items: [], join: "line" }, { id: "store", items: [1], join: "line" }])),
    [["home", "builtin", "| store"]]
  )
  // Without `join` every group is a block of its own; the first of a block never has a line.
  assert.deepEqual(ids(railBlocks([{ id: "a", items: [1] }, { id: "b", items: [1] }])), [["a"], ["b"]])
  assert.deepEqual(ids(railBlocks([{ id: "store", items: [1], join: "line" }])), [["store"]])
  assert.deepEqual(railBlocks([{ items: [] }]), [])
})
