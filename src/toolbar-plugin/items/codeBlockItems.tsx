import { MenuItemData } from "~/src/shared-overlays"

import * as Icon from "../icons"

export const codeBlockItems: MenuItemData[] = [
  {
    icon: Icon.CodeBlock,
    title: "Code Block",
    action: (editor) => editor.codeBlock?.createCodeBlock({ language: "text" }),
    show: (editor) => !!editor.codeBlock,
  },
]
