import type { MouseEvent } from "react"
import { useId, useMemo } from "react"
import { render } from "pele"
import { Editor, Node, Transforms } from "slate"
import { ReactEditor, useFocused, useSelected, useSlateStatic } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"
import {
  $MermaidError,
  $MermaidPreview,
  $MermaidPreviewContent,
  $MermaidSource,
} from "../styles"
import { CodeBlockElement } from "../types"
import { CodeBlockActions } from "./CodeBlockActions"

export function MermaidBlock({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<CodeBlockElement>) {
  const editor = useSlateStatic()
  const selected = useSelected()
  const isFocused = useFocused()
  const code = useMemo(() => {
    return element.children.map((line) => Node.string(line)).join("\n")
  }, [element.children])
  const id = useId()
  const { svg, error } = useMemo(() => {
    try {
      return {
        svg: render(code, {
          idPrefix: `wysimark-mermaid-${id}`,
          links: false,
          images: false,
        }).svg,
        error: "",
      }
    } catch (err) {
      return {
        svg: "",
        error: err instanceof Error ? err.message : "Invalid Mermaid diagram",
      }
    }
  }, [code, id])

  function editBlock(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const path = ReactEditor.findPath(editor, element)
    Transforms.select(editor, Editor.start(editor, path))
    ReactEditor.focus(editor)
  }

  return (
    <$MermaidPreview {...attributes} onMouseDown={editBlock}>
      {selected && isFocused ? <CodeBlockActions element={element} /> : null}
      <$MermaidPreviewContent contentEditable={false} onMouseDown={editBlock}>
        {error ? (
          <$MermaidError>{error}</$MermaidError>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        )}
      </$MermaidPreviewContent>
      <$MermaidSource aria-hidden="true">{children}</$MermaidSource>
    </$MermaidPreview>
  )
}
