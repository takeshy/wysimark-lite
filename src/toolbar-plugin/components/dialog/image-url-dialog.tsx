import { useState, useRef, CSSProperties } from "react"
import { useSlateStatic } from "slate-react"

import { CloseMask } from "~/src/shared-overlays"
import { positionInside, useAbsoluteReposition } from "~/src/use-reposition"
import { t } from "~/src/utils/translations"

import { $FileDialog } from "../../styles/file-dialog-styles"

type ImageSource = "url" | "file"

export function ImageUrlDialog({
    dest,
    close,
}: {
    dest: HTMLElement
    close: () => void
}) {
    const editor = useSlateStatic()
    const ref = useRef<HTMLDivElement>(undefined) as unknown as HTMLDivElement
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [url, setUrl] = useState("")
    const [alt, setAlt] = useState("")
    const [title, setTitle] = useState("")
    const hasOnImageChange = !!editor.wysimark?.onImageChange
    const [imageSource, setImageSource] = useState<ImageSource>(hasOnImageChange ? "file" : "url")
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState("")

    const style = useAbsoluteReposition(
        { src: ref, dest },
        ({ src, dest }) => {
            return positionInside(
                src,
                dest,
                {
                    left: dest.left - 16,
                    top: dest.top + dest.height,
                },
                { margin: 16 }
            )
        }
    ) as CSSProperties

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const finalUrl = imageSource === "file" ? uploadedUrl : url
        if (finalUrl.trim() === "") return

        editor.image.insertImageFromUrl(finalUrl, alt, title)
        // Reset form for next image
        setUrl("")
        setAlt("")
        setTitle("")
        setUploadedUrl("")
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !editor.wysimark?.onImageChange) return

        setIsUploading(true)
        try {
            const resultUrl = await editor.wysimark.onImageChange(file)
            setUploadedUrl(resultUrl)
        } catch (error) {
            console.error("Failed to upload image:", error)
        } finally {
            setIsUploading(false)
        }
    }

    function handleSelectFileClick() {
        fileInputRef.current?.click()
    }

    const isSubmitDisabled = imageSource === "file"
        ? uploadedUrl.trim() === "" || isUploading
        : url.trim() === ""

    return (
        <>
            <CloseMask close={close} />
            <$FileDialog ref={ref as unknown as React.RefObject<HTMLDivElement>} style={style}>
                <form onSubmit={handleSubmit} style={{ padding: "8px" }}>
                    {hasOnImageChange && (
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "inline-flex", alignItems: "center", marginRight: "16px", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="file"
                                    checked={imageSource === "file"}
                                    onChange={() => setImageSource("file")}
                                    style={{ marginRight: "4px" }}
                                />
                                {t("imageSourceFile")}
                            </label>
                            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="url"
                                    checked={imageSource === "url"}
                                    onChange={() => setImageSource("url")}
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
                                    border: "1px solid #ccc",
                                    borderRadius: "4px"
                                }}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: "8px" }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                onClick={handleSelectFileClick}
                                disabled={isUploading}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isUploading ? "#ccc" : "#f0f0f0",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    cursor: isUploading ? "not-allowed" : "pointer",
                                    marginBottom: "8px"
                                }}
                            >
                                {isUploading ? t("uploading") : t("selectFile")}
                            </button>
                            {uploadedUrl && (
                                <div style={{ marginTop: "8px" }}>
                                    <label style={{ display: "block", marginBottom: "4px" }}>
                                        {t("imageUrlRequired")}
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadedUrl}
                                        disabled
                                        style={{
                                            width: "100%",
                                            padding: "6px",
                                            boxSizing: "border-box",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            backgroundColor: "#f5f5f5",
                                            color: "#666"
                                        }}
                                    />
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
                            onChange={(e) => setAlt(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid #ccc",
                                borderRadius: "4px"
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
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid #ccc",
                                borderRadius: "4px"
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
                            onClick={close}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#f0f0f0",
                                color: "#333",
                                border: "1px solid #ccc",
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
