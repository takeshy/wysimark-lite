import { Editor, Transforms } from "slate"

import { curryOne } from "../../sink"

import { parse } from "../../convert"

function pasteMarkdown(editor: Editor, markdown: string) {
  const fragment = parse(markdown, {
    enableInternalLinks: editor.wysimark.enableInternalLinks,
  })
  // Boundary newlines describe the clipboard text, not the document being
  // pasted into; keeping them would add invisible newlines on save.
  for (const element of fragment) {
    delete element.__markdownLeadingNewlines
    delete element.__markdownTrailingNewlines
  }
  Transforms.insertNodes(editor, fragment)
}

export function createPasteMarkdownMethods(editor: Editor) {
  return {
    pasteMarkdown: curryOne(pasteMarkdown, editor),
  }
}
