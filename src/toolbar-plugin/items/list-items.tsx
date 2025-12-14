import { MenuItemData } from "~/src/shared-overlays"

import * as Icon from "../icons"
import { t } from "~/src/utils/translations"
import { listDepthItems } from "./block-items"

export const listItems: MenuItemData[] = [
  {
    icon: Icon.BulletList,
    title: t("bulletList"),
    hotkey: "super+8",
    action: (editor) => editor.list?.convertUnorderedList(true),
    show: (editor) => !!editor.list,
  },
  {
    icon: Icon.ListNumbers,
    title: t("numberedList"),
    hotkey: "super+7",
    action: (editor) => editor.list?.convertOrderedList(true),
    show: (editor) => !!editor.list,
  },
  {
    icon: Icon.ListCheck,
    title: t("checkList"),
    hotkey: "super+9",
    action: (editor) => editor.list?.convertTaskList(true),
    show: (editor) => !!editor.list && !editor.wysimark?.disableTaskList,
  },
]

export const expandedListItems: MenuItemData[] = [...listItems, "divider", ...listDepthItems]

export const compactListItems: MenuItemData[] = [
  {
    icon: Icon.ListNumbers,
    title: t("list"),
    more: true,
    children: [...listItems, "divider", ...listDepthItems],
    show: (editor) => !!editor.list,
  },
]
