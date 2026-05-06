/**
 * Characters that always need escaping in inline markdown text regardless
 * of surrounding context.
 */
const ALWAYS_ESCAPE = new Set(["`", "*", "[", "]", "|"])

// ASCII punctuation per CommonMark: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
// These are the only characters `\` can escape, so a `\` not followed by one
// of them is a literal backslash (e.g. Windows paths like `C:\Users`).
function isAsciiPunct(ch: string): boolean {
  return /[!-/:-@\[-`{-~]/.test(ch)
}

function isWhitespace(ch: string): boolean {
  return ch === "" || /\s/u.test(ch)
}

function isPunctOrSymbol(ch: string): boolean {
  return ch !== "" && /[\p{P}\p{S}]/u.test(ch)
}

// `<` only starts an HTML tag or autolink when followed by a letter, `/`,
// `?`, or `!`. Otherwise (e.g. `a < b`, `a<5`) it is literal.
function isHtmlTagStart(ch: string): boolean {
  return /[a-zA-Z/?!]/.test(ch)
}

// A character is "word-like" for `_` / `~` flanking purposes when it is
// neither whitespace nor CommonMark punctuation. CommonMark classifies both
// Unicode P (punctuation) and S (symbol, e.g. `$`, `+`, `<`, `|`, `~`, `` ` ``)
// as punctuation for flanking. Start/end of string counts as whitespace-like
// (empty string fails all tests).
function isWordLike(ch: string): boolean {
  if (isWhitespace(ch)) return false
  if (isPunctOrSymbol(ch)) return false
  return true
}

function getUnderscoresThatCanEmphasize(chars: string[]): Set<number> {
  const escaped = new Set<number>()
  const openers: number[] = []

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== "_") continue

    const prev = i > 0 ? chars[i - 1] : ""
    const next = i + 1 < chars.length ? chars[i + 1] : ""
    const leftFlanking =
      !isWhitespace(next) &&
      (!isPunctOrSymbol(next) || isWhitespace(prev) || isPunctOrSymbol(prev))
    const rightFlanking =
      !isWhitespace(prev) &&
      (!isPunctOrSymbol(prev) || isWhitespace(next) || isPunctOrSymbol(next))

    const canOpen = leftFlanking && (!rightFlanking || isPunctOrSymbol(prev))
    const canClose = rightFlanking && (!leftFlanking || isPunctOrSymbol(next))

    if (canClose && openers.length > 0) {
      escaped.add(openers.pop() as number)
      escaped.add(i)
    }
    if (canOpen) openers.push(i)
  }

  return escaped
}

/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Only escapes characters that genuinely need escaping:
 * - `` ` ``, `*`, `[`, `]`, `|` — always escaped
 * - `\` — escaped only when followed by an ASCII punctuation character
 * - `<` — escaped only when it could start an HTML tag or autolink
 * - `_`, `~` — escaped only when they could open/close emphasis/strikethrough
 *   (not between word-like characters)
 * - `#`, ordered list markers, `-`/`+`/`>` — escaped only at the start of a line
 */
export function escapeText(s: string) {
  const chars = Array.from(s)
  const emphasisUnderscores = getUnderscoresThatCanEmphasize(chars)
  let result = ""
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const prev = i > 0 ? chars[i - 1] : ""
    const next = i + 1 < chars.length ? chars[i + 1] : ""

    if (ALWAYS_ESCAPE.has(ch)) {
      result += `\\${ch}`
    } else if (ch === "\\") {
      result += isAsciiPunct(next) ? "\\\\" : "\\"
    } else if (ch === "<") {
      result += isHtmlTagStart(next) ? "\\<" : "<"
    } else if (ch === "_") {
      result += emphasisUnderscores.has(i) ? `\\${ch}` : ch
    } else if (ch === "~") {
      result += isWordLike(prev) && isWordLike(next) ? ch : `\\${ch}`
    } else {
      result += ch
    }
  }

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+>])\s/m, "\\$1 ") // list / blockquote

  return result
}
