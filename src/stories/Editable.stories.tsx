import type { Meta, StoryObj } from '@storybook/react'
import { Editable, useEditor } from '../entry'
import React from 'react'

const meta: Meta<typeof Editable> = {
    title: 'Components/Editable',
    component: Editable,
    parameters: {
        layout: 'fullscreen',
    },
    args: {},
    argTypes: {
        onChange: { action: 'changed' }
    }
}

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
// Basic Editor (Default Options)
// ============================================================================

const BasicEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({})

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                <strong>Default Options:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Raw mode: disabled (default)</li>
                    <li>Highlight: disabled (default)</li>
                    <li>Task list: enabled</li>
                    <li>Code block: enabled</li>
                </ul>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <BasicEditorWrapper
        onChange={args.onChange}
        initialValue={`# Welcome to Wysimark

This is a **rich text editor** with _markdown_ support.

- List item 1
- List item 2

Try the toolbar buttons above!`}
    />
}

// ============================================================================
// With Raw Mode Enabled
// ============================================================================

const RawModeEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({
        disableRawMode: false,  // Enable raw mode
    })

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
                <strong>Raw Mode Enabled:</strong>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    Click the markdown icon in the toolbar to switch to raw markdown editing mode.
                </p>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export const WithRawMode: Story = {
    render: (args) => <RawModeEditorWrapper
        onChange={args.onChange}
        initialValue={`# Raw Mode Example

Click the **markdown icon** in the toolbar to switch to raw mode.

You can edit the raw markdown directly and switch back to visual mode.`}
    />
}

// ============================================================================
// With Highlight Enabled
// ============================================================================

const HighlightEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({
        disableHighlight: false,  // Enable highlight
    })

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#fff9c4', borderRadius: '4px' }}>
                <strong>Highlight Enabled:</strong>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    Select text and click the highlighter icon to apply highlight.
                    Highlight is saved as <code>&lt;mark&gt;text&lt;/mark&gt;</code> in markdown.
                </p>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <h4>Current Markdown:</h4>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
                    {value}
                </pre>
            </div>
        </div>
    )
}

export const WithHighlight: Story = {
    render: (args) => <HighlightEditorWrapper
        onChange={args.onChange}
        initialValue={`# Highlight Example

Select some text and click the **highlighter icon** in the toolbar.

The highlight will be saved as <mark>highlighted text</mark> in markdown.`}
    />
}

// ============================================================================
// All Features Enabled
// ============================================================================

const AllFeaturesEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({
        disableRawMode: false,
        disableHighlight: false,
    })

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
                <strong>All Features Enabled:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Raw mode: enabled</li>
                    <li>Highlight: enabled</li>
                    <li>Task list: enabled</li>
                    <li>Code block: enabled</li>
                </ul>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export const AllFeatures: Story = {
    render: (args) => <AllFeaturesEditorWrapper
        onChange={args.onChange}
        initialValue={`# All Features Example

All features are enabled:

- [x] Task list works
- [ ] Unchecked item

\`\`\`javascript
// Code block works
console.log("Hello World")
\`\`\`

Try the **highlight** and **raw mode** buttons in the toolbar!`}
    />
}

// ============================================================================
// Disabled Features Example
// ============================================================================

const DisabledFeaturesEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({
        disableTaskList: true,
        disableCodeBlock: true,
    })

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                <strong>Disabled Features:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Task list: <strong>disabled</strong></li>
                    <li>Code block: <strong>disabled</strong></li>
                    <li>Raw mode: disabled (default)</li>
                    <li>Highlight: disabled (default)</li>
                </ul>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export const DisabledFeatures: Story = {
    render: (args) => <DisabledFeaturesEditorWrapper
        onChange={args.onChange}
        initialValue={`# Disabled Features Example

Task list and code block buttons are hidden from the toolbar.

- Regular list still works
- But task list button is hidden

Normal lists work fine:
1. Numbered item 1
2. Numbered item 2`}
    />
}

// ============================================================================
// With Image Upload
// ============================================================================

const ImageUploadEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const [uploadLog, setUploadLog] = React.useState<string[]>([])
    const editor = useEditor({})

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    const handleImageChange = async (file: File): Promise<string> => {
        const log = `Uploading: ${file.name} (${file.size} bytes)`
        setUploadLog(prev => [...prev, log])

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        const fakeUrl = `https://example.com/uploads/${Date.now()}-${file.name}`
        setUploadLog(prev => [...prev, `Done: ${fakeUrl}`])

        return fakeUrl
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '10px', padding: '10px', background: '#e8f4e8', borderRadius: '4px' }}>
                <strong>Image Upload:</strong>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    Click the image button and select "ファイル" to upload an image file.
                </p>
            </div>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
                onImageChange={handleImageChange}
            />
            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <h4>Upload Log:</h4>
                {uploadLog.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>No uploads yet.</p>
                ) : (
                    <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
                        {uploadLog.map((log, i) => (
                            <li key={i}>{log}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export const WithImageUpload: Story = {
    render: (args) => <ImageUploadEditorWrapper
        onChange={args.onChange}
        initialValue={`# Image Upload Example

Click the image button in the toolbar.

When onImageChange prop is provided, you can upload files directly.`}
    />
}

// ============================================================================
// Debug Mode (shows markdown output)
// ============================================================================

const DebugEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({
        disableRawMode: false,
        disableHighlight: false,
    })

    const handleChange = (newValue: string) => {
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <h4>Current Markdown:</h4>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                    {value}
                </pre>
            </div>
        </div>
    )
}

export const DebugMode: Story = {
    render: (args) => <DebugEditorWrapper
        onChange={args.onChange}
        initialValue={`# Debug Mode

Edit the content above and see the markdown output below.

All features are enabled for testing.`}
    />
}
