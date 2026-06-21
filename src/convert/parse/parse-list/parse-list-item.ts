import type { ListItem } from "mdast"

import { InternalLinkOptions } from "../../obsidian-links"
import { Element } from "../../types"
import { parseListItemChild } from "./parse-list-item-child"

export function parseListItem(
  listItem: ListItem,
  options: { depth: number; ordered: boolean },
  internalLinkOptions: InternalLinkOptions = {}
): Element[] {
  const elements: Element[] = []
  for (const child of listItem.children) {
    elements.push(
      ...parseListItemChild(
        child,
        { ...options, checked: listItem.checked },
        internalLinkOptions
      )
    )
  }
  return elements
}
