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

test("the rail's blocks: one per shown group; a joining group goes on in the block before it only when that one is shown", () => {
  const ids = (blocks: { id: string }[][]) => blocks.map((block) => block.map((group) => group.id))
  assert.deepEqual(
    ids(railBlocks([{ id: "home", items: [1] }, { id: "builtin", items: [] }, { id: "installed", items: [1, 2] }, { id: "store", items: [1], joinPrevious: true }])),
    [["home"], ["installed", "store"]]
  )
  // No installed apps: the store stands alone, it never joins the block of a group further up.
  assert.deepEqual(
    ids(railBlocks([{ id: "home", items: [1] }, { id: "builtin", items: [1] }, { id: "installed", items: [] }, { id: "store", items: [1], joinPrevious: true }])),
    [["home"], ["builtin"], ["store"]]
  )
  assert.deepEqual(ids(railBlocks([{ id: "store", items: [1], joinPrevious: true }])), [["store"]])
  assert.deepEqual(railBlocks([{ items: [] }]), [])
})
