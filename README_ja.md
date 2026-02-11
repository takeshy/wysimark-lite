# Wysimark-lite

React用のモダンでクリーンなリッチテキストエディタ。CommonMarkおよびGFM Markdown仕様に対応しています。

wysimark ( https://github.com/portive/wysimark ) をフォークし、より軽量で使いやすくなるよう改修したものです。

オリジナルのwysimarkの作者であるportiveに感謝します m(_ _)m

[English README](README.md)

## デモ

Storybookでエディタを試すことができます:
https://takeshy.github.io/wysimark-lite

## 使い方

### Reactコンポーネントとして使用

```bash
npm install wysimark-lite
```

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

### エディタオプション

`useEditor` フックは以下のオプションを受け付けます:

```tsx
const editor = useEditor({
  // Rawマークダウン編集モードを有効化 (デフォルト: true = 無効)
  disableRawMode: false,

  // ハイライト機能を有効化 (デフォルト: true = 無効)
  disableHighlight: false,

  // タスクリスト/チェックリストを無効化 (デフォルト: false)
  disableTaskList: true,

  // コードブロックを無効化 (デフォルト: false)
  disableCodeBlock: true,
});
```

| オプション | デフォルト | 説明 |
|--------|---------|-------------|
| `disableRawMode` | `true` | `false`にすると、WYSIWYGとRawマークダウン編集を切り替えるボタンが表示される |
| `disableHighlight` | `true` | `false`にすると、ツールバーにハイライトボタンが表示される。ハイライトはMarkdownで`<mark>text</mark>`として保存される |
| `disableTaskList` | `false` | `true`にすると、タスクリスト（チェックリスト）ボタンがツールバーから非表示になる |
| `disableCodeBlock` | `false` | `true`にすると、コードブロックボタンがツールバーから非表示になる |

### 画像アップロード機能付き

`onImageChange` コールバックを指定することで、画像ファイルのアップロード機能を有効にできます:

```tsx
import { Editable, useEditor } from "wysimark-lite";
import React from "react";

const Editor: React.FC = () => {
  const [value, setValue] = React.useState("");
  const editor = useEditor({});

  const handleImageUpload = async (file: File): Promise<string> => {
    // サーバーにファイルをアップロードしてURLを返す
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await response.json();
    return url;
  };

  return (
    <div style={{ width: "800px" }}>
      <Editable
        editor={editor}
        value={value}
        onChange={setValue}
        onImageChange={handleImageUpload}
      />
    </div>
  );
};
```

`onImageChange` を指定した場合:
- 画像ダイアログでURL入力とファイルアップロードを切り替えるラジオボタンが表示されます
- エディタに画像ファイルを**ドラッグ＆ドロップ**して、カーソル位置に挿入できます

### 直接初期化

HTML要素に対して直接エディタを初期化することもできます:

※ Rails importmapを使用している場合は、importmap.rbに以下を追加してください。
※ @latestはwysimark-liteの最新バージョンです。特定のバージョンを指定する場合は、@latestを使用したいバージョンに置き換えてください。
```
pin "wysimark-lite", to: "https://cdn.jsdelivr.net/npm/wysimark-lite@latest/dist/index.js"
```

```html
<div id="editor"></div>
<script type="module">
  import { createWysimark } from "wysimark-lite";

  const editor = createWysimark(document.getElementById("editor"), {
    initialMarkdown: "# Hello Wysimark\n\nここに入力してください...",
    onChange: (markdown) => {
      console.log("Markdownが変更されました:", markdown);
    },
  });
</script>
```

## 機能

- **モダンなデザイン**: Reactアプリケーションにシームレスに統合できる、クリーンでモダンなインターフェース
- **Markdownモード**: WYSIWYGモードと生のMarkdown編集モードを切り替え可能（`disableRawMode: false`で有効化）
- **ハイライト機能**: テキストを`<mark>`タグでハイライト（`disableHighlight: false`で有効化）
- **画像アップロード対応**: `onImageChange` コールバックを指定すると、ファイル選択やドラッグ＆ドロップで画像をアップロード可能
- **コードブロックの言語指定**: 言語ラベルをクリックして任意の言語名を入力可能
- **使いやすいインターフェース**:
  - シンプルなツールバー（トグルボタンでクリックして書式を適用/解除）
  - Markdownショートカット（例: `**` で**太字**、`#` で見出し）
  - キーボードショートカット（例: `Ctrl/Cmd + B` で太字）
  - 日本語ローカライズされたUI（ツールバーとメニュー項目が日本語表示）
- **リンク編集の強化**:
  - リンクダイアログでリンクテキストとツールチップを直接編集可能
  - 挿入ダイアログと編集ダイアログの両方でテキストとツールチップフィールドをサポート
- **リスト機能の強化**:
  - ネストされたリストをサポート（複数レベルの階層リストを作成可能）
  - 階層内で異なるリストタイプを混在可能
- **テーブル編集の強化**:
  - テーブルセル内で `Enter` キーを押すと改行（ソフトブレーク）を挿入
  - `Shift+Enter` で次のセルに移動
  - 最後のセルで `Tab` を押すとテーブルを抜けて新しい段落を作成
- **スマートブロック分割**: 複数行のブロックに見出し/段落スタイルを適用する際、選択された行のみが変換される
- **カーソル位置の保持**: 要素タイプの変換後（例: 段落から見出しへ）もカーソル位置が維持される

## ブラウザサポート

- Google Chrome
- Apple Safari
- Microsoft Edge
- Firefox

## 必要要件

- React >= 17.x
- React DOM >= 17.x

## 開発

### Lint

TypeScript/TSX ソースの ESLint 実行コマンド:

```bash
npm run lint
```

## ライセンス

MIT
