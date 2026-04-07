# Data Model: PDF Viewer

**Date**: 2026-04-07 | **Phase**: 1 (Design)

## Core Entities

### PDFDocument

Represents a loaded PDF file and its metadata.

**Fields**:

| Field | Type | Description | Validation |
|-------|------|-------------|-----------|
| `file` | Blob \| ArrayBuffer | Raw file data | Not null; size ≤ 50MB |
| `numPages` | number | Total page count | > 0; integer |
| `fileName` | string | Original file name | Not null; max 255 chars |
| `loadedAt` | timestamp (ISO 8601) | When file was loaded | Auto-set on load |

**State Lifecycle**:

```
null (no file) 
  → loading (file selected, parsing) 
  → loaded (pages accessible) 
  → error (failed to parse)
```

**When empty** (no file): `null`  
**When error**: `{ error: "string message" }`

---

### ViewerState

Tracks user interactions and display settings for a loaded PDF.

**Fields**:

| Field | Type | Description | Default | Validation |
|-------|------|-------------|---------|-----------|
| `currentPage` | number | Active page (1-indexed) | 1 | 1 ≤ currentPage ≤ numPages |
| `zoomLevel` | number | Scale factor (as decimal) | 1.0 | 0.5 ≤ zoomLevel ≤ 3.0; step 0.25 |
| `isLoading` | boolean | PDF is parsing | false | N/A |
| `error` | string \| null | Error message if load failed | null | Max 500 chars |
| `rotation` | number | Page rotation in degrees | 0 | 0, 90, 180, 270 (future feature) |

**State relationships**:

```
- PDFDocument.numPages determines max for ViewerState.currentPage
- If PDFDocument is null, ViewerState should reset to defaults
- If PDFDocument.error exists, ViewerState.error inherits it
```

---

### UserInteraction Events

Track user actions that modify ViewerState.

**Page Navigation**:

| Event | Trigger | Effect on ViewerState |
|-------|---------|----------------------|
| `goNextPage()` | Click "Next" button OR `ArrowRight` key | Increment `currentPage` (if < numPages) |
| `goPreviousPage()` | Click "Previous" button OR `ArrowLeft` key | Decrement `currentPage` (if > 1) |
| `goToPage(n)` | Click page jump input (future) OR programmatic | Set `currentPage = n` (validate 1 ≤ n ≤ numPages) |
| `goFirstPage()` | Ctrl+Home (future) | Set `currentPage = 1` |
| `goLastPage()` | Ctrl+End (future) | Set `currentPage = numPages` |

**Zoom Operations**:

| Event | Trigger | Effect on ViewerState |
|-------|---------|----------------------|
| `zoomIn()` | Click "+" button OR Ctrl/Cmd+"+" key | Increment `zoomLevel` by 0.25 (max 3.0) |
| `zoomOut()` | Click "−" button OR Ctrl/Cmd+"−" key | Decrement `zoomLevel` by 0.25 (min 0.5) |
| `fitToWidth()` | Click "Fit Width" button | Compute `zoomLevel` = viewport width / PDF page width |
| `fitToHeight()` | Click "Fit Height" button | Compute `zoomLevel` = viewport height / PDF page height |
| `resetZoom()` | Click "Reset" button | Set `zoomLevel = 1.0` |

**File Operations**:

| Event | Trigger | Effect |
|-------|---------|--------|
| `onFileSelected(file)` | User selects file via input OR drag-drop | Load file: set PDFDocument, parse, set ViewerState.isLoading = true |
| `onFileLoaded(numPages)` | PDF.js finishes parsing | Set PDFDocument.numPages, reset ViewerState to defaults (currentPage=1, zoomLevel=1.0) |
| `onFileError(error)` | PDF parsing fails | Set PDFDocument.error and ViewerState.error |
| `clearFile()` | User clicks "Clear" or resets | Set PDFDocument = null, ViewerState to defaults |

---

## State Structure (React Hook Implementation)

### usePDFViewer Hook

Custom hook that encapsulates PDF state logic.

```javascript
const { pdfDocument, viewerState, actions } = usePDFViewer();

// pdfDocument: { file, numPages, fileName, loadedAt } | null | { error }
// viewerState: { currentPage, zoomLevel, isLoading, error, rotation }
// actions: {
//   selectFile(file),
//   goNextPage(),
//   goPreviousPage(),
//   goToPage(n),
//   zoomIn(),
//   zoomOut(),
//   fitToWidth(),
//   fitToHeight(),
//   resetZoom(),
//   clearFile()
// }
```

**Key behaviors**:

- **File selection**: Validate size (≤ 50MB), set `isLoading = true`, attempt parse, update `numPages` and `error` state
- **Page boundary checks**: `goNextPage()` is no-op if `currentPage === numPages`; `goPreviousPage()` is no-op if `currentPage === 1`
- **Zoom bounds**: `zoomIn()` clamps to max 3.0; `zoomOut()` clamps to min 0.5
- **Error handling**: All operations catch exceptions, set error state, do not crash
- **Reset on new file**: When new file loaded, reset `currentPage` to 1 and `zoomLevel` to 1.0

---

## Component Data Flow

**PDFViewer (parent)**:
- Manages `pdfDocument` and `viewerState` state
- Passes actions to child components via props
- Conditionally renders: empty state → loading → pdf display → error

**PDFFileInput**:
- Renders file input button
- Calls `actions.selectFile(file)` on user selection
- Receives `isLoading` and `error` props for UI feedback

**PDFCanvas**:
- Receives `pdfDocument`, `viewerState.currentPage`, `viewerState.zoomLevel`
- Renders page via react-pdf `<Page>` component
- Displays error fallback if `pdfDocument.error` exists

**PDFPageNav**:
- Receives `currentPage`, `numPages`
- Displays page counter: "Page N of M"
- Provides "Previous" and "Next" buttons
- Buttons disabled at boundaries (computed: `previousDisabled = currentPage === 1`, etc.)
- Calls `actions.goPreviousPage()` and `actions.goNextPage()`

**PDFZoomControls**:
- Receives `zoomLevel` prop
- Displays zoom buttons (in, out, fit-width, fit-height, reset)
- Displays current zoom % as text
- Calls appropriate zoom action

---

## Validation Rules

| Rule | Enforced At | Error Handling |
|------|------------|-----------------|
| File size ≤ 50MB | Before parse (onFileSelected) | Show error message, don't attempt parse |
| File is valid PDF | During parse | Catch parse error, set error state |
| currentPage in [1, numPages] | Before state update | Silently clamp or reject action |
| zoomLevel in [0.5, 3.0] | After action (zoom in/out) | Clamp value to range |
| numPages ≥ 1 | After PDF parse | If 0, treat as error (corrupted PDF) |

---

## Future Extensions (Out of Scope for MVP)

- **Annotations**: Add `annotations` array to PDFDocument (shapes, text, ink)
- **Rotation**: Use `rotation` field to support page rotation
- **Persistence**: Store `pdfDocument` in IndexedDB or localStorage (user sessions)
- **Search**: Full-text search across PDF pages
- **Thumbnails**: Side panel with page thumbnails
- **Print**: Export to printer or PDF
- **Touch gestures**: Pinch-zoom, swipe navigation (mobile)

---

## Testing Considerations (Out of Scope for MVP)

When tests are added (post-MVP), validate:

- File upload triggers correct state transitions
- Page navigation respects boundaries
- Zoom level stays within [0.5, 3.0] range
- Error conditions (corrupted PDF, oversized file) show user messages without crashing
- Keyboard shortcuts (ArrowLeft, ArrowRight) invoke correct actions
- All computed properties (button disabled states, error messages) are consistent with underlying state

---

**Design Phase Summary**: All entities, state, and interactions defined. Ready for Phase 2 (component contracts).
