import { MarkKey } from "../../../../types"

export const MARK_KEY_TO_TOKEN = {
  bold: "**",
  italic: "_",
  // ins: "++",
  strike: "~~",
  /**
   * IMPORTANT!
   *
   * We noop `code` here.
   *
   * We accept the `code` mark so as not to throw an error if it is found. We do
   * this because we handle `code` text specially because of the way it needs to
   * be escaped.
   *
   * This is handled in the `serializeLine` code.
   */
  code: "",
  /**
   * Highlight is handled specially in `serializeLine` using <mark> tags.
   */
  highlight: "",
} as Record<MarkKey, string>

/**
 * Convert a single mark to a string.
 * Unknown marks (e.g., custom plugin marks like "highlight") are ignored
 * and return an empty string.
 */
function convertMarkToSymbol(mark: MarkKey): string {
  if (mark in MARK_KEY_TO_TOKEN) return MARK_KEY_TO_TOKEN[mark]
  // Ignore unknown marks (custom plugin marks)
  return ""
}

/**
 * Convert an array of marks to a string
 */
export function convertMarksToSymbolsExceptCode(marks: MarkKey[]) {
  return marks.map(convertMarkToSymbol).join("")
}
