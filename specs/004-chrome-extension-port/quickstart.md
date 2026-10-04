# Quickstart: Chrome Extension Port

**Feature**: 004-chrome-extension-port | **Date**: 2026-08-05

## Prerequisites

- Node.js ≥ 18
- Chrome browser (latest stable)
- Existing project dependencies installed (`npm install`)

---

## Step 1: Install New Dev Dependency

```bash
npm install --save-dev vite-plugin-web-extension
```

---

## Step 2: Create Extension Icons

Place three PNG icons in the `public/` directory:
- `public/icon16.png` (16×16 px)
- `public/icon48.png` (48×48 px)
- `public/icon128.png` (128×128 px)

These can be generated from any base image using an image editor or online tool.

---

## Step 3: Create `manifest.json`

Create `manifest.json` at the project root (see `contracts/manifest-schema.md` for the full schema).

---

## Step 4: Update `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    react(),
    webExtension({ manifest: './manifest.json' }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

> The `server.port` / `server.open` config is still useful for local dev without the extension wrapper.

---

## Step 5: Create `src/background.js`

Service worker that opens the extension tab and passes PDF hints. See `contracts/manifest-schema.md` for the behavioral contract.

---

## Step 6: Create `src/utils/pdfExport.js`

PDF export utility: captures each page's drawing canvas as PNG, embeds into pdf-lib document, triggers browser download. Called from the Download button.

---

## Step 7: Update `src/App.jsx`

Add logic to read `chrome.storage.session` on mount (wrapped in a guard so the app still works as a plain web page during local development):

```js
const isExtension = typeof chrome !== 'undefined' && chrome.storage;
if (isExtension) {
  chrome.storage.session.get('tabPDFHint', (result) => {
    if (result.tabPDFHint) {
      // Load PDF from hint
      chrome.storage.session.remove('tabPDFHint');
    }
  });
}
```

---

## Step 8: Build the Extension

```bash
npm run build
```

Output goes to `dist/`.

---

## Step 9: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` directory
5. The "PDF Sign" extension icon appears in the toolbar

---

## Step 10: Verify

1. Click the extension icon → a new tab opens with the PDF Sign UI
2. Upload a local PDF → annotate → click Download → verify annotations are in the saved file
3. Open a PDF URL in another tab → click the extension icon → verify the PDF loads pre-populated

---

## Local Development (without extension)

The app still works as a plain web app for component development:

```bash
npm run dev
```

The `chrome.storage` call in `App.jsx` is guarded, so it silently skips tab-import on non-extension context.
