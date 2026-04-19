/**
 * Characters that always need escaping in inline markdown text.
 * `_` and `~` are handled separately because CommonMark/GFM treat intraword
 * occurrences as literal, and escaping them only adds diff noise.
 */
const INLINE_ESCAPES = [
  "\\", // escape character
  "`", // inline code
  "*", // emphasis/bold
  "[", // link start
  "]", // link end
  "|", // table cell (GFM)
  "<", // HTML tag
]

const INLINE_ESCAPES_REGEXP = new RegExp(
  `(${INLINE_ESCAPES.map((symbol) => `\\${symbol}`).join("|")})`,
  "g"
)

// A character is "word-like" for flanking purposes when it is neither
// whitespace nor CommonMark punctuation. CommonMark classifies both Unicode P
// (punctuation) and S (symbol, e.g. `$`, `+`, `<`, `|`, `~`, `` ` ``) as
// punctuation for flanking. Start/end of string counts as whitespace-like
// (empty string fails all tests).
function isWordLike(ch: string): boolean {
  if (ch === "") return false
  if (/\s/.test(ch)) return false
  if (/[\p{P}\p{S}]/u.test(ch)) return false
  return true
}

/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Only escapes characters that genuinely need escaping:
 * - Characters with special inline meaning (always escaped)
 * - `_` and `~` only when they could open/close emphasis/strikethrough
 *   (not intraword)
 * - Characters with special meaning at the start of a line (position-aware)
 */
export function escapeText(s: string) {
  // Escape characters that always have inline meaning
  let result = s.replace(INLINE_ESCAPES_REGEXP, (m: string) => `\\${m}`)

  // Escape `_` and `~` only when they are NOT surrounded by word-like
  // characters on both sides. CommonMark disables intraword emphasis for `_`,
  // and GFM strikethrough requires non-word flanking, so identifiers like
  // `foo_bar` or `foo~bar` need no escape.
  result = result.replace(/[_~]/g, (m, offset: number) => {
    const prev = offset > 0 ? result[offset - 1] : ""
    const next = offset < result.length - 1 ? result[offset + 1] : ""
    if (isWordLike(prev) && isWordLike(next)) return m
    return `\\${m}`
  })

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+>])\s/m, "\\$1 ") // list / blockquote

  return result
}
