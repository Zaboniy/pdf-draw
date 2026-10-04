# Data Model: Chrome Extension Port

**Feature**: 004-chrome-extension-port | **Date**: 2026-08-05

## Overview

All data is held in-memory for the duration of the extension tab session. There is no persistence to disk, browser storage (localStorage/IndexedDB), or any external service. When the extension tab is closed, all data is discarded silently (per clarification).

---

## Entity: PDFDocument

Represents the loaded PDF file being annotated.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `source` | `'local' \| 'tab'` | How the PDF was loaded | Required |
| `fileName` | `string` | Display name shown in UI | Non-empty; derived from File name or tab URL path segment |
| `totalPages` | `number` | Total page count | ≥ 1 |
| `pdfJsDocument` | `PDFDocumentProxy` | pdfjs-dist loaded document object | Not null after successful load |
| `pdfLibDocument` | `PDFDocument` | pdf-lib document for export | Loaded lazily at download time |
| `tabUrl` | `string \| null` | Source URL if loaded from a browser tab | Null for local uploads |

**State transitions**:
```
idle → loading → loaded
            ↓
          error (load failure: password-protected, CORS, unsupported)
```

---

## Entity: Page

Represents a single rendered page within the loaded PDF.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `index` | `number` | 1-based page number | 1 ≤ index ≤ totalPages |
| `width` | `number` | Rendered width in pixels at current scale | > 0 |
| `height` | `number` | Rendered height in pixels at current scale | > 0 |
| `canvasRef` | `React.RefObject<HTMLCanvasElement>` | Reference to the drawing canvas for this page | Assigned on mount |
| `annotations` | `Annotation[]` | List of annotations on this page | May be empty |

---

## Entity: Annotation

Represents a single user-created mark on a page.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `string` | Unique identifier (UUID or incremental) | Required, unique per session |
| `pageIndex` | `number` | 1-based page number this annotation belongs to | 1 ≤ pageIndex ≤ totalPages |
| `type` | `'drawing' \| 'text' \| 'signature'` | Annotation kind | Required |
| `data` | `DrawingData \| TextData \| SignatureData` | Type-specific content | Required |
| `selected` | `boolean` | Whether currently selected | Default: false |
| `position` | `{ x: number, y: number }` | Top-left corner in page coordinate space | Numbers |
| `dimensions` | `{ width: number, height: number }` | Bounding box | Positive numbers |

### DrawingData

Freehand strokes captured from pointer events.

| Field | Type | Description |
|-------|------|-------------|
| `strokes` | `Stroke[]` | Array of stroke paths |
| `color` | `string` | Stroke color (CSS color string) |
| `lineWidth` | `number` | Stroke width in pixels |

### TextData

Text placed on the page.

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Text content |
| `fontSize` | `number` | Font size in pixels |
| `color` | `string` | Text color (CSS color string) |

### SignatureData

Signature drawn by the user (treated as a drawing subtype).

| Field | Type | Description |
|-------|------|-------------|
| `strokes` | `Stroke[]` | Signature stroke paths |
| `color` | `string` | Stroke color |
| `lineWidth` | `number` | Stroke width |

---

## Entity: ExtensionSession

The top-level in-memory state for the current extension tab session.

| Field | Type | Description |
|-------|------|-------------|
| `document` | `PDFDocument \| null` | Currently loaded document; null if none loaded |
| `currentPage` | `number` | Currently viewed page index (1-based) |
| `clipboard` | `Annotation \| null` | Last copied annotation; null if clipboard empty |
| `loadError` | `string \| null` | Human-readable error message if last load failed |

**Lifecycle**: Created when the extension tab opens. Destroyed when the tab is closed. No serialization.

---

## Entity: TabPDFHint (service worker ephemeral)

Stored in `chrome.storage.session` by the service worker; consumed once by the extension tab on mount.

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | URL of the PDF in the detected browser tab |
| `pdfBytes` | `Uint8Array \| null` | Pre-fetched PDF bytes (null if fetch deferred to tab) |
| `timestamp` | `number` | Unix ms timestamp of when the hint was stored |

**Validation**: Tab reads and clears this entry on mount. If `timestamp` is older than 30 seconds, discard as stale.

---

## State Transitions: Annotation Lifecycle

```
[none]
  → create (user draws/types/signs)
      → selected (user clicks annotation)
          → moved (user drags)
          → deleted (user presses delete)
          → copied → clipboard
      → deselected (user clicks elsewhere)
  → paste (from clipboard) → creates duplicate with new id
```
