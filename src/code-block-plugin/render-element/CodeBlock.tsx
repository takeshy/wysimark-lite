import { useCallback, useRef } from "react"
import { useFocused, useSelected } from "slate-react"

import { Menu, MenuItemData } from "../../shared-overlays"
import {
  ConstrainedRenderElementProps,
  useDoesSelectionIntersectElement,
} from "../../sink"
import { useLayer } from "../../use-layer"
import { ChevronDownIcon } from "../icons/ChevronDownIcon"
import {
  $CodeBlock,
  $CodeBlockEditingScroller,
  $CodeBlockLanguage,
  $CodeBlockScroller,
} from "../styles"
import { CodeBlockElement, LanguageList } from "../types"
import { CodeBlockActions } from "./CodeBlockActions"
import { MermaidBlock } from "./MermaidBlock"

export function CodeBlock({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<CodeBlockElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const selected = useSelected()
  const isFocused = useFocused()
  const doesSelectionIntersect = useDoesSelectionIntersectElement(element)
  const isEditing = isFocused && doesSelectionIntersect
  const dropdown = useLayer("code-block-dropdown")

  const onClick = useCallback(() => {
    if (dropdown.layer) dropdown.close()
    const dest = ref.current
    if (dest === null) return
    const items: MenuItemData[] = LanguageList.map((language) => {
      return {
        icon: () => <span />,
        title: language,
        action: (editor) => {
          editor.codeBlock.setCodeBlockLanguage(language, { at: element })
        },
      }
    })
    // Menu
    dropdown.open(() => (
      <Menu dest={dest} items={items} close={dropdown.close} />
    ))
  }, [dropdown, element])

  if (element.language.toLowerCase() === "mermaid" && !isEditing) {
    return (
      <MermaidBlock element={element} attributes={attributes}>
        {children}
      </MermaidBlock>
    )
  }

  return (
    <$CodeBlock className={selected ? "--selected" : ""} {...attributes}>
      {selected && isFocused ? <CodeBlockActions element={element} /> : null}
      {isEditing ? (
        <$CodeBlockEditingScroller>{children}</$CodeBlockEditingScroller>
      ) : (
        <>
          <$CodeBlockLanguage contentEditable={false} onClick={onClick} ref={ref}>
            <span>{element.language}</span>
            <ChevronDownIcon />
          </$CodeBlockLanguage>
          <$CodeBlockScroller>{children}</$CodeBlockScroller>
        </>
      )}
    </$CodeBlock>
  )
}
