import { escapeUrlSlashes } from "../utils"

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
