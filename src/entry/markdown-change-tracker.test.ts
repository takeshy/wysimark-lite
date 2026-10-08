import assert from "node:assert/strict"
import { it } from "node:test"
import { MarkdownChangeTracker } from "./markdown-change-tracker"

it("does not emit normalization and restores the exact source on undo", () => {
  const tracker = new MarkdownChangeTracker("# Title\ntext", "# Title\n\ntext")
  assert.equal(tracker.next("# Title\n\ntext"), undefined)
  assert.equal(tracker.current("# Title\n\ntext"), "# Title\ntext")
  assert.equal(tracker.next("# Title\n\ntext!"), "# Title\n\ntext!")
  assert.equal(tracker.next("# Title\n\ntext!"), undefined)
  assert.equal(tracker.next("# Title\n\ntext"), "# Title\ntext")
})

it("retains CRLF even if edits remove the node carrying source metadata", () => {
  const tracker = new MarkdownChangeTracker("first\r\n\r\nsecond\r\n", "first\r\n\r\nsecond\r\n")
  assert.equal(tracker.next("second\n"), "second\r\n")
  assert.equal(tracker.current("second\n"), "second\r\n")
})

it("allows imperative setMarkdown to emit its exact source once", () => {
  const source = "# New\r\ntext"
  const tracker = new MarkdownChangeTracker(source, "# New\r\n\r\ntext", true)
  assert.equal(tracker.current("# New\n\ntext"), source)
  assert.equal(tracker.next("# New\n\ntext"), source)
  assert.equal(tracker.next("# New\n\ntext"), undefined)
})

it("preserves mixed endings until an actual edit, then normalizes to the first ending", () => {
  const source = "first\n\nsecond\r\nthird"
  const tracker = new MarkdownChangeTracker(source, "first\n\nsecond\nthird")
  assert.equal(tracker.next("first\n\nsecond\nthird"), undefined)
  assert.equal(tracker.current("first\n\nsecond\nthird"), source)
  assert.equal(tracker.next("first!\n\nsecond\r\nthird"), "first!\n\nsecond\nthird")
})
