/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Uses a single-pass replacement for all special inline characters.
 * `_` is handled context-aware: in CommonMark, `_` between alphanumeric/word
 * characters cannot trigger emphasis (intraword emphasis is disabled for `_`),
 * so identifiers like `my_file` or `some_function_name` are left unescaped.
 */
export function escapeText(s: string) {
  // Single-pass: escape all special inline chars, with context-aware _ and ~ handling
  let result = s.replace(/[\\`*_\[\]~|<]/g, (char, offset) => {
    if (char === "_" || char === "~") {
      const prev = offset > 0 ? s[offset - 1] : ""
      const next = offset < s.length - 1 ? s[offset + 1] : ""
      // Don't escape _ or ~ between word characters — CommonMark treats them as literal
      // (intraword emphasis is disabled for _, and ~word~ requires non-word flanking)
      if (/\w/.test(prev) && /\w/.test(next)) return char
    }
    return `\\${char}`
  })

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+>])\s/m, "\\$1 ") // list / blockquote

  return result
}
