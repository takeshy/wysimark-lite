import type { MouseEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import mermaid from "mermaid"
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

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "default",
})

let renderIndex = 0

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
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const id = `wysimark-mermaid-${++renderIndex}`

    setError("")
    setSvg("")

    async function render() {
      try {
        const result = await mermaid.render(id, code)
        if (!cancelled) setSvg(result.svg)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Invalid Mermaid diagram")
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [code])

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
        ) : svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <span>Rendering diagram...</span>
        )}
      </$MermaidPreviewContent>
      <$MermaidSource aria-hidden="true">{children}</$MermaidSource>
    </$MermaidPreview>
  )
}
