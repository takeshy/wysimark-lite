import assert from "node:assert/strict"
import { it } from "node:test"
import { createEditor, Editor, Transforms } from "slate"
import type { Element } from "../types"
import { parse } from "../parse"
import { serialize } from "../serialize"
import { plugins } from "../../entry/plugins"
import { createSink } from "../../sink"

function normalized(input: string) {
  const base = createEditor()
  base.wysimark = {}
  const editor = createSink(plugins).withSink(base, { image: {}, toolbar: {} } as never)
  editor.children = parse(input)
  Editor.normalize(editor, { force: true })
  return editor
}

for (const input of [
  "[1]: https://example.com/\n[2]: https://example.org/\n",
  "Sites\n\n[1]: https://example.com/\n[unused]: https://example.org/",
  '[title]: <https://example.com/a b>\n  "Title"\n',
  '[duplicate]: https://example.com/first\n[duplicate]: https://example.com/second',
  "\u00a0\n\ntext",
  "\r\n\r\n",
  "\r\ntext\r\n\r\n",
  "first\r\nsecond\r\n\r\nthird\r\n",
  "first  \r\nsecond\r\n\r\nthird\r\n",
  "first\rsecond\r\rthird\r",
  "```text\r\nfirst\r\nsecond\r\n```\r\n",
]) {
  it(`keeps source content through normalization and three saves: ${JSON.stringify(input)}`, () => {
    let saved = input
    for (let pass = 0; pass < 3; pass++) {
      saved = serialize(normalized(saved).children as Element[])
      assert.equal(saved, input)
    }
  })
}

it("keeps both used and unused definitions after editing body text", () => {
  const editor = normalized("See [site][1].\n\n[1]: https://example.com/\n[unused]: https://example.org/")
  Transforms.select(editor, Editor.end(editor, [0]))
  editor.insertText(" edited")
  const saved = serialize(editor.children as Element[])
  assert.match(saved, /edited\n\n\[1\]: https:\/\/example.com\/\n\[unused\]: https:\/\/example.org\/$/)
})

it("continues to require opting into internal links", () => {
  assert.equal(parse("[[Page]]")[0].children.some((node) => "type" in node && node.type === "anchor"), false)
  assert.equal(parse("[[Page]]", { enableInternalLinks: true })[0].children.some((node) => "type" in node && node.type === "anchor"), true)
})
