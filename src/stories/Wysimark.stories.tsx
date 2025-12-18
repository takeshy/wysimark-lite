import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Editable, useEditor } from '../entry';

// Wrapper component for Storybook
function WysimarkEditor({
  initialValue = '',
  placeholder = 'Start writing...',
  height,
  minHeight,
  maxHeight,
  disableRawMode,
  disableHighlight,
  disableTaskList,
  disableCodeBlock,
  enableImageUpload,
}: {
  initialValue?: string;
  placeholder?: string;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  disableRawMode?: boolean;
  disableHighlight?: boolean;
  disableTaskList?: boolean;
  disableCodeBlock?: boolean;
  enableImageUpload?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const editor = useEditor({ height, minHeight, maxHeight, disableRawMode, disableHighlight, disableTaskList, disableCodeBlock });

  const handleChange = useCallback((markdown: string) => {
    setValue(markdown);
  }, []);

  const toggleMarkdown = useCallback(() => {
    setShowMarkdown((prev) => !prev);
  }, []);

  // Mock image upload handler - converts file to data URL
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate network delay
        setTimeout(() => {
          resolve(reader.result as string);
        }, 1000);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={toggleMarkdown}
          style={{
            padding: '8px 16px',
            backgroundColor: showMarkdown ? '#4a9eff' : '#e0e0e0',
            color: showMarkdown ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {showMarkdown ? 'Hide Markdown' : 'Show Markdown'}
        </button>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
        <Editable
          editor={editor}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onImageChange={enableImageUpload ? handleImageUpload : undefined}
        />
      </div>
      {showMarkdown && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>
            Raw Markdown:
          </div>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </pre>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof WysimarkEditor> = {
  title: 'Wysimark/Editor',
  component: WysimarkEditor,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial markdown content',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when empty',
    },
    height: {
      control: 'text',
      description: 'Fixed height of the editor',
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of the editor',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of the editor',
    },
    disableRawMode: {
      control: 'boolean',
      description: 'Disable raw markdown editing mode (default: true)',
    },
    disableHighlight: {
      control: 'boolean',
      description: 'Disable highlight mark functionality (default: true)',
    },
    disableTaskList: {
      control: 'boolean',
      description: 'Disable task list (checklist) functionality',
    },
    disableCodeBlock: {
      control: 'boolean',
      description: 'Disable code block functionality',
    },
    enableImageUpload: {
      control: 'boolean',
      description: 'Enable image upload functionality with onImageChange callback',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WysimarkEditor>;

export const Default: Story = {
  args: {
    initialValue: '',
    placeholder: 'Start writing...',
  },
};

export const TestIME: Story = {
  args: {
    initialValue: `# Highlight Example

Select some text and click the **highlighter icon** in the toolbar.

The highlight will be saved as <mark>highlighted text</mark> in markdown.`,
    placeholder: 'Start writing...',
  },
};

export const WithContent: Story = {
  args: {
    initialValue: `# Hello World

This is a **WYSIWYG** markdown editor.

## Features

- Rich text editing
- Markdown support
- Tables
- Code blocks

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`,
    placeholder: 'Start writing...',
  },
};

export const WithFixedHeight: Story = {
  args: {
    initialValue: '# Fixed Height Editor\n\nThis editor has a fixed height.',
    placeholder: 'Start writing...',
    height: '400px',
  },
};

export const WithMinMaxHeight: Story = {
  args: {
    initialValue: '',
    placeholder: 'Start writing... (min: 200px, max: 500px)',
    minHeight: '200px',
    maxHeight: '500px',
  },
};

export const TaskList: Story = {
  args: {
    initialValue: `# Task List Example

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do
`,
    placeholder: 'Start writing...',
  },
};

export const WithHtmlBlock: Story = {
  args: {
    initialValue: `# HTML Block Example

This editor preserves raw HTML blocks like video embeds:

<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/123456"></iframe></div>

The HTML block above is displayed as a read-only block in the editor.

Regular markdown formatting still works:

- **Bold text**
- *Italic text*
`,
    placeholder: 'Start writing...',
  },
};

export const AllFeaturesEnabled: Story = {
  args: {
    initialValue: `# All Features Enabled

This editor has all features enabled:

- **Highlight**: Select text and use Ctrl+H (or the toolbar button)
- **Raw Mode**: Click the Markdown icon to edit raw markdown
- **Task List**: Create checklists with the toolbar
- **Code Block**: Add code blocks with syntax highlighting

Try <mark>highlighted text</mark> here!

- [x] Completed task
- [ ] Pending task
`,
    placeholder: 'Start writing...',
    disableRawMode: false,
    disableHighlight: false,
    disableTaskList: false,
    disableCodeBlock: false,
  },
};

export const WithImageUpload: Story = {
  args: {
    initialValue: `# Image Upload Example

Click the **image icon** in the toolbar to upload an image.

When \`onImageChange\` callback is provided:
- A radio button appears to switch between URL input and file upload
- You can also **drag and drop** image files directly into the editor

Try uploading an image below!
`,
    placeholder: 'Start writing...',
    enableImageUpload: true,
  },
};
