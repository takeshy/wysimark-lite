import { Descendant } from "slate"

export type OnImageChangeHandler = (file: File) => Promise<string>

export type ImageDialogState = {
  url: string
  alt: string
  title: string
  imageSource: "url" | "file"
  uploadedUrl: string
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
     * Whether the editor is in Raw mode
     */
    isRawMode?: boolean

    /**
     * Function to toggle Raw mode
     */
    toggleRawMode?: () => void

    /**
     * Handler for image file upload
     */
    onImageChange?: OnImageChangeHandler

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
  }
  /**
   * Public methods for the wysimark editor.
   */
  getMarkdown: () => string
  setMarkdown: (markdown: string) => void
}
