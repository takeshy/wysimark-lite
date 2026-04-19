import { escapeText } from "../text-utils"

describe("escapeText", () => {
  describe("underscore", () => {
    it("does not escape intraword underscores (CommonMark: not emphasis)", () => {
      expect(escapeText("foo_bar")).toBe("foo_bar")
      expect(escapeText("foo_bar_baz")).toBe("foo_bar_baz")
      expect(escapeText("my_var_name")).toBe("my_var_name")
      expect(escapeText("python_3")).toBe("python_3")
    })

    it("escapes underscores that could open/close emphasis", () => {
      expect(escapeText("_italic_")).toBe("\\_italic\\_")
      expect(escapeText("hello _world_")).toBe("hello \\_world\\_")
      expect(escapeText("a _b_ c")).toBe("a \\_b\\_ c")
    })

    it("escapes trailing/leading underscores adjacent to whitespace", () => {
      expect(escapeText("foo _")).toBe("foo \\_")
      expect(escapeText("_ foo")).toBe("\\_ foo")
    })

    it("does not escape underscores between non-ASCII word-like characters", () => {
      expect(escapeText("あ_い")).toBe("あ_い")
      expect(escapeText("変数_名")).toBe("変数_名")
    })

    it("escapes underscores adjacent to Unicode symbols (CommonMark punctuation)", () => {
      // `$`, `+`, `<`, `|`, `~`, `` ` `` are Unicode S class — CommonMark
      // treats them as punctuation for emphasis flanking rules.
      expect(escapeText("a$_foo_$")).toBe("a$\\_foo\\_$")
      expect(escapeText("a+_foo_+")).toBe("a+\\_foo\\_+")
    })
  })

  describe("tilde", () => {
    it("does not escape intraword tildes (GFM: no strikethrough)", () => {
      expect(escapeText("foo~bar")).toBe("foo~bar")
      expect(escapeText("a~b~c")).toBe("a~b~c")
    })

    it("escapes tildes that could form strikethrough", () => {
      expect(escapeText("~strike~")).toBe("\\~strike\\~")
      expect(escapeText("hello ~world~")).toBe("hello \\~world\\~")
    })
  })

  describe("backslash", () => {
    it("does not escape backslashes before non-punctuation", () => {
      expect(escapeText("C:\\Users\\name")).toBe("C:\\Users\\name")
      expect(escapeText("a\\b")).toBe("a\\b")
    })

    it("escapes backslashes before ASCII punctuation", () => {
      expect(escapeText("a\\*b")).toBe("a\\\\\\*b")
      expect(escapeText("a\\.b")).toBe("a\\\\.b")
    })
  })

  describe("less-than", () => {
    it("does not escape `<` followed by non-tag characters", () => {
      expect(escapeText("a < b")).toBe("a < b")
      expect(escapeText("a<5 && 5>b")).toBe("a<5 && 5>b")
    })

    it("escapes `<` that could start an HTML tag or autolink", () => {
      expect(escapeText("a<div>")).toBe("a\\<div>")
      expect(escapeText("<a>")).toBe("\\<a>")
      expect(escapeText("</close>")).toBe("\\</close>")
    })
  })

  describe("other inline escapes still work", () => {
    it("escapes asterisks", () => {
      expect(escapeText("foo*bar")).toBe("foo\\*bar")
    })

    it("escapes backticks, brackets, and pipes", () => {
      expect(escapeText("`[]|")).toBe("\\`\\[\\]\\|")
    })
  })

  describe("start-of-line escapes", () => {
    it("escapes heading markers", () => {
      expect(escapeText("# heading")).toBe("\\# heading")
    })

    it("escapes ordered list markers", () => {
      expect(escapeText("1. item")).toBe("1\\. item")
    })

    it("escapes list/blockquote markers", () => {
      expect(escapeText("- item")).toBe("\\- item")
      expect(escapeText("> quote")).toBe("\\> quote")
    })
  })
})
