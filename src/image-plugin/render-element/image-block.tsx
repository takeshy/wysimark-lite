import { useSlateStatic } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"

import { isWikiEmbedUrl, wikiEmbedSpecFromUrl } from "../../convert/obsidian-links"
import { $ImageBlock } from "../styles/image-block-styles"
import { ImageBlockElement } from "../types"
import { ImageWithControls } from "./image-with-controls"

export function ImageBlock({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<ImageBlockElement>) {
  const editor = useSlateStatic()
  const renderInternalEmbed = editor.wysimark.renderInternalEmbed
  if (isWikiEmbedUrl(element.url) && renderInternalEmbed) {
    return (
      <div {...attributes}>
        <div contentEditable={false}>
          {renderInternalEmbed(wikiEmbedSpecFromUrl(element.url))}
        </div>
        {children}
      </div>
    )
  }
  return (
    <div {...attributes}>
      <$ImageBlock contentEditable={false}>
        <ImageWithControls
          element={element}
          presets={editor.image.imageBlockPresets}
        />
      </$ImageBlock>
      {children}
    </div>
  )
}
