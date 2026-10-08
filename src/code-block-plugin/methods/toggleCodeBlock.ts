import { Editor, Range } from "slate"

import { insertRootElement } from "../../sink"
import { convertCodeBlockToParagraph } from "./convertCodeBlockToParagraph"
import { createCodeBlock } from "./createCodeBlock"

export function toggleCodeBlock(editor: Editor) {
  if (convertCodeBlockToParagraph(editor)) return
  if (editor.selection && Range.isExpanded(editor.selection)) {
    const text = Editor.string(editor, editor.selection)
    insertRootElement(editor, {
      type: "code-block",
      language: "text",
      children: text.split("\n").map((line) => ({
        type: "code-block-line",
        children: [{ text: line }],
      })),
    })
    return
  }
  createCodeBlock(editor, { language: "text" })
}
