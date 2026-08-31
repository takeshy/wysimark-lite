import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { shouldInsertSoftBreak } from "."

describe("paragraph break behavior", () => {
  it("uses conventional Enter behavior by default", () => {
    assert.equal(shouldInsertSoftBreak(false, false), false)
    assert.equal(shouldInsertSoftBreak(false, true), true)
  })

  it("uses Enter for a soft break when configured", () => {
    assert.equal(shouldInsertSoftBreak(true, false), true)
    assert.equal(shouldInsertSoftBreak(true, true), false)
  })
})
