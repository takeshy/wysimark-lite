import { MenuItemData } from "~/src/shared-overlays"

import { expandedBlockItems, compactBlockItems } from "./block-items"
import { compactDialogItems, expandedDialogItems, smallDialogItems } from "./dialogItems"
import { compactMarkItems, expandedMarkItems } from "./mark-items"
import { expandedListItems, compactListItems } from "./list-items"
import { expandedQuoteItems, compactQuoteItems } from "./quote-items"
import { rawModeItem, visualModeItem } from "./raw-mode-item"

/**
 * A collection of `Item` objects that describe either
 *
 * - A Button in the toolbar
 * - A Menu Item in a drop down of the toolbar
 *
 * An `Item` is described in the same way whether it is a button or a menu
 * item making them interchangeable.
 */

export const largeItems: MenuItemData[] = [
  ...expandedBlockItems,
  "divider",
  ...expandedListItems,
  "divider",
  ...expandedMarkItems,
  "divider",
  ...expandedDialogItems,
  "divider",
  ...expandedQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem,
]

export const mediumItems: MenuItemData[] = [
  ...compactBlockItems,
  "divider",
  ...expandedListItems,
  "divider",
  ...expandedMarkItems,
  "divider",
  ...compactDialogItems,
  "divider",
  ...expandedQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem,
]

export const smallItems: MenuItemData[] = [
  ...compactBlockItems,
  "divider",
  ...compactListItems,
  "divider",
  ...compactMarkItems,
  "divider",
  ...smallDialogItems,
  "divider",
  ...compactQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem,
]

export const initialItems: MenuItemData[] = smallItems

export const items = mediumItems

export const itemSets: MenuItemData[][] = [largeItems, mediumItems, smallItems]
