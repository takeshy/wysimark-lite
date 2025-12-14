import { useCallback, useState } from "react"
import { useSelected, useSlateStatic } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"
import { $CodeBlock, $CodeBlockLanguage, $CodeBlockScroller } from "../styles"
import { CodeBlockElement } from "../types"

export function CodeBlock({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<CodeBlockElement>) {
  const editor = useSlateStatic()
  const selected = useSelected()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(element.language)

  const handleClick = useCallback(() => {
    setInputValue(element.language)
    setIsEditing(true)
  }, [element.language])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (inputValue !== element.language) {
      editor.codeBlock.setCodeBlockLanguage(inputValue || "text", { at: element })
    }
  }, [editor, element, inputValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === "Escape") {
      setInputValue(element.language)
      setIsEditing(false)
    }
  }, [element.language])

  return (
    <$CodeBlock className={selected ? "--selected" : ""} {...attributes}>
      <$CodeBlockLanguage contentEditable={false}>
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              font: "inherit",
              color: "inherit",
              padding: 0,
              outline: "none",
              textAlign: "right",
            }}
          />
        ) : (
          <span onClick={handleClick} style={{ cursor: "pointer", width: "100%" }}>
            {element.language || "text"}
          </span>
        )}
      </$CodeBlockLanguage>
      <$CodeBlockScroller>{children}</$CodeBlockScroller>
    </$CodeBlock>
  )
}
