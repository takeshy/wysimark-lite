import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Editor, Element as SlateElement, Node, Transforms } from "slate"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Slate, withReact, RenderLeafProps } from "slate-react"

import { plugins } from "../../entry/plugins"
import { createSink } from "../../sink"
import { parse } from "../parse"
import { serialize } from "../serialize"
import type { Element } from "../types"

const options = { enableInternalLinks: true }
const { withSink, SinkEditable } = createSink(plugins)

function makeEditor(input: string) {
  const base = createEditor()
  base.wysimark = options
  const editor = withSink(base, { image: {}, toolbar: {} } as never)
  editor.children = parse(input, options)
  Editor.normalize(editor, { force: true })
  return editor
}

function content(value: unknown): unknown {
  if (Array.isArray(value)) return value
    .filter((node) => !(node.type === "paragraph" && node.__collapsible && Node.string(node) === ""))
    .map(content)
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).filter(([key]) => !key.startsWith("__")).map(([key, child]) => [key, content(child)])
  )
  return value
}

describe("Markdown preservation through editor normalization and repeated saves", () => {
  const fixtures = [
    "",
    "```python\nurl = 'https://example.com/api'\n```",
    "```python\npattern = r'https:\\/\\/example.com'\n```",
    "`https://example.com/api`",
    "```text\n\\[[literal]] and \\]\n```",
    "`\\[[literal]]`",
    "See https://example.com/api and <https://example.com>.",
    "```\nplain code\n```",
    "```python title=\"test.py\"\nprint(1)\n```",
    "~~~~text title=`example`\n  ~~~\nbody\n~~~~",
    "````text\n  ```\nend\n````",
    "|code|\n|---|\n|`a\\|b`|",
    "|code|\n|---|\n|<code>a&#92;&#124;b</code>|",
    "|a\\|b|c|\n|---|---|\n|d|e|",
    "|A|B|\n|---|---|\n|one<br>two|`a<br>b`|",
    "[a](<https://example.com/a b>)",
    "[a](<https://example.com/a(b>)",
    '[a](https://example.com "path\\\\name")',
    "![alt](<https://example.com/a b.png>)",
    "first\nsecond",
    "first  \nsecond",
    "**first\nsecond**",
    "**first  \nsecond**",
    "first\n\n\nsecond",
    "\n\nfirst\n\n",
    "\n\n",
    "\\# a\n\\# b",
    "\\- a\n\\- b",
    "\\> a\n\\> b",
    "1\\. a\n2\\. b",
    "\\---",
    "``  foo  ``",
    "`` `test` ``",
    "# [[Page]]",
    "1. Run:\n\n   ```sh\n   echo hi\n   ```\n\n2. Continue",
    "- first\n\n  second\n\n- next",
    "- first\n  - child\n\n  continuation\n\n- second",
    "3. Run:\n\n   More\n\n4. Continue",
    "- [x] first\n\n  explanation\n\n- [ ] second",
    "Text[^1].\n\n[^1]: Source\n\n    Second paragraph",
    "Use <kbd>Ctrl</kbd> and <sup>2</sup> or <sub>2</sub>.",
    "Text <span class=\"example\">inline</span> text.",
    "> [!tip] [[Page]]\n> **first\n> second**",
    "---",
    "![alt](https://example.com/a.png)",
    "> quote",
    "a[^1][^2]\n\n[^1]: x\n\n[^2]: y",
    "Title\n\\--",
    "Title  \n\\--",
    "H<sub>2</sub>O and stray </sup> a <code> b <u>x",
    "- x `a\n  b`",
  ]
  for (const input of fixtures) {
    it(`keeps content across three saves: ${JSON.stringify(input)}`, () => {
      const original = content(parse(input, options))
      let current = input
      let firstSave: string | undefined
      for (let pass = 0; pass < 3; pass++) {
        const editor = makeEditor(current)
        const saved = serialize(editor.children as Element[], options)
        assert.equal(saved.includes("\u00A0"), false)
        assert.deepEqual(content(parse(saved, options)), original)
        if (pass) assert.equal(saved, firstSave)
        else firstSave = saved
        current = saved
      }
    })
  }

  it("does not change URLs, literal escapes, empty documents, or source line breaks", () => {
    for (const input of ["", "```python\nurl = 'https://example.com/api'\n```",
      "`https://example.com/api`", "first\nsecond", "first  \nsecond", "**first\nsecond**", "\n\nfirst\n\n"]) {
      assert.equal(serialize(makeEditor(input).children as Element[], options), input)
    }
  })

  it("never serializes editor-only paragraphs, but saves text entered into them", () => {
    const editor = makeEditor("```\ncode\n```")
    assert.equal(serialize(editor.children as Element[], options), "```\ncode\n```")
    Transforms.select(editor, Editor.end(editor, []))
    editor.insertText("after")
    assert.equal(serialize(editor.children as Element[], options), "```\ncode\n```\n\nafter")
  })

  it("keeps rich list content editable and keeps its continuation paragraphs inside the item", () => {
    const editor = makeEditor("1. first\n\n   second\n\n2. next")
    Transforms.select(editor, { path: [0, 1, 0], offset: 3 })
    editor.insertBreak()
    editor.insertText("edited")
    const first = editor.children[0]
    assert.ok(SlateElement.isElement(first) && first.type === "ordered-list-item" && first.blockChildren)
    assert.equal(first.children.length, 3)
    const saved = serialize(editor.children as Element[], options)
    assert.match(saved, /2\. next$/)
    assert.deepEqual(content(parse(saved, options)), content(editor.children))
  })

  it("renders keyboard tags, superscripts, footnotes, and rich list blocks", () => {
    const editor = withReact(makeEditor("Use <kbd>Ctrl</kbd> and <sup>2</sup>.\n\nText[^1].\n\n[^1]: Source\n\n3. First\n\n   Second paragraph\n\n4. Next"))
    const html = renderToStaticMarkup(createElement(Slate, {
      editor, initialValue: editor.children,
      children: createElement(SinkEditable, {
        readOnly: true,
        renderLeaf: ({ attributes, children }: RenderLeafProps) => createElement("span", attributes, children),
      }),
    }))
    assert.match(html, /<kbd>/)
    assert.match(html, /<sup>/)
    assert.match(html, /id="footnote-1"/)
    assert.match(html, /counter-reset:list-item-depth-0 2/)
    assert.match(html, /Second paragraph/)
  })

  it("continues numbering when inserting an item in a list starting at three", () => {
    const editor = makeEditor("3. first\n4. next")
    Transforms.select(editor, Editor.end(editor, [0]))
    editor.insertBreak()
    editor.insertText("inserted")
    assert.equal(serialize(editor.children as Element[], options), "3. first\n4. inserted\n5. next")
  })

  it("preserves source break types while clearing bold formatting", () => {
    const editor = makeEditor("**first\nsecond**")
    Transforms.select(editor, Editor.range(editor, [0]))
    editor.collapsibleParagraph.convertParagraph()
    assert.equal(serialize(editor.children as Element[], options), "first\nsecond")
  })

  it("types after a footnote reference as plain text, not into the identifier", () => {
    const editor = makeEditor("See note[^1]\n\n[^1]: x")
    Transforms.select(editor, Editor.end(editor, [0]))
    editor.insertText(" more")
    assert.match(serialize(editor.children as Element[], options), /^See note\[\^1\] more\n/)
  })

  it("escapes text typed at the edge of raw inline HTML", () => {
    const editor = makeEditor("<span>x</span> end")
    Transforms.select(editor, { path: [0, 0], offset: "<span>".length })
    editor.insertText("*a*")
    assert.equal(serialize(editor.children as Element[], options), "<span>\\*a\\*x</span> end")
  })

  it("keeps a line break typed next to a source soft break as a hard break", () => {
    const editor = makeEditor("a\nb")
    Transforms.select(editor, { path: [0, 1], offset: 1 })
    editor.insertText("x")
    editor.insertSoftBreak()
    assert.equal(serialize(editor.children as Element[], options), "a\nx  \nb")
  })

  it("splits newlines off marked text so they stay outside mark delimiters", () => {
    assert.equal(serialize([{ type: "paragraph", children: [{ text: "foo\n" }] }] as Element[]), "foo")
    assert.equal(serialize([{ type: "paragraph", children: [
      { text: "x" }, { text: "\nfoo", bold: true },
    ] }] as Element[]), "x  \n**foo**")
  })

  it("does not carry clipboard boundary newlines into the document", () => {
    const editor = makeEditor("start")
    Transforms.select(editor, Editor.end(editor, []))
    editor.pasteMarkdown.pasteMarkdown("\nfoo\n\n")
    assert.equal(serialize(editor.children as Element[], options).endsWith("\n"), false)
  })

  it("saves blank lines added with Enter after a trailing code block", () => {
    const editor = makeEditor("```\ncode\n```")
    Transforms.select(editor, Editor.end(editor, []))
    editor.insertBreak()
    editor.insertBreak()
    editor.insertText("after")
    assert.equal(serialize(editor.children as Element[], options), "```\ncode\n```\n\n\n\nafter")
  })

  for (const tag of ["sub", "mark"]) {
    it(`keeps outer ${tag} formatting after a nested tag closes`, () => {
      const input = `H<${tag}>outer <${tag}>inner</${tag}> outer</${tag}> end`
      const expected = `H<${tag}>outer inner outer</${tag}> end`
      let saved = serialize(makeEditor(input).children as Element[], options)
      assert.equal(saved, expected)
      saved = serialize(makeEditor(saved).children as Element[], options)
      assert.equal(saved, expected)
    })
  }
})
