import { useState, useRef, CSSProperties, useEffect, useCallback } from "react"
import { useSlateStatic } from "slate-react"

import { CloseMask } from "../../../shared-overlays"
import { positionInside, useAbsoluteReposition } from "../../../use-reposition"
import { t } from "../../../utils/translations"

import { $FileDialog } from "../../styles/file-dialog-styles"
import { DraggableHeader } from "./DraggableHeader"

type ImageSource = "url" | "file" | "select"

export function ImageUrlDialog({
    dest,
    close,
}: {
    dest: HTMLElement
    close: () => void
}) {
    const editor = useSlateStatic()
    const ref = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    const handleDrag = useCallback((deltaX: number, deltaY: number) => {
        setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
    }, [])

    // Persist dialog values in editor.wysimark so they survive dialog close/reopen
    const savedState = editor.wysimark?.imageDialogState
    const hasOnImageChange = !!editor.wysimark?.onImageChange
    const hasOnFileSelect = !!editor.wysimark?.onFileSelect

    const defaultSource: ImageSource = savedState?.imageSource ?? (hasOnFileSelect ? "select" : hasOnImageChange ? "file" : "url")

    const [url, setUrl] = useState(savedState?.url ?? "")
    const [alt, setAlt] = useState(savedState?.alt ?? "")
    const [title, setTitle] = useState(savedState?.title ?? "")
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)
    const [imageSource, setImageSource] = useState<ImageSource>(defaultSource)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState(savedState?.uploadedUrl ?? "")

    // Reset uploadedUrl when switching image source modes
    const handleImageSourceChange = (source: ImageSource) => {
        setImageSource(source)
        setUploadedUrl("")
        setUploadedFileName("")
    }
    const [uploadedFileName, setUploadedFileName] = useState("")

    // Handlers for alt and title with sync
    const handleAltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newAlt = e.target.value
        setAlt(newAlt)
        // Sync title with alt if title hasn't been manually edited
        if (!titleManuallyEdited) {
            setTitle(newAlt)
        }
    }, [titleManuallyEdited])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        setTitleManuallyEdited(true)
    }, [])

    // Save state to editor when values change
    useEffect(() => {
        if (editor.wysimark) {
            editor.wysimark.imageDialogState = { url, alt, title, imageSource, uploadedUrl }
        }
    }, [editor, url, alt, title, imageSource, uploadedUrl])

    // Clear state on successful submit or cancel
    const clearState = () => {
        if (editor.wysimark) {
            editor.wysimark.imageDialogState = undefined
        }
    }

    const baseStyle = useAbsoluteReposition(
        { src: ref, dest },
        ({ src, dest }, viewport) => {
            return positionInside(
                src,
                viewport,
                {
                    left: dest.left - 16,
                    top: dest.top + dest.height,
                },
                { margin: 16 }
            )
        }
    ) as CSSProperties

    const style = {
        ...baseStyle,
        left: (baseStyle.left as number) + dragOffset.x,
        top: (baseStyle.top as number) + dragOffset.y,
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const finalUrl = (imageSource === "file" || imageSource === "select") ? uploadedUrl : url
        if (finalUrl.trim() === "") return

        editor.image.insertImageFromUrl(finalUrl, alt, title)
        clearState()
        close()
    }

    function handleCancel() {
        clearState()
        close()
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !editor.wysimark?.onImageChange) return

        setUploadedFileName(file.name)
        setIsUploading(true)
        try {
            const resultUrl = await editor.wysimark.onImageChange(file)
            setUploadedUrl(resultUrl)
        } catch (error) {
            void error
        } finally {
            setIsUploading(false)
        }
    }

    function handleSelectFileClick() {
        fileInputRef.current?.click()
    }

    async function handleFileSelectFromPicker() {
        if (!editor.wysimark?.onFileSelect) return
        setIsUploading(true)
        try {
            const resultUrl = await editor.wysimark.onFileSelect()
            if (resultUrl) {
                setUploadedUrl(resultUrl)
            }
        } catch (error) {
            void error
        } finally {
            setIsUploading(false)
        }
    }

    const isSubmitDisabled = (imageSource === "file" || imageSource === "select")
        ? uploadedUrl.trim() === "" || isUploading
        : url.trim() === ""

    return (
        <>
            <CloseMask close={close} />
            <$FileDialog ref={ref} style={style}>
                <DraggableHeader onDrag={handleDrag} />
                <form onSubmit={(e) => void handleSubmit(e)} style={{ padding: "8px" }}>
                    {(hasOnImageChange || hasOnFileSelect) && (
                        <div style={{ marginBottom: "12px" }}>
                            {hasOnFileSelect && (
                                <label style={{ display: "inline-flex", alignItems: "center", marginRight: "16px", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="imageSource"
                                        value="select"
                                        checked={imageSource === "select"}
                                        onChange={() => handleImageSourceChange("select")}
                                        style={{ marginRight: "4px" }}
                                    />
                                    {t("imageSourceSelect")}
                                </label>
                            )}
                            {hasOnImageChange && (
                                <label style={{ display: "inline-flex", alignItems: "center", marginRight: "16px", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="imageSource"
                                        value="file"
                                        checked={imageSource === "file"}
                                        onChange={() => handleImageSourceChange("file")}
                                        style={{ marginRight: "4px" }}
                                    />
                                    {t("imageSourceFile")}
                                </label>
                            )}
                            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="url"
                                    checked={imageSource === "url"}
                                    onChange={() => handleImageSourceChange("url")}
                                    style={{ marginRight: "4px" }}
                                />
                                {t("imageSourceUrl")}
                            </label>
                        </div>
                    )}

                    {imageSource === "url" ? (
                        <div style={{ marginBottom: "8px" }}>
                            <label style={{ display: "block", marginBottom: "4px" }}>
                                {t("imageUrlRequired")}
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "6px",
                                    boxSizing: "border-box",
                                    border: "1px solid var(--shade-300)",
                                    borderRadius: "4px",
                                    backgroundColor: "var(--shade-50)",
                                    color: "var(--shade-700)"
                                }}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    ) : imageSource === "select" ? (
                        <div style={{ marginBottom: "8px" }}>
                            <button
                                type="button"
                                onClick={() => void handleFileSelectFromPicker()}
                                disabled={isUploading}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isUploading ? "#ccc" : "#0078d4",
                                    color: isUploading ? "#666" : "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: isUploading ? "not-allowed" : "pointer",
                                    marginBottom: "8px",
                                    fontWeight: "bold"
                                }}
                            >
                                {isUploading ? t("uploading") : t("imageSourceSelect")}
                            </button>

                            {uploadedUrl && (
                                <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "var(--shade-100)", borderRadius: "4px" }}>
                                    <div style={{ color: "green", marginBottom: "4px" }}>✓ {t("uploadComplete")}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginBottom: "8px" }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => void handleFileSelect(e)}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                onClick={handleSelectFileClick}
                                disabled={isUploading}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isUploading ? "#ccc" : "#0078d4",
                                    color: isUploading ? "#666" : "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: isUploading ? "not-allowed" : "pointer",
                                    marginBottom: "8px",
                                    fontWeight: "bold"
                                }}
                            >
                                {isUploading ? t("uploading") : t("selectFile")}
                            </button>

                            {uploadedUrl && (
                                <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "var(--shade-100)", borderRadius: "4px" }}>
                                    <div style={{ color: "green", marginBottom: "4px" }}>✓ {t("uploadComplete")}</div>
                                    {uploadedFileName && (
                                        <div style={{ fontSize: "12px", color: "var(--shade-500)" }}>{uploadedFileName}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                            {t("altText")}
                        </label>
                        <input
                            type="text"
                            value={alt}
                            onChange={handleAltChange}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                backgroundColor: "var(--shade-50)",
                                color: "var(--shade-700)"
                            }}
                            placeholder={t("imageDescription")}
                        />
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                            {t("title")}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                backgroundColor: "var(--shade-50)",
                                color: "var(--shade-700)"
                            }}
                            placeholder={t("imageTitle")}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 16px",
                                backgroundColor: isSubmitDisabled ? "#ccc" : "#0078d4",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            {t("register")}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "var(--shade-100)",
                                color: "var(--shade-700)",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </form>
            </$FileDialog>
        </>
    )
}
