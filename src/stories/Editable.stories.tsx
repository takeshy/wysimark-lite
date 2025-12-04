import type { Meta, StoryObj } from '@storybook/react'
import { Editable, useEditor } from '../entry'
import React from 'react'

const meta: Meta<typeof Editable> = {
    title: 'Components/Editable',
    component: Editable,
    parameters: {
        layout: 'centered',
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
        <div style={{ width: '800px' }}>
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
        <div style={{ width: '800px' }}>
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
