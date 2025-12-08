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

const EditorWrapper: React.FC<{
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
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <EditorWrapper onChange={args.onChange} />
}

export const WithInitialValue: Story = {
    render: (args) => <EditorWrapper
        onChange={args.onChange}
        initialValue={`# Welcome to Wysimark

This is a **rich text editor** with _markdown_ support.`}
    />
}

// Test case: Image followed by heading (with proper newlines)
export const ImageWithHeading: Story = {
    render: (args) => <EditorWrapper
        onChange={args.onChange}
        initialValue={`![alt text](https://example.com/image.png)

# Heading After Image

This should render correctly with the heading.`}
    />
}

// Test case: Broken data - Image directly followed by heading (no newlines)
export const BrokenImageHeading: Story = {
    render: (args) => <EditorWrapper
        onChange={args.onChange}
        initialValue={`![alt text](https://example.com/image.png)# Heading Without Newline

This is broken data that was saved incorrectly.`}
    />
}

// Debug wrapper that shows current value
const DebugEditorWrapper: React.FC<{
    initialValue?: string;
    onChange?: (value: string) => void;
}> = ({ initialValue = '', onChange }) => {
    const [value, setValue] = React.useState(initialValue)
    const editor = useEditor({})

    const handleChange = (newValue: string) => {
        console.log('[DEBUG] onChange called with:', JSON.stringify(newValue.substring(0, 200)))
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
                <h4>Current Value (JSON escaped):</h4>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
                    {JSON.stringify(value)}
                </pre>
            </div>
        </div>
    )
}

// Debug story to see raw value changes
export const DebugRawMode: Story = {
    render: (args) => <DebugEditorWrapper
        onChange={args.onChange}
        initialValue={`![alt text](https://example.com/image.png)# Heading Without Newline

This is broken data. Try switching to raw mode and adding newlines.`}
    />
}

// Wrapper with onImageChange callback for file upload
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
        // Simulate upload delay
        const log = `Uploading: ${file.name} (${file.size} bytes, ${file.type})`
        console.log('[ImageUpload]', log)
        setUploadLog(prev => [...prev, log])

        await new Promise(resolve => setTimeout(resolve, 1500))

        // Create a fake URL (in real app, this would be the uploaded URL from server)
        const fakeUrl = `https://example.com/uploads/${Date.now()}-${file.name}`
        const successLog = `Uploaded: ${fakeUrl}`
        console.log('[ImageUpload]', successLog)
        setUploadLog(prev => [...prev, successLog])

        return fakeUrl
    }

    return (
        <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box' }}>
            <Editable
                editor={editor}
                value={value}
                onChange={handleChange}
                onImageChange={handleImageChange}
            />
            <div style={{ marginTop: '20px', padding: '10px', background: '#e8f4e8', borderRadius: '4px' }}>
                <h4>Image Upload Log:</h4>
                {uploadLog.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>No uploads yet. Click the image button in the toolbar and select "ファイル" to upload.</p>
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

// Story with onImageChange callback for file upload functionality
export const WithImageUpload: Story = {
    render: (args) => <ImageUploadEditorWrapper
        onChange={args.onChange}
        initialValue={`# Image Upload Example

Click the image button in the toolbar to see the file upload option.

When onImageChange prop is provided, a radio button appears to switch between URL and File upload modes.`}
    />
}

// Test case: Multi-line heading - place cursor on second line and click "標準" to split
export const MultiLineHeadingTest: Story = {
    render: (args) => <DebugEditorWrapper
        onChange={args.onChange}
        initialValue={`# Welcome to
Wysimark

Place cursor on "Wysimark" line and click "標準" (Normal).
Expected: "Welcome to" stays as Heading 1, "Wysimark" becomes normal paragraph.`}
    />
}
