import assert from "node:assert/strict"
import { test } from "node:test"

import { countLabel, initials, isCurrentPath, railGroupsShown } from "./model"

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

test("the rail's lines go only between groups that are shown", () => {
  const shown = railGroupsShown([{ id: "home", items: [1] }, { id: "builtin", items: [] }, { id: "installed", items: [1, 2] }, { id: "store", items: [1] }])
  assert.deepEqual(
    shown.map(({ group, line }) => [group.id, line]),
    [
      ["home", false],
      ["installed", true],
      ["store", true],
    ]
  )
  assert.deepEqual(railGroupsShown([{ items: [] }]), [])
})
