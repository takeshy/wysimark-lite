import { Descendant, Editor } from "slate"

import {
  createHotkeyHandler,
  createPlugin,
  curryOne,
  TypedPlugin,
} from "../sink"

import { normalizeNode } from "./normalize-node"
import { Paragraph } from "./render-element/paragraph"

export type CollapsibleParagraphEditor = {
  collapsibleParagraph: {
    convertParagraph: () => void
  }
}

export type ParagraphElement = {
  type: "paragraph"
  __collapsible?: true
  children: Descendant[]
}

export type CollapsibleParagraphPluginCustomTypes = {
  Name: "collapsible-paragraph"
  Editor: CollapsibleParagraphEditor
  Element: ParagraphElement
}

export const CollapsibleParagraphPlugin =
  createPlugin<CollapsibleParagraphPluginCustomTypes>((editor) => {
    const { insertBreak } = editor
    editor.insertBreak = () => {
      const { selection } = editor
      if (selection && selection.anchor.path[0] === selection.focus.path[0]) {
        // Get the full text of the current block
        const blockPath = [selection.anchor.path[0]]
        const blockStart = Editor.start(editor, blockPath)
        const fullBlockText = Editor.string(editor, blockPath)
        const textBeforeCursor = Editor.string(editor, {
          anchor: blockStart,
          focus: selection.anchor,
        })

        // If the current paragraph is empty, immediately create a new paragraph.
        // This preserves the empty paragraph as a visible blank line.
        if (fullBlockText === "") {
          insertBreak()
        } else if (textBeforeCursor.endsWith('\n')) {
          // Delete the trailing '\n' that triggered the paragraph break,
          // so it doesn't remain in the previous paragraph after the split.
          // Without this, the trailing '\n' is lost during serialize→parse
          // round-trip (trimSpaceAtEndOfLine strips it), causing blank lines
          // to disappear on reload.
          editor.deleteBackward('character')
          // Create a new paragraph
          insertBreak()
        } else {
          // Insert a single line break
          editor.insertText('\n')
        }
      } else {
        // Otherwise fall back to default behavior
        insertBreak()
      }
    }

    editor.convertElement.addConvertElementType("paragraph")
    editor.collapsibleParagraph = {
      convertParagraph: () => {
        editor.convertElement.convertElements<ParagraphElement>(
          () => false,
          {
            type: "paragraph",
          },
          false
        )
      },
    }
    if (!editor.normalizeAfterDelete) {
      throw new Error(
        `The collapsible-paragraph-plugin has a dependency on the normalize-after-delete plugin. Please add that plugin before this one.`
      )
    }

    return {
      name: "collapsible-paragraph",
      editor: {
        normalizeNode: curryOne(normalizeNode, editor),
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          switch (element.type) {
            case "paragraph": {
              return (
                <Paragraph element={element} attributes={attributes}>
                  {children}
                </Paragraph>
              )
            }
          }
        },
        onKeyDown: (e) => {
          // Handle Enter key in onKeyDown to bypass the IS_NODE_MAP_DIRTY
          // deadlock in Slate's Android beforeinput handler. On mobile,
          // rapid IME confirmation + Enter can permanently block Enter
          // when IS_NODE_MAP_DIRTY is true and beforeinput returns early
          // without calling preventDefault.
          if (
            e.key === "Enter" &&
            !e.nativeEvent.isComposing &&
            !e.shiftKey
          ) {
            e.preventDefault()
            editor.insertBreak()
            return true
          }
          return createHotkeyHandler({
            "super+0": editor.collapsibleParagraph.convertParagraph,
          })(e)
        },
      },
    }
  }) as TypedPlugin<CollapsibleParagraphPluginCustomTypes>
