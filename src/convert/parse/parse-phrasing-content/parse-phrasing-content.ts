import type { PhrasingContent } from "mdast"

import { MarkProps, Segment } from "../../types"
import { assertUnreachable } from "../../utils"
import { normalizeSegments } from "./normalize-segments"
import { parseInlineImage } from "./parse-inline-image"
import { Descendant } from "slate"
import {
  InternalLinkOptions,
  restoreEscapedWikiLinks,
  wikiEmbedUrl,
  wikiLinkDisplayText,
  wikiLinkHref,
} from "../../obsidian-links"
import { unescapeMarkdown } from "../../utils"

/**
 * Parse inline HTML content, with special handling for <mark> tags
 */
function parseInlineHtml(htmlValue: string, marks: MarkProps): Segment[] {
  // Check for <br> / <br/> / <br /> tags — treat as soft line break
  if (/^<br\s*\/?>$/i.test(htmlValue)) {
    return [{ text: "\n", ...marks }]
  }
  // Check for <mark>...</mark> pattern when the parser keeps it in one node.
  const markMatch = htmlValue.match(/^<mark\b[^>]*>(.+?)<\/mark>$/is)
  if (markMatch) {
    return [{ text: markMatch[1], ...marks, highlight: true }]
  }
  // For other HTML, treat as code
  return [{ text: htmlValue, code: true }]
}

function parseObsidianLinks(value: string, marks: MarkProps): Segment[] {
  const segments: Segment[] = []
  const pattern = /(!)?\[\[((?:\\.|[^\]\\\n])+?)\]\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value)) !== null) {
    const start = match.index
    if (start > 0 && value[start - 1] === "\\") continue
    if (start > lastIndex) {
      segments.push({
        text: restoreEscapedWikiLinks(value.slice(lastIndex, start)),
        ...marks,
      })
    }

    const rawSpec = unescapeMarkdown(restoreEscapedWikiLinks(match[2])).trim()
    if (match[1]) {
      segments.push({
        type: "image-inline",
        url: wikiEmbedUrl(rawSpec),
        alt: rawSpec,
        children: [{ text: "" }],
      })
    } else {
      segments.push({
        type: "anchor",
        href: wikiLinkHref(rawSpec),
        children: [{ text: wikiLinkDisplayText(rawSpec), ...marks }],
      })
    }
    lastIndex = start + match[0].length
  }

  if (lastIndex === 0) return [{ text: restoreEscapedWikiLinks(value), ...marks }]
  if (lastIndex < value.length) {
    segments.push({ text: restoreEscapedWikiLinks(value.slice(lastIndex)), ...marks })
  }
  return segments
}

export function parsePhrasingContents(
  phrasingContents: PhrasingContent[],
  marks: MarkProps = {},
  options: InternalLinkOptions = {}
): Segment[] {
  const segments: Segment[] = []
  let activeMarks = { ...marks }
  for (const phrasingContent of phrasingContents) {
    if (phrasingContent.type === "html") {
      if (/^<mark\b[^>]*>$/i.test(phrasingContent.value)) {
        activeMarks = { ...activeMarks, highlight: true }
        continue
      }
      if (/^<\/mark>$/i.test(phrasingContent.value)) {
        const { highlight: _highlight, ...nextMarks } = activeMarks
        activeMarks = nextMarks
        continue
      }
    }
    segments.push(...parsePhrasingContent(phrasingContent, activeMarks, options))
  }
  const nextInlines = normalizeSegments(segments)
  return nextInlines
}

function parsePhrasingContent(
  phrasingContent: PhrasingContent,
  marks: MarkProps = {},
  options: InternalLinkOptions = {}
): Segment[] {
  switch (phrasingContent.type) {
    case "delete":
      return parsePhrasingContents(
        phrasingContent.children,
        { ...marks, strike: true },
        options
      )
    case "emphasis":
      return parsePhrasingContents(
        phrasingContent.children,
        { ...marks, italic: true },
        options
      )
    case "footnoteReference":
      return [{ text: `[${phrasingContent.identifier}]` }]
    case "html":
      return parseInlineHtml(phrasingContent.value, marks)
    case "image":
      return parseInlineImage(phrasingContent)
    case "inlineCode": {
      return [
        { text: restoreEscapedWikiLinks(phrasingContent.value), ...marks, code: true },
      ]
    }
    case "link":
      return [
        {
          type: "anchor",
          href: phrasingContent.url,
          title:
            /**
             * Ensure that `title` is undefined if it's null.
             */
            phrasingContent.title == null ? undefined : phrasingContent.title,
          children: parsePhrasingContents(
            phrasingContent.children,
            marks,
            options
          ) as Descendant[],
        },
      ]
    case "strong":
      return parsePhrasingContents(
        phrasingContent.children,
        { ...marks, bold: true },
        options
      )
    case "text":
      return options.enableInternalLinks
        ? parseObsidianLinks(phrasingContent.value, marks)
        : [{ text: restoreEscapedWikiLinks(phrasingContent.value), ...marks }]
    case "linkReference":
    case "imageReference":
      throw new Error(
        `linkReference and imageReference should be converted to link and image through our transformInlineLinks function`
      )
    case "break":
      /**
       * NOTE:
       *
       * I don't think this is doing anything at the moment as a "\n" is being
       * read without being turned into a break. We can test this by doing a
       * console.log before the return below.
       */
      return [{ text: "\n" }]
    case "footnote":
      /**
       * TODO: Support footnotes
       *
       * This is a footnote, and should be converte to a suitable alternative or
       * for us to explicitly support a Footnote type in the future. At the
       * moment, we don't explicitly support a footnote as it's (a) not part of
       * GFM and (b) not really that useful while (c) adding complexity to the
       * UI for something that's not used.
       */
      throw new Error("footnote is not supported yet")
  }
  assertUnreachable(phrasingContent)
}
