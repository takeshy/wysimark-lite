import { Element } from "../types"
import { InternalLinkOptions } from "../obsidian-links"
import { normalizeElementListDepths } from "./normalize/normalizeElementListDepths"
import { serializeElements } from "./serialize-elements"

export function serialize(
  elements: Element[],
  options: InternalLinkOptions = {}
): string {
  const normalizedElements = normalizeElementListDepths(elements)
  return serializeElements(normalizedElements, options)
}
