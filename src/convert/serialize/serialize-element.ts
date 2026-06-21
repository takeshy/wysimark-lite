import { Element, Segment } from "../types"
import { InternalLinkOptions } from "../obsidian-links"
import { assertUnreachable } from "../utils"
import { serializeElements } from "./serialize-elements"
import { serializeCodeBlock } from "./serialize-code-block"
import { serializeImageBlock } from "./serialize-image-block"
import { serializeLine } from "./serialize-line"
import { serializeTable } from "./serialize-table"

const LIST_INDENT_SIZE = 4

export function serializeElement(
  element: Element,
  orders: number[],
  options: InternalLinkOptions = {}
): string {
  switch (element.type) {
    case "anchor":
      return `[${serializeLine(element.children as Segment[])}](${element.href
        })`
    case "block-quote": {
      const children = element.children as Element[]
      const firstChild = children[0]
      const isCallout =
        firstChild?.type === "paragraph" &&
        /^\[![A-Za-z0-9_-]+\][+-]?(?:\s+.*)?$/.test(
          serializeLine(firstChild.children as Segment[])
        )
      const lines = isCallout
        ? `${serializeElement(firstChild, orders, options).trimEnd()}\n${serializeElements(
          children.slice(1),
          options
        ).trimStart()}`
        : serializeElements(children, options)
      return `${lines
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n")}\n\n`
    }
    case "heading":
      return `${"#".repeat(element.level)} ${serializeLine(
        element.children as Segment[]
      )}\n\n`
    case "horizontal-rule":
      return "---\n\n"
    case "paragraph": {
      const content = serializeLine(
        element.children as Segment[],
        [],
        [],
        options
      )
      if (content === "") {
        return `\u00A0\n\n`
      }
      return `${content}\n\n`
    }
    /**
     * Table
     */
    case "table":
      return serializeTable(element, options)
    case "table-row":
    case "table-cell":
    case "table-content":
      throw new Error(
        `Table elements should only be present as children of table which should be handled by serializeTable. Got ${element.type} may indicate an error in normalization.`
      )
    /**
     * List
     */
    case "unordered-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      return `${indent}- ${serializeLine(
        element.children as Segment[],
        [],
        [],
        options
      )}\n`
    }
    case "ordered-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      return `${indent}${orders[element.depth]}. ${serializeLine(
        element.children as Segment[],
        [],
        [],
        options
      )}\n`
    }
    case "task-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      let line = serializeLine(element.children as Segment[], [], [], options)
      if (line.trim() === "") {
        line = "&#32;"
      }
      return `${indent}- [${element.checked ? "x" : " "}] ${line}\n`
    }
    case "image-block":
      return serializeImageBlock(element, options)
    case "image-inline":
      return `![${element.alt || ""}](${element.url})`
    case "code-block":
      return serializeCodeBlock(element)
    case "code-block-line":
      throw new Error(
        `Code block line elements should only be present as children of code-block which should be handled by serializeCodeBlock. Got code-block-line may indicate an error in normalization.`
      )
    case "html-block":
      return `${element.html}\n\n`
  }
  assertUnreachable(element)
}
