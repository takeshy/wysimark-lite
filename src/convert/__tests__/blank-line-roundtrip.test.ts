import { describe, it } from "node:test"
import assert from "node:assert"
import { parse } from "../parse"
import { serialize } from "../serialize"

describe("blank line round-trip", () => {
  it("preserves a single blank line between paragraphs (NBSP marker)", () => {
    const input = "text A\n\n\u00A0\n\ntext B"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves multiple blank lines between paragraphs (NBSP markers)", () => {
    const input = "text A\n\n\u00A0\n\n\u00A0\n\ntext B"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves blank lines via MDAST position gaps (no NBSP)", () => {
    // "text A\n\n\n\ntext B" = 4 newlines between content
    // Gap between textA(end line1) and textB(start line5) = 5-1-1 = 3
    // Extra blank lines = 3-1 = 2, so 2 empty paragraphs inserted
    const input = "text A\n\n\n\ntext B"
    const parsed = parse(input)
    assert.strictEqual(parsed.length, 4) // textA + 2 empty + textB
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\n\u00A0\n\ntext B")
  })

  it("preserves a single extra blank line via MDAST position gap", () => {
    // "text A\n\n\ntext B" = 3 newlines
    // Gap = 4-1-1 = 2, extra = 2-1 = 1 empty paragraph
    const input = "text A\n\n\ntext B"
    const parsed = parse(input)
    assert.strictEqual(parsed.length, 3) // textA + 1 empty + textB
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\ntext B")
  })

  it("preserves blank line at start of document (NBSP marker)", () => {
    const input = "\u00A0\n\ntext A"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves blank line at end of document (NBSP marker)", () => {
    const input = "text A\n\n\u00A0"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("round-trip: empty paragraph in Slate tree serializes to NBSP and parses back", () => {
    // Simulate what happens when user enters a blank line in WYSIWYG
    const slateTree = [
      { type: "paragraph", children: [{ text: "text A" }] },
      { type: "paragraph", children: [{ text: "" }] }, // blank line
      { type: "paragraph", children: [{ text: "text B" }] },
    ]
    const serialized = serialize(slateTree as any)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\ntext B")
    const parsed = parse(serialized)
    assert.strictEqual(parsed.length, 3)
    assert.deepStrictEqual(parsed[0], { type: "paragraph", children: [{ text: "text A" }] })
    assert.deepStrictEqual(parsed[1], { type: "paragraph", children: [{ text: "" }] })
    assert.deepStrictEqual(parsed[2], { type: "paragraph", children: [{ text: "text B" }] })
  })
})
