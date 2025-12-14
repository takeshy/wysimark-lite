import { MenuItemData } from "~/src/shared-overlays"

import * as Icon from "../icons"
import { t } from "~/src/utils/translations"

export const rawModeItem: MenuItemData = {
    icon: Icon.Markdown,
    title: t("switchToRawMarkdown"),
    action: (editor) => {
        // Call the toggleRawMode function if it exists on the editor
        if (editor.wysimark && typeof editor.wysimark.toggleRawMode === 'function') {
            editor.wysimark.toggleRawMode();
        }
    },
    // Only show in the toolbar when not in Raw mode and toggleRawMode is available
    show: (editor) => {
        return editor.wysimark && typeof editor.wysimark.toggleRawMode === 'function' && !editor.wysimark.isRawMode;
    },
    active: () => false, // Never show as active in the toolbar
}

export const visualModeItem: MenuItemData = {
    icon: Icon.VisualEditor,
    title: t("switchToVisualEditor"),
    action: (editor) => {
        // Call the toggleRawMode function if it exists on the editor
        if (editor.wysimark && typeof editor.wysimark.toggleRawMode === 'function') {
            editor.wysimark.toggleRawMode();
        }
    },
    // Only show in the toolbar when in Raw mode
    show: (editor) => {
        return !!(editor.wysimark && editor.wysimark.isRawMode);
    },
    active: () => false, // Never show as active in the toolbar
}
