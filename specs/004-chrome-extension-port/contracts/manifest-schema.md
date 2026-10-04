# Contract: Chrome Extension Manifest V3

**Feature**: 004-chrome-extension-port | **Date**: 2026-08-05

The `manifest.json` file is the binding contract between the extension and the Chrome browser. It declares what the extension is, what it can access, and how it behaves. Changes to this file require Chrome to re-review permissions on install/update.

---

## Manifest Structure

```json
{
  "manifest_version": 3,
  "name": "PDF Sign",
  "version": "1.0.0",
  "description": "Annotate and sign PDF files directly in your browser",

  "action": {
    "default_title": "Open PDF Sign"
  },

  "background": {
    "service_worker": "background.js",
    "type": "module"
  },

  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },

  "permissions": [
    "activeTab",
    "tabs",
    "storage"
  ],

  "host_permissions": [
    "<all_urls>"
  ]
}
```

---

## Permission Rationale

| Permission | Why Required | Scope |
|------------|-------------|-------|
| `activeTab` | Read the URL of the currently focused tab to detect if it contains a PDF | Only the tab that was active when the icon was clicked |
| `tabs` | Create a new tab (`chrome.tabs.create`) to open the extension UI | Create only; no tab enumeration |
| `storage` | Use `chrome.storage.session` to pass detected PDF URL/bytes from service worker to extension tab | Session-scoped only; cleared on browser restart |
| `<all_urls>` (host permission) | Allow the service worker to `fetch()` PDF files from any URL without CORS restriction | Fetch only; no content injection or modification |

---

## Service Worker Contract

The background service worker (`background.js`) exposes the following behavior:

### Event: `chrome.action.onClicked`

Triggered when the user clicks the extension toolbar icon.

**Behavior**:
1. Query the active tab in the current window
2. Check if `tab.url` indicates a PDF (ends with `.pdf`, case-insensitive, or matches Chrome's built-in PDF viewer URL pattern)
3. If PDF detected:
   - Attempt to fetch PDF bytes from `tab.url`
   - Store result in `chrome.storage.session` under key `"tabPDFHint"`
   - Open `chrome.runtime.getURL('index.html')` in a new tab
4. If no PDF detected:
   - Clear any existing `"tabPDFHint"` from session storage
   - Open `chrome.runtime.getURL('index.html')` in a new tab (app shows file upload prompt)

### Storage Key: `tabPDFHint`

Schema (stored in `chrome.storage.session`):

```json
{
  "url": "https://example.com/document.pdf",
  "pdfBytes": null,
  "timestamp": 1754391600000
}
```

- `pdfBytes`: `null` if fetch failed or deferred; the extension tab will retry fetch from `url`
- `timestamp`: Used by the tab to discard stale hints (>30 seconds old)
- Key is cleared by the extension tab after reading

---

## Extension Tab Contract

The main `index.html` / React app, when loaded as an extension tab:

1. On mount, reads `chrome.storage.session.get('tabPDFHint')`
2. If hint exists and is not stale: loads the PDF bytes (or fetches from URL if bytes are null)
3. Clears `tabPDFHint` from session storage immediately after reading
4. If no hint or stale: shows the standard local file upload prompt
