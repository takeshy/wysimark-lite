import { Editor } from "slate"
import { MenuItemData } from "~/src/shared-overlays"

import * as Icon from "../icons"
import { t } from "~/src/utils/translations"

function getMarks(editor: Editor) {
  const marks = Editor.marks(editor)
  return {
    bold: marks?.bold || false,
    italic: marks?.italic || false,
    strike: marks?.strike || false,
    code: marks?.code || false,
    underline: marks?.underline || false,
    highlight: marks?.highlight || false,
  }
}

const primaryMarkItems: MenuItemData[] = [
  {
    icon: Icon.Bold,
    title: t("bold"),
    hotkey: "mod+b",
    action: (editor) => editor.marksPlugin.toggleBold(),
    active: (editor) => getMarks(editor).bold,
  },
  {
    icon: Icon.Italic,
    title: t("italic"),
    hotkey: "mod+i",
    action: (editor) => editor.marksPlugin.toggleItalic(),
    active: (editor) => getMarks(editor).italic,
  },
  {
    icon: Icon.Strikethrough,
    title: t("strike"),
    hotkey: "super+k",
    action: (editor) => editor.marksPlugin.toggleStrike(),
    active: (editor) => getMarks(editor).strike,
  },
  {
    icon: Icon.Code,
    title: t("inlineCode"),
    hotkey: "mod+j",
    action: (editor) => editor.inlineCode.toggleInlineCode(),
    active: (editor) => getMarks(editor).code,
  },
  {
    icon: Icon.Underline,
    title: t("underline"),
    hotkey: "mod+u",
    action: (editor) => editor.marksPlugin.toggleUnderline(),
    active: (editor) => getMarks(editor).underline,
  },
  {
    icon: Icon.Highlight,
    title: t("highlight"),
    action: (editor) => editor.marksPlugin.toggleHighlight(),
    active: (editor) => getMarks(editor).highlight,
    show: (editor) => !editor.wysimark?.disableHighlight,
  },
]

export const expandedMarkItems: MenuItemData[] = primaryMarkItems
export const compactMarkItems: MenuItemData[] = [
  {
    icon: Icon.Bold,
    title: t("format"),
    more: true,
    children: primaryMarkItems,
  },
]
