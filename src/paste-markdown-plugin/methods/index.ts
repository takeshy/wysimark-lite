import { Editor, Transforms } from "slate"

import { curryOne } from "../../sink"

import { parse, escapeUrlSlashes } from "../../convert"

function pasteMarkdown(editor: Editor, markdown: string) {
  // Escape forward slashes in URLs before parsing
  const escapedMarkdown = escapeUrlSlashes(markdown);
  const fragment = parse(escapedMarkdown, {
    enableInternalLinks: editor.wysimark.enableInternalLinks,
  })
  Transforms.insertNodes(editor, fragment)
}

export function createPasteMarkdownMethods(editor: Editor) {
  return {
    pasteMarkdown: curryOne(pasteMarkdown, editor),
  }
}
