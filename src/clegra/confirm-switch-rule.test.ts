import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { needsConfirmation } from "./confirm-switch-rule"

describe("ConfirmSwitch: which direction asks first", () => {
  it("asks only when turning on, by default's «on»", () => {
    assert.equal(needsConfirmation(true, "on"), true)
    assert.equal(needsConfirmation(false, "on"), false)
  })
  it("asks only when turning off with «off»", () => {
    assert.equal(needsConfirmation(false, "off"), true)
    assert.equal(needsConfirmation(true, "off"), false)
  })
  it("asks both ways with «both»", () => {
    assert.equal(needsConfirmation(true, "both"), true)
    assert.equal(needsConfirmation(false, "both"), true)
  })
})
