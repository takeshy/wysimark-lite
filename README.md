# Wysimark-lite

A modern and clean rich text editor for React, supporting CommonMark and GFM Markdown spec.

wysimark ( https://github.com/portive/wysimark ) is a modern and clean rich text editor for React, supporting CommonMark and GFM Markdown spec. It is a fork of wysimark with some modifications to make it more lightweight and easier to use.

Thanks to the original author of wysimark, portive m(_ _)m

## Usage

### As React Component

```tsx
import { Editable, useEditor } from "wysimark-lite";
import React from "react";

const Editor: React.FC = () => {
  const [value, setValue] = React.useState("");
  const editor = useEditor({});

  return (
    <div style={{ width: "800px" }}>
      <Editable editor={editor} value={value} onChange={setValue} />
    </div>
  );
};
```

With initial value:

```tsx
const Editor: React.FC = () => {
  const [value, setValue] = React.useState(`# Welcome to Wysimark

This is a **rich text editor** with _markdown_ support.`);
  const editor = useEditor({});

  return <Editable editor={editor} value={value} onChange={setValue} />;
};
```

### Direct Initialization

You can also initialize the editor directly on an HTML element:

```html
<div id="editor"></div>
<script type="module">
  import { createWysimark } from "wysimark-lite";

  const editor = createWysimark(document.getElementById("editor"), {
    initialMarkdown: "# Hello Wysimark\n\nStart typing here...",
    onChange: (markdown) => {
      console.log("Markdown changed:", markdown);
    },
  });
</script>
```

## Features

- **Complete Markdown Support**: Full support for CommonMark and GFM Markdown spec
- **Modern Design**: Clean and contemporary interface that integrates seamlessly with React applications
- **User-Friendly Interface**:
  - Simplified toolbar with toggle buttons (click to activate/deactivate formatting)
  - Markdown shortcuts (e.g., `**` for **bold**, `#` for heading)
  - Keyboard shortcuts (e.g., `Ctrl/Cmd + B` for bold)
  - Japanese localized UI (toolbar and menu items in Japanese)
- **Enhanced List Support**:
  - Nested lists support (create hierarchical lists with multiple levels)
  - Mix different list types in the hierarchy

## Supported Features

- Tables
- Ordered and Unordered Lists with nesting support
- Task lists
- Headings and paragraphs
- Code blocks with syntax highlighting
- Inline code
- Links
- Text styling (bold, italic, inline code)
- Block quotes

## Browser Support

- Google Chrome
- Apple Safari
- Microsoft Edge
- Firefox

## Requirements

- React >= 17.x
- React DOM >= 17.x

## License

MIT
