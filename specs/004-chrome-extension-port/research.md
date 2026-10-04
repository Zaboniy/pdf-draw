# Research: Chrome Extension Port

**Feature**: 004-chrome-extension-port | **Date**: 2026-08-05

## Decision 1: Vite Build Plugin for Chrome Extension

**Decision**: Use `vite-plugin-web-extension`

**Rationale**: CRXJS (`@crxjs/vite-plugin`) is the most popular option but has had long maintenance gaps and unresolved Manifest V3 issues as of 2025. `vite-plugin-web-extension` is actively maintained, supports Manifest V3 natively, handles multi-entry builds (background service worker + main page) automatically, and requires minimal config changes. For a simple extension with one background script and one full-page tab UI, it requires adding one plugin call to `vite.config.js` and a `manifest.json` file.

**Alternatives considered**:
- `@crxjs/vite-plugin`: Popular but maintenance risk; MV3 issues reported
- Manual Vite rollup config: Works but requires manually specifying all entry points and copying assets — more fragile
- Webpack: Avoid — project already uses Vite; switching would break existing dev workflow

**Key config change**:
```js
// vite.config.js addition
import webExtension from 'vite-plugin-web-extension'
plugins: [react(), webExtension({ manifest: './manifest.json' })]
```

---

## Decision 2: Manifest V3 Structure

**Decision**: Minimal MV3 manifest with `action`, `background` service worker, `activeTab` + `tabs` permissions, and host permissions for `<all_urls>` (for cross-origin PDF fetch)

**Rationale**: Chrome extensions must use Manifest V3 (MV2 is sunset). The extension has no content scripts (per spec: no tab injection). The action has no default popup — instead `chrome.action.onClicked` opens a new full tab. Permissions are scoped to the minimum needed: `activeTab` to read the focused tab's URL, `tabs` to create new tabs, and `<all_urls>` host permission to allow the service worker to fetch PDFs from arbitrary URLs without CORS restriction.

**Alternatives considered**:
- Using a `default_popup` (small popup): Rejected — spec explicitly requires full-tab UI to match existing layout
- Requesting only `activeTab` without `<all_urls>`: Insufficient — service worker fetch from cross-origin PDF URLs requires broader host permissions
- `declarativeNetRequest`: Not needed; no network request modification

---

## Decision 3: Opening Full-Page Tab on Toolbar Click

**Decision**: `chrome.action.onClicked` listener in service worker opens `chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })`

**Rationale**: Setting `"default_popup"` to empty/absent in manifest enables the `onClicked` event. Opening `index.html` as a full browser tab gives the app the same viewport and layout as the standalone web app, satisfying the spec assumption. The existing Vite entry point (`index.html` → `main.jsx`) works unchanged in this context.

**Alternatives considered**:
- Side panel (`chrome.sidePanel`): Narrower viewport would break existing component layout
- Popup: Too small for a PDF annotation tool

---

## Decision 4: Detecting PDF in Active Browser Tab

**Decision**: Check `tab.url` for `.pdf` extension and known PDF serving patterns; pass URL to the extension tab via `chrome.storage.session`

**Rationale**: The simplest reliable detection method is checking whether the active tab's URL ends with `.pdf` (case-insensitive) or contains known PDF viewer URL patterns (e.g., Chrome's built-in PDF viewer wraps URLs). This covers the majority of real-world cases. Checking MIME type via response headers would require a different permission model (`webRequest`) and is over-engineered for this use case.

**Detection logic** (in service worker):
```js
const isPDF = tab.url &&
  (tab.url.toLowerCase().endsWith('.pdf') ||
   tab.url.startsWith('chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai'));
```

**Communication**: After opening the new extension tab, the service worker stores the detected PDF URL in `chrome.storage.session` (ephemeral, cleared on browser restart). The tab's React app reads this on mount via `chrome.storage.session.get`.

**Alternatives considered**:
- `chrome.webRequest` to inspect response headers: Requires additional permission, more complex, overkill
- Content script to detect PDF in tab: Contradicts spec assumption (no tab injection)
- `chrome.runtime.sendMessage` directly to the new tab: Race condition risk (tab may not be ready when message is sent); storage approach is safer

---

## Decision 5: Fetching PDF Bytes from Tab URL

**Decision**: Fetch from the service worker using the standard `fetch()` API; pass `ArrayBuffer` to the extension tab via `chrome.storage.session` (for small/medium PDFs) or a `Blob URL` created in the tab

**Rationale**: Service workers in Chrome extensions are not subject to CORS restrictions when `<all_urls>` host permission is declared. The service worker can `fetch(pdfUrl)` and get the raw bytes. For the tab UI to use those bytes, the simplest approach is: service worker stores the `Uint8Array` in `chrome.storage.session` (limit: ~10MB — sufficient for most PDFs up to ~50 pages), and the tab reads it on mount.

**For PDFs larger than session storage limit**: Fall back to storing only the URL and letting the tab attempt `fetch()` directly (extensions with `<all_urls>` host permissions can also bypass CORS in page context). Show error if fetch fails.

**Alternatives considered**:
- `chrome.runtime.sendMessage` with ArrayBuffer: Message size limits apply; less reliable for large PDFs
- Content script to grab PDF bytes: Contradicts spec (no tab injection)
- `chrome.downloads` API: Downloads the file rather than loading it in-app

---

## Decision 6: Rasterizing Annotations into PDF for Download

**Decision**: Use the existing drawing canvas `toDataURL('image/png')` per page, then embed each PNG as an image layer on the corresponding pdf-lib page at full-page dimensions; save the resulting PDF as a download

**Rationale**: The current app uses HTML Canvas to render annotations. Each page has a `DrawingCanvas` component whose underlying `<canvas>` element holds the annotation pixels. To flatten: capture each canvas as PNG → embed into pdf-lib → draw over the page at exact dimensions. This approach is:
- Consistent with the clarified requirement (flattened, non-editable)
- Compatible with pdf-lib's `embedPng` + `drawImage` API already in the project
- Requires no new dependencies

**Key approach**:
```js
// Per page:
const pngBytes = await fetch(canvas.toDataURL('image/png'))
  .then(r => r.arrayBuffer());
const pngImage = await pdfDoc.embedPng(pngBytes);
page.drawImage(pngImage, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
```

**Alternatives considered**:
- SVG overlay: More complex, requires converting canvas paths to SVG; unnecessary
- pdf-lib annotation objects: Rejected per clarification (structured PDF annotations not required)
- Third-party flattening service: Rejected (fully offline requirement)
