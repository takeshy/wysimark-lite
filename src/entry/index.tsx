import throttle from "lodash.throttle"
import { useCallback, useRef, useState } from "react"
import { Descendant, Editor, Element, Transforms } from "slate"
import { ReactEditor, RenderLeafProps, Slate } from "slate-react"

import { parse, serialize, escapeUrlSlashes, unescapeUrlSlashes } from "../convert"
import { t } from "../utils/translations"
import { SinkEditable } from "./SinkEditable"
import { useEditor } from "./useEditor"
import * as Icon from "../toolbar-plugin/icons"

export type { Element, Text } from "./plugins"

export { useEditor }

function renderLeaf({ children, attributes }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>
}

export type EditableProps = {
  // editor: BaseEditor & ReactEditor & HistoryEditor & SinkEditor & WysimarkEditor
  editor: Editor
  value: string
  onChange: (markdown: string) => void
  throttleInMs?: number
  placeholder?: string
  className?: string
  style?: React.CSSProperties
} // & Omit<React.TextareaHTMLAttributes<HTMLDivElement>, "onChange">

export function Editable({
  editor,
  value,
  onChange,
  throttleInMs = 1000,
  placeholder,
  className,
  style,
}: EditableProps) {
  const [isRawMode, setIsRawMode] = useState(false)
  const [rawText, setRawText] = useState(value)
  const ignoreNextChangeRef = useRef<boolean>(false)

  /**
   * This is a temporary ref that is only used once to store the initial value
   * derived from the initial Markdown value.
   */
  const initialValueRef = useRef<Descendant[] | undefined>(undefined)

  /**
   * Track the previous value of the editor. This is used to determine if the
   * change from the editor resulted in a change in the contents of the editor
   * as opposed to just a cursor movement for example.
   */
  const prevValueRef = useRef<Descendant[] | undefined>(undefined)

  /**
   * Track the last value emitted via onChange. This is used to prevent
   * unnecessary reparsing when the parent component sets value to what
   * we just emitted.
   */
  const lastEmittedValueRef = useRef<string | undefined>(undefined)

  /**
   * Throttled version of `onChange` for the `Slate` component. This method gets
   * called on every change to the editor except for:
   *
   * - The first call to `onChange` when the component is mounted which would
   *   be in response to the initial normalization pass that is always run to
   *   make sure the content is in a good state.
   * - When the incoming value (markdown) to the editor is changed and we force
   *   the editor to update its value after doing a `parse` on the markdown.
   *   We don't want the `onChange` callback to be called for this because if
   *   the change came from an edit to a textarea, for example, it would
   *   serialize the editor and the value of the textarea would be updated with
   *   a slightly different value. This would cause the selection to jump. This
   *   is especially bad if the cursor is at the end of a line and the user
   *   presses the spacebar. This is because Markdown does not support spaces
   *   at the end of a line and the space would be removed and the cursor would
   *   have nowhere to be.
   */
  const onThrottledSlateChange = useCallback(
    throttle(
      () => {
        const markdown = serialize(editor.children as Element[])
        editor.wysimark.prevValue = {
          markdown,
          children: editor.children,
        }
        lastEmittedValueRef.current = markdown
        onChange(markdown)
      },
      throttleInMs,
      { leading: false, trailing: true }
    ),
    [editor, onChange, throttleInMs]
  )

  /**
   * This handles the initial `onChange` event from the `Slate` component and
   * makes sure to ignore any change events that don't change the content of
   * the editor. For example, if the user just moves the cursor around, we
   * don't want to call the `onChange` callback.
   *
   * If it's neither, then it passes the call to the throttled `onChange` method.
   */
  const onSlateChange = useCallback(() => {
    if (prevValueRef.current === editor.children) {
      return
    }
    prevValueRef.current = editor.children
    onThrottledSlateChange()
  }, [onThrottledSlateChange])

  /**
   * Handle the initial mounting of the component. This is where we set the
   * initial value of the editor. We also set the `prevValue` on the editor
   * which is used to determine if a change in the editor resulted in a change
   * in the contents of the editor vs just changing the cursor position for
   * example.
   *
   * We add a check for `initialValueRef.current` not being null because the
   * ref can be lost on a hot reload. This then reinitializes the editor with
   * the initial value.
   *
   * NOTE: This value hasn't been normalized yet.
   */
  if (editor.wysimark.prevValue == null || initialValueRef.current == null) {
    ignoreNextChangeRef.current = true
    // Only escape URL slashes when not in raw mode
    const valueToProcess = isRawMode ? value : escapeUrlSlashes(value);
    const children = parse(valueToProcess)
    prevValueRef.current = initialValueRef.current = children
    editor.wysimark.prevValue = {
      markdown: value, // Store the original unescaped value
      children,
    }
    lastEmittedValueRef.current = value
  } else {
    /**
     * Handle the case where the `value` differs from the last `markdown` value
     * set in the Wysimark editor. If it differs, that means the change came
     * from somewhere else and we need to set the editor value.
     *
     * Apart from setting `editor.children` we also need to set the selection
     * to the start of the document. This is because the selection may be set
     * to an invalid value based on the new document value.
     *
     * We also check against `lastEmittedValueRef.current` to prevent race
     * conditions during throttle delays. When throttled onChange fires, the
     * parent component receives the new value and passes it back as a prop.
     * However, `editor.wysimark.prevValue.markdown` may not be updated yet
     * due to the trailing throttle behavior. By also checking against the
     * last emitted value, we avoid unnecessary reparsing.
     */
    /**
     * In Raw Mode, synchronize prevValue.markdown with the current value prop.
     * This prevents unnecessary reparsing when the user edits in raw mode.
     * Without this, each keystroke in raw mode would trigger a reparse because
     * the value prop (updated via onChange) differs from prevValue.markdown.
     */
    if (isRawMode) {
      editor.wysimark.prevValue.markdown = value
      lastEmittedValueRef.current = value
    } else {
      const diffFromPrevValue = value !== editor.wysimark.prevValue.markdown
      const diffFromLastEmitted = value !== lastEmittedValueRef.current
      if (diffFromPrevValue && diffFromLastEmitted) {
        ignoreNextChangeRef.current = true
        // Only escape URL slashes when not in raw mode
        const valueToProcess = escapeUrlSlashes(value);
        const documentValue = parse(valueToProcess)
        editor.children = documentValue
        editor.selection = null
        Transforms.select(editor, Editor.start(editor, [0]))
      }
    }
  }

  const onSinkeEditableMouseDown = useCallback(() => {
    /**
     * For some reason, Firefox doesn't focus the editor when clicking on
     * it until the second try. This is a workaround for that.
     * Handled narrowly to avoid potentially breaking other browsers.
     */
    if (navigator.userAgent.toLowerCase().includes("firefox")) {
      ReactEditor.focus(editor)
    }
  }, [editor])

  /**
   * When the user exits the editor, we want to call the `onChange` callback
   * immediately.
   */
  const onBlur = useCallback(() => {
    onThrottledSlateChange.flush()
  }, [onThrottledSlateChange])

  // Handle raw text change
  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawText(newText);
    // Also update the editor's value through onChange
    onChange(newText);
  }

  // When switching from raw mode to visual mode
  const applyRawTextToEditor = useCallback(() => {
    if (rawText !== editor.getMarkdown()) {
      editor.setMarkdown(rawText);
    }
  }, [editor, rawText]);

  /**
   * When switching from visual mode to raw mode, populate the textarea
   * with the value prop instead of serializing from the editor.
   *
   * This is important because the parse->serialize round-trip can lose
   * formatting that exists in the original markdown but cannot be
   * represented in the Slate document structure. For example, if the
   * original markdown had an image followed by a heading without proper
   * newlines, the editor would parse them into the same paragraph.
   * Serializing from the editor would output broken markdown.
   *
   * By using the value prop directly, we preserve the exact markdown
   * that the parent component has, allowing users to fix formatting
   * issues in raw mode.
   */
  const updateRawTextFromEditor = useCallback(() => {
    setRawText(value);
  }, [value]);

  // Handle mode toggle
  const handleRawModeToggle = useCallback(() => {
    if (isRawMode) {
      // Switching from raw mode to visual mode
      applyRawTextToEditor();
    } else {
      // Switching from visual mode to raw mode
      updateRawTextFromEditor();
    }
    setIsRawMode(!isRawMode);
  }, [isRawMode, applyRawTextToEditor, updateRawTextFromEditor]);

  // Set the Raw mode state and toggle function on the editor
  // This allows the toolbar to access these properties
  editor.wysimark.isRawMode = isRawMode;
  editor.wysimark.toggleRawMode = handleRawModeToggle;

  return (
    <div style={{ position: 'relative' }}>
      {/* Only show the Raw mode icon when in Raw mode */}
      {isRawMode && (
        <div style={{ position: 'absolute', top: '5px', right: '25px', zIndex: 10 }}>
          <div
            onClick={handleRawModeToggle}
            style={{
              background: 'none',
              border: '1px solid #4a90e2',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={t("switchToVisualEditor")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRawModeToggle();
                e.preventDefault();
              }
            }}
          >
            {/* Use the VisualEditor icon */}
            <span style={{ color: '#4a90e2', fontSize: '1.25em' }}>
              <Icon.VisualEditor />
            </span>
          </div>
        </div>
      )}

      {/* Raw mode textarea - always in DOM but hidden when not in raw mode */}
      <div style={{ display: isRawMode ? 'block' : 'none', textAlign: 'center' }}>
        <textarea
          value={unescapeUrlSlashes(rawText).replace(/&nbsp;/g, '')}
          onChange={handleRawTextChange}
          placeholder={placeholder}
          className={className}
          style={{
            width: 'calc(100% - 60px)', /* Full width minus 200px on each side */
            margin: '0 auto', /* Center the textarea */
            minHeight: '200px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '14px',
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
          initialValue={initialValueRef.current}
          onValueChange={onSlateChange}
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
