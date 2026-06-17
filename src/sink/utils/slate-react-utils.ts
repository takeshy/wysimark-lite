import { Editor, Node, Path, Range } from "slate"
import { ReactEditor, useSlate } from "slate-react"

function isSelectionInsidePath(
  selection: ReturnType<typeof useSlate>["selection"],
  path: Path
): boolean {
  if (!selection) return false

  const anchorPath = selection.anchor.path
  const focusPath = selection.focus.path
  return (
    Path.equals(path, anchorPath) ||
    Path.equals(path, focusPath) ||
    Path.isAncestor(path, anchorPath) ||
    Path.isAncestor(path, focusPath)
  )
}

export function useIsElementSelectionInside(element: Node): boolean {
  const editor = useSlate()
  const { selection } = editor
  if (!selection) return false

  try {
    const path = ReactEditor.findPath(editor, element)
    return isSelectionInsidePath(selection, path)
  } catch {
    return false
  }
}

export function useDoesSelectionIntersectElement(element: Node): boolean {
  const editor = useSlate()
  const { selection } = editor
  if (!selection) return false

  try {
    const path = ReactEditor.findPath(editor, element)
    if (isSelectionInsidePath(selection, path)) return true

    const elementRange = Editor.range(editor, path)
    return (
      Range.includes(selection, elementRange.anchor) ||
      Range.includes(selection, elementRange.focus) ||
      Range.includes(elementRange, selection.anchor) ||
      Range.includes(elementRange, selection.focus)
    )
  } catch {
    return false
  }
}
