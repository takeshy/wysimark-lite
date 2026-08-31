import { useState } from "react"
import { createEditor, Editor } from "slate"
import { withHistory } from "slate-history"
import { ReactEditor, withReact } from "slate-react"

import { parse, serialize, escapeUrlSlashes } from "../convert"
import { Element } from "./plugins"
import { withSink } from "./SinkEditable"
import { replaceDocument } from "./replace-document"
import { WysimarkEditor } from "./types"
import type { RenderInternalLinkPreview, RenderInternalEmbed } from "./types"

export type UseEditorOptions = {
  authToken?: string
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  /**
   * Disable raw Markdown editing mode.
   * When true, the raw mode toggle button will be hidden from the toolbar.
   * Defaults to true (raw mode is disabled by default).
   */
  disableRawMode?: boolean
  /**
   * Disable task list (checklist) functionality.
   * When true, the task list button will be hidden from the toolbar.
   */
  disableTaskList?: boolean
  /**
   * Disable code block functionality.
   * When true, the code block button will be hidden from the toolbar.
   */
  disableCodeBlock?: boolean
  /**
   * Disable highlight mark functionality.
   * When true, the highlight button will be hidden from the toolbar.
   * Defaults to true (highlight is disabled by default).
   */
  disableHighlight?: boolean
  /**
   * Insert a soft line break with Enter and a new paragraph with Shift+Enter.
   * Defaults to false, preserving the conventional Enter/Shift+Enter behavior.
   */
  softBreakOnEnter?: boolean
  /**
   * Enable Obsidian-style internal links and embeds.
   * When true, [[Page]] and ![[file.png]] are parsed and serialized as
   * internal links. Defaults to false.
   */
  enableInternalLinks?: boolean
  renderInternalLinkPreview?: RenderInternalLinkPreview
  renderInternalEmbed?: RenderInternalEmbed
  onInternalLinkClick?: (target: string) => void
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
  softBreakOnEnter,
  enableInternalLinks,
  renderInternalLinkPreview,
  renderInternalEmbed,
  onInternalLinkClick,
}: UseEditorOptions = {}): Editor & ReactEditor & WysimarkEditor {
  const [editor] = useState(() => {
    const editor = createEditor()
    editor.wysimark = {
      // Disable raw mode (defaults to true)
      disableRawMode: disableRawMode ?? true,
      // Disable task list if specified
      disableTaskList,
      // Disable code block if specified
      disableCodeBlock,
      // Disable highlight (defaults to true)
      disableHighlight: disableHighlight ?? true,
      softBreakOnEnter: softBreakOnEnter ?? false,
      enableInternalLinks: enableInternalLinks ?? false,
      renderInternalLinkPreview,
      renderInternalEmbed,
      onInternalLinkClick,
    }
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
    editor.getMarkdown = () => {
      return serialize(editor.children as Element[], {
        enableInternalLinks: editor.wysimark.enableInternalLinks,
      })
    }
    editor.setMarkdown = (markdown: string) => {
      // Escape forward slashes in URLs before parsing
      const escapedMarkdown = escapeUrlSlashes(markdown);
      const documentValue = parse(escapedMarkdown, {
        enableInternalLinks: editor.wysimark.enableInternalLinks,
      })
      replaceDocument(editor, documentValue)
    }
    return nextEditor
  })

  // Keep host callbacks fresh — editor.wysimark is created once, but these
  // closures may capture changing state (e.g. the file list) on each render.
  editor.wysimark.renderInternalLinkPreview = renderInternalLinkPreview
  editor.wysimark.renderInternalEmbed = renderInternalEmbed
  editor.wysimark.onInternalLinkClick = onInternalLinkClick

  return editor
}
