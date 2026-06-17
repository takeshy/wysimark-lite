import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parse } from "../convert/parse"
import { serialize } from "../convert/serialize"
import { getCalloutInfo } from "./callout"
import type { BlockQuoteElement } from "."

function blockQuote(marker: string): BlockQuoteElement {
  return {
    type: "block-quote",
    children: [
      {
        type: "paragraph",
        children: [{ text: marker }],
      },
      {
        type: "paragraph",
        children: [{ text: "Body" }],
      },
    ],
  }
}

describe("getCalloutInfo", () => {
  it("parses Obsidian callout marker title", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!tip] Custom title")), {
      type: "tip",
      displayType: "tip",
      title: "Custom title",
      fold: undefined,
      icon: "⚑",
    })
  })

  it("normalizes aliases and fold markers", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!faq]- Question")), {
      type: "question",
      displayType: "faq",
      title: "Question",
      fold: "closed",
      icon: "?",
    })
  })

  it("uses Obsidian title defaults and note fallback", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!custom-type]")), {
      type: "note",
      displayType: "custom-type",
      title: "Custom Type",
      fold: undefined,
      icon: "i",
    })
  })

  it("ignores ordinary blockquotes", () => {
    assert.equal(getCalloutInfo(blockQuote("Not a callout")), null)
  })

  it("splits marker line from body when parsing Obsidian blockquote syntax", () => {
    const [element] = parse(
      "> [!tip] Title\n> First body line\n> Second body line\n"
    ) as BlockQuoteElement[]

    assert.equal(element.type, "block-quote")
    assert.equal(element.children.length, 2)
    assert.deepEqual(getCalloutInfo(element), {
      type: "tip",
      displayType: "tip",
      title: "Title",
      fold: undefined,
      icon: "⚑",
    })
    assert.equal(serialize([element]).trimEnd(), [
      "> [!tip] Title",
      "> First body line  ",
      "> Second body line",
    ].join("\n"))
  })
})
