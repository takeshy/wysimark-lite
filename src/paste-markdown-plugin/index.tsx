import { createPlugin, stopEvent, TypedPlugin } from "../sink"

import { createPasteMarkdownMethods } from "./methods"

type PasteMarkdownMethods = ReturnType<typeof createPasteMarkdownMethods>

export type PasteMarkdownEditor = {
  pasteMarkdown: PasteMarkdownMethods
}

export type PasteMarkdownPluginCustomTypes = {
  Name: "paste-markdown"
  Editor: PasteMarkdownEditor
}

function hasPlainTextOnly(types: readonly string[]): boolean {
  return types.length === 1 && types[0] === "text/plain"
}

function hasCalloutBlockquote(markdown: string): boolean {
  return /^>\s*\[![A-Za-z0-9_-]+\][+-]?(?:\s|$)/m.test(markdown)
}

export const PasteMarkdownPlugin = createPlugin<PasteMarkdownPluginCustomTypes>(
  (editor) => {
    editor.pasteMarkdown = createPasteMarkdownMethods(editor)
    return {
      name: "paste-markdown",
      editor: {},
      editableProps: {
        onPaste(e) {
          const types = Array.from(e.clipboardData.types)
          const markdown = e.clipboardData.getData("text/markdown")
          const plainText = e.clipboardData.getData("text/plain")
          const shouldPasteMarkdown =
            markdown ||
            (plainText &&
              (hasPlainTextOnly(types) || hasCalloutBlockquote(plainText)))

          if (!shouldPasteMarkdown) {
            return false
          }
          editor.pasteMarkdown.pasteMarkdown(markdown || plainText)
          stopEvent(e)
          return true
        },
      },
    }
  }
) as TypedPlugin<PasteMarkdownPluginCustomTypes>
