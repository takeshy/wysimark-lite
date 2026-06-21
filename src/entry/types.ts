import { Descendant } from "slate"
import type { ReactNode } from "react"

export type OnImageChangeHandler = (file: File) => Promise<string>
export type OnFileSelectHandler = () => Promise<string | null>
export type RenderInternalLinkPreview = (target: string) => ReactNode
export type RenderInternalEmbed = (spec: string) => ReactNode

export type ImageDialogState = {
  url: string
  alt: string
  title: string
  imageSource: "url" | "file" | "select"
  uploadedUrl?: string
}

export type WysimarkEditor = {
  /**
   * Private state for the wysimark editor.
   */
  wysimark: {
    prevValue?: {
      markdown: string
      children: Descendant[]
    }

    /**
     * Handler for image change
     */
    onImageChange?: OnImageChangeHandler

    /**
     * Handler for file selection (e.g. picking from Drive)
     */
    onFileSelect?: OnFileSelectHandler

    /**
     * Persisted state for the image dialog
     */
    imageDialogState?: ImageDialogState

    /**
     * Whether raw mode is disabled
     */
    disableRawMode?: boolean

    /**
     * Whether task list is disabled
     */
    disableTaskList?: boolean

    /**
     * Whether code block is disabled
     */
    disableCodeBlock?: boolean

    /**
     * Whether highlight mark is disabled
     */
    disableHighlight?: boolean

    /**
     * Whether Obsidian-style internal links are enabled
     */
    enableInternalLinks?: boolean

    /**
     * Render preview content for an internal link target.
     */
    renderInternalLinkPreview?: RenderInternalLinkPreview

    /**
     * Render inline content for an internal embed (`![[spec]]`).
     */
    renderInternalEmbed?: RenderInternalEmbed
  }
  /**
   * Public methods for the wysimark editor.
   */
  getMarkdown: () => string
  setMarkdown: (markdown: string) => void
}
