import throttle from "lodash.throttle"
import { useCallback, useRef, useState } from "react"
import { Descendant, Editor, Element, Transforms } from "slate"
import { ReactEditor, RenderLeafProps, Slate } from "slate-react"

import { parse, serialize, escapeUrlSlashes, unescapeUrlSlashes } from "../convert"
import { t } from "../utils/translations"
import { SinkEditable } from "./SinkEditable"
import { useEditor } from "./useEditor"

export type { Element, Text } from "./plugins"

export { useEditor }

function renderLeaf({ children, attributes }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>
}

import type { OnImageChangeHandler, OnFileSelectHandler } from "./types"
export type { OnImageChangeHandler, OnFileSelectHandler } from "./types"

export type EditableProps = {
  editor: Editor
  value: string
  onChange: (markdown: string) => void
  throttleInMs?: number
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  onImageChange?: OnImageChangeHandler
  onFileSelect?: OnFileSelectHandler
}

export function Editable({
  editor,
  value,
  onChange,
  throttleInMs = 1000,
  placeholder,
  className,
  style,
  onImageChange,
  onFileSelect,
}: EditableProps) {
  const [isRawMode, setIsRawMode] = useState(false)
  const [rawText, setRawText] = useState(value)
  const ignoreNextChangeRef = useRef<boolean>(false)
  const initialValueRef = useRef<Descendant[] | undefined>(undefined)
  const prevValueRef = useRef<Descendant[] | undefined>(undefined)
  // Store rawText to use when switching back to visual mode
  const pendingRawTextRef = useRef<string | null>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onThrottledSlateChange = useCallback(
    throttle(
      () => {
        const markdown = serialize(editor.children as Element[])
        editor.wysimark.prevValue = {
          markdown,
          children: editor.children,
        }
        onChangeRef.current(markdown)
      },
      throttleInMs,
      { leading: false, trailing: true }
    ),
    [editor, throttleInMs]
  )

  /* eslint-disable react-hooks/exhaustive-deps */
  const onSlateChange = useCallback(() => {
    if (prevValueRef.current === editor.children) {
      return
    }
    prevValueRef.current = editor.children
    onThrottledSlateChange()
  }, [onThrottledSlateChange])
  /* eslint-enable react-hooks/exhaustive-deps */

  // Skip parsing when in raw mode - only update when in visual mode
  if (!isRawMode) {
    // Use pendingRawText if we just switched from raw mode
    const markdownToUse = pendingRawTextRef.current ?? value
    if (pendingRawTextRef.current !== null) {
      pendingRawTextRef.current = null
    }

    if (editor.wysimark.prevValue == null || initialValueRef.current == null) {
      ignoreNextChangeRef.current = true
      const valueToProcess = escapeUrlSlashes(markdownToUse);
      const children = parse(valueToProcess)
      editor.children = children
      prevValueRef.current = initialValueRef.current = children
      editor.wysimark.prevValue = {
        markdown: markdownToUse,
        children,
      }
    } else {
      if (markdownToUse !== editor.wysimark.prevValue.markdown) {
        ignoreNextChangeRef.current = true
        const valueToProcess = escapeUrlSlashes(markdownToUse);
        const documentValue = parse(valueToProcess)
        editor.children = documentValue
        editor.selection = null
        Transforms.select(editor, Editor.start(editor, [0]))
      }
    }
  }

  const onSinkeEditableMouseDown = useCallback(() => {
    if (navigator.userAgent.toLowerCase().includes("firefox")) {
      ReactEditor.focus(editor)
    }
  }, [editor])

  const onBlur = useCallback(() => {
    onThrottledSlateChange.flush()
  }, [onThrottledSlateChange])

  // Handle raw text change
  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawText(newText);
    onChange(newText);
  }

  // When switching from visual mode to raw mode
  const updateRawTextFromEditor = useCallback(() => {
    const currentMarkdown = editor.getMarkdown();
    setRawText(currentMarkdown);
  }, [editor]);

  // Handle mode toggle
  const handleRawModeToggle = () => {
    if (isRawMode) {
      // Switching from raw mode to visual mode
      // Store rawText to use for initialization
      pendingRawTextRef.current = rawText
      // Reset initialization refs so the editor re-initializes
      editor.wysimark.prevValue = undefined
      initialValueRef.current = undefined
      prevValueRef.current = undefined
    } else {
      // Switching from visual mode to raw mode
      updateRawTextFromEditor();
    }
    setIsRawMode(!isRawMode);
  };

  editor.wysimark.onImageChange = onImageChange;
  editor.wysimark.onFileSelect = onFileSelect;
  editor.wysimark.onChange = onChange;

  // Check if raw mode is disabled
  const disableRawMode = editor.wysimark.disableRawMode

  return (
    <div style={{ position: 'relative' }}>
      {/* Raw mode toggle button - only show if not disabled */}
      {!disableRawMode && (
        <div style={{ position: 'absolute', top: '5px', right: '25px', zIndex: 10 }}>
          <div
            onClick={handleRawModeToggle}
            style={{
              background: 'none',
              border: isRawMode ? '1px solid #4a90e2' : '1px solid transparent',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: isRawMode ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
              boxShadow: isRawMode ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isRawMode ? t("switchToVisualEditor") : t("switchToRawMarkdown")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRawModeToggle();
                e.preventDefault();
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke={isRawMode ? "#4a90e2" : "currentColor"}
                strokeWidth="1.5"
                fill={isRawMode ? "rgba(74, 144, 226, 0.05)" : "transparent"}
              />
              <path
                d="M7 15V9L10 12L13 9V15"
                stroke={isRawMode ? "#4a90e2" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 9H18V15"
                stroke={isRawMode ? "#4a90e2" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 12H18"
                stroke={isRawMode ? "#4a90e2" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Raw mode textarea - always in DOM but hidden when not in raw mode */}
      <div style={{ display: isRawMode ? 'block' : 'none', textAlign: 'center' }}>
        <textarea
          value={unescapeUrlSlashes(rawText)}
          onChange={handleRawTextChange}
          placeholder={placeholder}
          className={className}
          style={{
            width: 'calc(100% - 60px)',
            margin: '0 auto',
            minHeight: '200px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '1rem',
            color: '#333',
            lineHeight: '1.5',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            ...style
          }}
        />
      </div>

      {/* Visual editor - always in DOM but hidden when in raw mode */}
      <div style={{ display: isRawMode ? 'none' : 'block' }}>
        <Slate
          editor={editor}
          initialValue={initialValueRef.current as Descendant[]}
          onChange={onSlateChange}
        >
          <SinkEditable
            renderLeaf={renderLeaf}
            onMouseDown={onSinkeEditableMouseDown}
            onBlur={onBlur}
            placeholder={placeholder}
            className={className}
            style={style}
          />
        </Slate>
      </div>
    </div>
  )
}
