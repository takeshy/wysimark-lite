import { useSlateStatic } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"

import { isWikiEmbedUrl, wikiEmbedSpecFromUrl } from "../../convert/obsidian-links"
import { $ImageInline } from "../styles/image-inline-styles"
import { ImageInlineElement } from "../types"
import { ImageWithControls } from "./image-with-controls"

export function ImageInline({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<ImageInlineElement>) {
  const editor = useSlateStatic()
  const renderInternalEmbed = editor.wysimark.renderInternalEmbed
  if (isWikiEmbedUrl(element.url) && renderInternalEmbed) {
    return (
      <span {...attributes} style={{ display: "inline-block" }}>
        <span contentEditable={false}>
          {renderInternalEmbed(wikiEmbedSpecFromUrl(element.url))}
        </span>
        {children}
      </span>
    )
  }
  return (
    <span {...attributes} style={{ display: "inline-block" }}>
      <$ImageInline contentEditable={false}>
        <ImageWithControls
          element={element}
          presets={editor.image.imageInlinePresets}
        />
      </$ImageInline>
      {children}
    </span>
  )
}
