/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { escapeUrlSlashes, unescapeMarkdown } from "../utils"

describe("escapeUrlSlashes", () => {
  it("escapes plain text URLs", () => {
    assert.strictEqual(
      escapeUrlSlashes("go https://example.com/path"),
      "go https:\\/\\/example.com\\/path"
    )
  })

  it("does not escape markdown links", () => {
    const input = "[example](https://example.com/path)"
    assert.strictEqual(escapeUrlSlashes(input), input)
  })

  it("does not escape URLs inside HTML tags", () => {
    const input = '<iframe src="https://player.vimeo.com/video/123"></iframe>'
    assert.strictEqual(escapeUrlSlashes(input), input)
  })

  it("does not escape URLs inside HTML blocks", () => {
    const input = "<div>https://example.com/path</div>"
    assert.strictEqual(escapeUrlSlashes(input), input)
  })
})

describe("unescapeMarkdown", () => {
  it("unescapes backslash-escaped inline characters", () => {
    assert.strictEqual(unescapeMarkdown("\\*bold\\*"), "*bold*")
    assert.strictEqual(unescapeMarkdown("\\_italic\\_"), "_italic_")
    assert.strictEqual(unescapeMarkdown("\\~strike\\~"), "~strike~")
    assert.strictEqual(unescapeMarkdown("\\`code\\`"), "`code`")
    assert.strictEqual(unescapeMarkdown("\\[link\\]"), "[link]")
    assert.strictEqual(unescapeMarkdown("\\|pipe\\|"), "|pipe|")
    assert.strictEqual(unescapeMarkdown("\\<html>"), "<html>")
  })

  it("unescapes escaped backslashes", () => {
    assert.strictEqual(unescapeMarkdown("\\\\"), "\\")
    assert.strictEqual(unescapeMarkdown("a\\\\b"), "a\\b")
  })

  it("does not remove backslashes before non-target characters", () => {
    assert.strictEqual(unescapeMarkdown("\\n"), "\\n")
    assert.strictEqual(unescapeMarkdown("\\a"), "\\a")
    assert.strictEqual(unescapeMarkdown("C:\\Users"), "C:\\Users")
  })

  it("handles consecutive escaped characters", () => {
    assert.strictEqual(unescapeMarkdown("\\*\\*bold\\*\\*"), "**bold**")
  })

  it("returns plain text unchanged", () => {
    assert.strictEqual(unescapeMarkdown("hello world"), "hello world")
    assert.strictEqual(unescapeMarkdown(""), "")
  })
})
