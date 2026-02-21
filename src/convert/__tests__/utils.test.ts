import { escapeUrlSlashes, unescapeMarkdown } from "../utils"

describe("escapeUrlSlashes", () => {
  it("escapes plain text URLs", () => {
    expect(escapeUrlSlashes("go https://example.com/path")).toBe(
      "go https:\\/\\/example.com\\/path"
    )
  })

  it("does not escape markdown links", () => {
    const input = "[example](https://example.com/path)"
    expect(escapeUrlSlashes(input)).toBe(input)
  })

  it("does not escape URLs inside HTML tags", () => {
    const input = '<iframe src="https://player.vimeo.com/video/123"></iframe>'
    expect(escapeUrlSlashes(input)).toBe(input)
  })

  it("does not escape URLs inside HTML blocks", () => {
    const input = "<div>https://example.com/path</div>"
    expect(escapeUrlSlashes(input)).toBe(input)
  })
})

describe("unescapeMarkdown", () => {
  it("unescapes backslash-escaped inline characters", () => {
    expect(unescapeMarkdown("\\*bold\\*")).toBe("*bold*")
    expect(unescapeMarkdown("\\_italic\\_")).toBe("_italic_")
    expect(unescapeMarkdown("\\~strike\\~")).toBe("~strike~")
    expect(unescapeMarkdown("\\`code\\`")).toBe("`code`")
    expect(unescapeMarkdown("\\[link\\]")).toBe("[link]")
    expect(unescapeMarkdown("\\|pipe\\|")).toBe("|pipe|")
    expect(unescapeMarkdown("\\<html>")).toBe("<html>")
  })

  it("unescapes escaped backslashes", () => {
    expect(unescapeMarkdown("\\\\")).toBe("\\")
    expect(unescapeMarkdown("a\\\\b")).toBe("a\\b")
  })

  it("does not remove backslashes before non-target characters", () => {
    expect(unescapeMarkdown("\\n")).toBe("\\n")
    expect(unescapeMarkdown("\\a")).toBe("\\a")
    expect(unescapeMarkdown("C:\\Users")).toBe("C:\\Users")
  })

  it("handles consecutive escaped characters", () => {
    expect(unescapeMarkdown("\\*\\*bold\\*\\*")).toBe("**bold**")
  })

  it("returns plain text unchanged", () => {
    expect(unescapeMarkdown("hello world")).toBe("hello world")
    expect(unescapeMarkdown("")).toBe("")
  })
})
