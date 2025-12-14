import { useState } from "react"
import { createEditor, Editor, Transforms } from "slate"
import { withHistory } from "slate-history"
import { ReactEditor, withReact } from "slate-react"

import { parse, serialize, escapeUrlSlashes } from "../convert"
import { Element } from "./plugins"
import { withSink } from "./SinkEditable"
import { WysimarkEditor } from "./types"

export type UseEditorOptions = {
  authToken?: string
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  /**
   * Disable raw Markdown editing mode.
   * When true, the raw mode toggle button will be hidden from the toolbar.
   * Defaults to true (raw mode is disabled by default).
   *
   * @example
   * ```tsx
   * const editor = useEditor({
   *   disableRawMode: false  // Enable raw mode
   * })
   * ```
   */
  disableRawMode?: boolean
  /**
   * Disable task list (checklist) functionality.
   * When true, the task list button will be hidden from the toolbar
   * and task list creation will be disabled.
   *
   * @example
   * ```tsx
   * const editor = useEditor({
   *   disableTaskList: true
   * })
   * ```
   */
  disableTaskList?: boolean
  /**
   * Disable code block functionality.
   * When true, the code block button will be hidden from the toolbar.
   *
   * @example
   * ```tsx
   * const editor = useEditor({
   *   disableCodeBlock: true
   * })
   * ```
   */
  disableCodeBlock?: boolean
  /**
   * Disable highlight mark functionality.
   * When true, the highlight button will be hidden from the toolbar.
   * Highlight is serialized as <mark>text</mark> in markdown.
   * Defaults to true (highlight is disabled by default).
   *
   * @example
   * ```tsx
   * const editor = useEditor({
   *   disableHighlight: false  // Enable highlight
   * })
   * ```
   */
  disableHighlight?: boolean
}

export function useEditor({
  authToken,
  height,
  minHeight,
  maxHeight,
  disableRawMode,
  disableTaskList,
  disableCodeBlock,
  disableHighlight,
}: UseEditorOptions = {}): Editor & ReactEditor & WysimarkEditor {
  const [editor] = useState(() => {
    const editor = createEditor()
    const nextEditor = withSink(withReact(withHistory(editor)), {
      toolbar: {
        height,
        minHeight,
        maxHeight,
        /**
         * If `authToken` is provided then show upload buttons.
         */
        showUploadButtons: !!authToken,
      },
      image: {}
    })
    nextEditor.convertElement.addConvertElementType("paragraph")
    editor.wysimark = {
      // Disable raw mode (defaults to true)
      disableRawMode: disableRawMode ?? true,
      // Disable task list if specified
      disableTaskList,
      // Disable code block if specified
      disableCodeBlock,
      // Disable highlight (defaults to true)
      disableHighlight: disableHighlight ?? true,
    }
    editor.getMarkdown = () => {
      return serialize(editor.children as Element[])
    }
    editor.setMarkdown = (markdown: string) => {
      // Escape forward slashes in URLs before parsing
      const escapedMarkdown = escapeUrlSlashes(markdown);
      const documentValue = parse(escapedMarkdown)
      editor.children = documentValue
      editor.selection = null
      Transforms.select(editor, Editor.start(editor, [0]))
    }
    return nextEditor
  })

  return editor
}
