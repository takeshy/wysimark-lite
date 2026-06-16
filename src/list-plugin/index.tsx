import { Editor, Element, Range, Transforms } from "slate"

import {
  createHotkeyHandler,
  createIsElementType,
  createPlugin,
  curryOne,
  findElementUp,
  isStartOfElement,
  TypedPlugin,
} from "../sink"

import { createListMethods } from "./methods"
import { normalizeNode } from "./normalize-node"
import { renderElement } from "./render-element"
import { ListItemElement, ListPluginCustomTypes } from "./types"

export * from "./types"

export const LIST_ITEM_TYPES: ListItemElement["type"][] = [
  "unordered-list-item",
  "ordered-list-item",
  "task-list-item",
]

export const isListItem = createIsElementType<ListItemElement>(LIST_ITEM_TYPES)

function autocompleteTaskList(editor: Editor, text: string) {
  if (text !== " ") return false
  if (!editor.selection || !Range.isCollapsed(editor.selection)) return false

  const [entry] = Array.from(
    Editor.nodes(editor, {
      match: (node) => Element.isElement(node) && node.type === "paragraph",
      mode: "lowest",
    })
  )
  if (!entry) return false

  const [, path] = entry
  const start = Editor.start(editor, path)
  const range = { anchor: start, focus: editor.selection.anchor }
  const marker = Editor.string(editor, range)
  const match = /^-\s+\[([ xX])\]$/.exec(marker)
  if (!match) return false

  Editor.withoutNormalizing(editor, () => {
    Transforms.delete(editor, { at: range })
    editor.convertElement.convertElements(
      (element) => element.type === "task-list-item",
      (element) => ({
        type: "task-list-item",
        checked: match[1].toLowerCase() === "x",
        depth: "depth" in element && typeof element.depth === "number" ? element.depth : 0,
      }),
      false
    )
  })
  return true
}

export const ListPlugin = createPlugin<ListPluginCustomTypes>(
  (editor, _options, { createPolicy }) => {
    editor.convertElement.addConvertElementType(LIST_ITEM_TYPES)
    const list = (editor.list = createListMethods(editor))
    const hotkeyHandler = createHotkeyHandler({
      tab: list.indent,
      "shift+tab": list.outdent,
      "super+7": curryOne(list.convertOrderedList, true),
      "super+8": curryOne(list.convertUnorderedList, true),
      "super+9": curryOne(list.convertTaskList, true),
    })

    return createPolicy({
      name: "list",
      editor: {
        normalizeNode: (entry) => normalizeNode(editor, entry),
        insertText: (text) => autocompleteTaskList(editor, text),
        insertBreak: list.insertBreak,
        deleteBackward: (unit) => {
          if (unit !== "character") return false
          if (!isStartOfElement(editor, isListItem)) return false
          const listItem = findElementUp<ListItemElement>(editor, isListItem)
          if (!listItem) return false
          const [element, path] = listItem
          if (element.depth > 0) {
            Transforms.setNodes(
              editor,
              { depth: element.depth - 1 },
              { at: path }
            )
            return true
          }
          editor.collapsibleParagraph.convertParagraph()
          return true
        },
      },
      editableProps: {
        renderElement,
        onKeyDown(e) {
          if (!Editor.nodes(editor, { match: isListItem })) return false
          return hotkeyHandler(e)
        },
      },
    })
  }
) as TypedPlugin<ListPluginCustomTypes>
