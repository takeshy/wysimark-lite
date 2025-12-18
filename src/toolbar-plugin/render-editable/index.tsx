import { clsx } from "clsx"
import { useCallback, useRef } from "react"
import { Editor, Transforms } from "slate"
import { ReactEditor, useFocused, useSlateStatic } from "slate-react"

import { RenderEditableProps } from "../../sink"
import { Layers } from "../../use-layer"

import { Toolbar } from "../components"
import { $Editable, $OuterContainer } from "../styles"

export function renderEditable({ attributes, Editable }: RenderEditableProps) {
  const outerContainerRef = useRef<HTMLDivElement>(null)

  const editor = useSlateStatic()
  const focused = useFocused()

  /**
   * When the user clicks inside the outer container but outside of the content
   * or the toolbar, we want the user to see the cursor inside the editable
   * region.
   */
  const onClickOuterContainer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      /**
       * If the user clicked on the toolbar, we don't want to do anything.
       *
       * If the user clicked on the content, we don't want to do anything
       * because focus and selection will be handled by Slate.
       */
      if (e.target !== e.currentTarget) return
      /**
       * Select the last position in the editor
       */
      Transforms.select(editor, Editor.end(editor, []))
      ReactEditor.focus(editor)
    },
    [editor]
  )

  return (
    <Layers>
      <$OuterContainer
        ref={outerContainerRef}
        className={clsx({ "--focused": focused })}
        style={{
          height: editor.toolbar.height,
          minHeight: editor.toolbar.minHeight,
          maxHeight: editor.toolbar.maxHeight,
        }}
        onClick={onClickOuterContainer}
      >
        <Toolbar />
        <Editable
          as={$Editable}
          {...attributes}
          style={{ overflowY: "auto" }}
        />
      </$OuterContainer>
    </Layers>
  )
}
