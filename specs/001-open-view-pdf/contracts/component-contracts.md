# Component Contracts: PDF Viewer

**Date**: 2026-04-07 | **Phase**: 1 (Design)

Component contracts define props (inputs), rendered output, and behavior for each React component in the PDF viewer.

---

## 1. PDFViewer (Parent Component)

**Location**: `src/components/PDFViewer.jsx`

**Purpose**: Main container; manages PDF document and viewer state; coordinates child components.

**State**:
```javascript
const [pdfDocument, setPdfDocument] = useState(null);     // { file, numPages, fileName, loadedAt } | null | { error }
const [viewerState, setViewerState] = useState({...});    // { currentPage, zoomLevel, isLoading, error, rotation }
```

**Props**: None (root component)

**Children Rendered**:
1. PDFFileInput (always)
2. PDFCanvas (if pdfDocument is loaded)
3. PDFPageNav (if pdfDocument is loaded)
4. PDFZoomControls (if pdfDocument is loaded)
5. Error message (if pdfDocument.error or viewerState.error)

**Actions Passed to Children**:
```javascript
{
  selectFile: (file: File) => void,          // Load new PDF
  goNextPage: () => void,                     // Advance page
  goPreviousPage: () => void,                 // Go back page
  zoomIn: () => void,                         // Increase zoom
  zoomOut: () => void,                        // Decrease zoom
  fitToWidth: () => void,                     // Fit PDF width to viewport
  fitToHeight: () => void,                    // Fit PDF height to viewport
  resetZoom: () => void,                      // Return to 100% zoom
  clearFile: () => void                       // Reset to empty state
}
```

**Example Render**:
```jsx
<div className="flex flex-col h-screen bg-gray-50">
  <header className="bg-white border-b p-4">
    <PDFFileInput isLoading={viewerState.isLoading} error={viewerState.error} onSelect={actions.selectFile} />
  </header>
  
  {pdfDocument && !pdfDocument.error ? (
    <>
      <div className="flex-1 overflow-auto">
        <PDFCanvas pdfDocument={pdfDocument} currentPage={viewerState.currentPage} zoomLevel={viewerState.zoomLevel} />
      </div>
      <footer className="bg-white border-t p-4 flex justify-between">
        <PDFPageNav currentPage={viewerState.currentPage} numPages={pdfDocument.numPages} onNext={actions.goNextPage} onPrev={actions.goPreviousPage} />
        <PDFZoomControls zoomLevel={viewerState.zoomLevel} onZoomIn={actions.zoomIn} onZoomOut={actions.zoomOut} onFitWidth={actions.fitToWidth} onFitHeight={actions.fitToHeight} onReset={actions.resetZoom} />
      </footer>
    </>
  ) : pdfDocument?.error ? (
    <div className="flex items-center justify-center h-full text-red-600 text-lg">{pdfDocument.error}</div>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400">No PDF loaded. Select a file to view.</div>
  )}
</div>
```

---

## 2. PDFFileInput

**Location**: `src/components/PDFFileInput.jsx`

**Purpose**: File upload input; accepts file selection via button click or drag-drop.

**Props**:

```javascript
{
  onSelect: (file: File) => void,      // Callback when file selected
  isLoading: boolean,                  // Show loading state (optional)
  error: string | null                 // Error message (optional)
}
```

**Rendered Output**:
- Input button with file picker
- Optional: drag-drop zone
- Loading spinner when `isLoading = true`
- Error message if `error` is set

**Behavior**:
- Click button → file picker appears
- Select PDF file → `onSelect(file)` called with File object
- Drag PDF over component → visual feedback (highlight)
- Drop file → `onSelect(file)` called

**Contract Example**:

```jsx
<PDFFileInput
  onSelect={(file) => actions.selectFile(file)}
  isLoading={viewerState.isLoading}
  error={viewerState.error}
/>
```

**Rendered HTML**:
```html
<div className="flex flex-col gap-2">
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    {isLoading ? "Loading..." : "Open PDF"}
  </button>
  <input type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
  {error && <p className="text-red-600 text-sm">{error}</p>}
</div>
```

---

## 3. PDFCanvas

**Location**: `src/components/PDFCanvas.jsx`

**Purpose**: Render a single PDF page using react-pdf `<Page>` component.

**Props**:

```javascript
{
  pdfDocument: { file: Blob, numPages: number, fileName: string },
  currentPage: number,                 // Page to display (1-indexed)
  zoomLevel: number                    // Scale factor (e.g., 1.0 = 100%)
}
```

**Rendered Output**:
- PDF page rendered at specified page number and zoom level
- Text selectable (if pdf.js supports it)

**Behavior**:
- Use react-pdf `<Document>` and `<Page>` components
- Set `scale={zoomLevel}` on `<Page>`
- Handle loading and error states internally
- Display spinner while page is rendering

**Contract Example**:

```jsx
<PDFCanvas
  pdfDocument={pdfDocument}
  currentPage={viewerState.currentPage}
  zoomLevel={viewerState.zoomLevel}
/>
```

**Rendered JSX**:
```jsx
<div className="flex justify-center items-center p-4">
  <Document file={pdfDocument.file}>
    <Page pageNumber={currentPage} scale={zoomLevel} />
  </Document>
</div>
```

---

## 4. PDFPageNav

**Location**: `src/components/PDFPageNav.jsx`

**Purpose**: Navigation controls; displays page counter and prev/next buttons.

**Props**:

```javascript
{
  currentPage: number,                 // Current page (1-indexed)
  numPages: number,                    // Total page count
  onNext: () => void,                  // Callback for next page button
  onPrev: () => void                   // Callback for previous page button
}
```

**Rendered Output**:
- "Previous" button (disabled if `currentPage === 1`)
- Page display: "Page N of M"
- "Next" button (disabled if `currentPage === numPages`)

**Behavior**:
- Click "Previous" → `onPrev()` called
- Click "Next" → `onNext()` called
- Buttons disabled at boundaries
- Keyboard support: ArrowLeft/ArrowRight keys trigger callbacks (handled in parent via useEffect)

**Contract Example**:

```jsx
<PDFPageNav
  currentPage={viewerState.currentPage}
  numPages={pdfDocument.numPages}
  onPrev={actions.goPreviousPage}
  onNext={actions.goNextPage}
/>
```

**Rendered HTML**:
```html
<div className="flex items-center gap-4">
  <button
    onClick={onPrev}
    disabled={currentPage === 1}
    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
  >
    Previous
  </button>
  
  <span className="text-gray-700 font-medium">
    Page {currentPage} of {numPages}
  </span>
  
  <button
    onClick={onNext}
    disabled={currentPage === numPages}
    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
  >
    Next
  </button>
</div>
```

---

## 5. PDFZoomControls

**Location**: `src/components/PDFZoomControls.jsx`

**Purpose**: Zoom controls; in, out, fit-to-width, fit-to-height, reset buttons.

**Props**:

```javascript
{
  zoomLevel: number,                   // Current zoom (e.g., 1.0 = 100%)
  onZoomIn: () => void,                // Callback for zoom in
  onZoomOut: () => void,               // Callback for zoom out
  onFitWidth: () => void,              // Callback for fit to width
  onFitHeight: () => void,             // Callback for fit to height
  onReset: () => void                  // Callback for reset to 100%
}
```

**Rendered Output**:
- "Zoom Out" button
- Zoom level display: "100%"
- "Zoom In" button
- "Fit Width" button
- "Fit Height" button
- "Reset" button

**Behavior**:
- Click buttons → corresponding callbacks invoked
- Zoom level display updates in real-time
- No button disabling at zoom bounds (user can keep clicking, logic clamps in action handler)

**Contract Example**:

```jsx
<PDFZoomControls
  zoomLevel={viewerState.zoomLevel}
  onZoomIn={actions.zoomIn}
  onZoomOut={actions.zoomOut}
  onFitWidth={actions.fitToWidth}
  onFitHeight={actions.fitToHeight}
  onReset={actions.resetZoom}
/>
```

**Rendered HTML**:
```html
<div className="flex items-center gap-2">
  <button onClick={onZoomOut} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">−</button>
  
  <span className="w-12 text-center text-sm font-medium">
    {Math.round(zoomLevel * 100)}%
  </span>
  
  <button onClick={onZoomIn} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">+</button>
  
  <button onClick={onFitWidth} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">
    Fit Width
  </button>
  
  <button onClick={onFitHeight} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">
    Fit Height
  </button>
  
  <button onClick={onReset} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">
    Reset
  </button>
</div>
```

---

## 6. usePDFViewer (Custom Hook)

**Location**: `src/hooks/usePDFViewer.js`

**Purpose**: Encapsulates PDF state logic and action handlers.

**Contract**:

```javascript
const { pdfDocument, viewerState, actions } = usePDFViewer();

// Return shape:
{
  pdfDocument: {
    file: Blob,
    numPages: number,
    fileName: string,
    loadedAt: string (ISO 8601)
  } | null | { error: string },
  
  viewerState: {
    currentPage: number,           // 1-indexed
    zoomLevel: number,             // 0.5 to 3.0
    isLoading: boolean,
    error: string | null,
    rotation: number               // 0, 90, 180, 270 (future)
  },
  
  actions: {
    selectFile(file: File) => Promise<void>,
    goNextPage() => void,
    goPreviousPage() => void,
    goToPage(page: number) => void,
    zoomIn() => void,
    zoomOut() => void,
    fitToWidth() => void,
    fitToHeight() => void,
    resetZoom() => void,
    clearFile() => void
  }
}
```

**Behavior**:

- `selectFile(file)`: Validates file size (≤ 50MB), reads as ArrayBuffer, parses with PDF.js, sets `numPages`, resets viewer state to defaults, catches errors
- `goNextPage()`: Increments `currentPage` if < `numPages`; no-op otherwise
- `goPreviousPage()`: Decrements `currentPage` if > 1; no-op otherwise
- `goToPage(n)`: Sets `currentPage` to n (validates 1 ≤ n ≤ `numPages`); silently clamps if out of range
- `zoomIn()`: Increments `zoomLevel` by 0.25; clamps to max 3.0
- `zoomOut()`: Decrements `zoomLevel` by 0.25; clamps to min 0.5
- `fitToWidth()` / `fitToHeight()`: Calculate zoom needed to fit page to viewport; implementation deferred pending actual component measurement API
- `resetZoom()`: Sets `zoomLevel` to 1.0
- `clearFile()`: Resets to initial state (`pdfDocument = null`, `viewerState = defaults`)

---

## Event Flow Diagram

```
User Action
    ↓
Child Component (e.g., PDFPageNav)
    ↓
Call action callback (e.g., actions.goNextPage())
    ↓
usePDFViewer hook updates state
    ↓
PDFViewer component re-renders
    ↓
Child components receive updated props
    ↓
UI reflects new state (e.g., different page displayed)
```

**Example: User clicks "Next" button**

```
PDFPageNav <Next> button clicked
    ↓
onNext() callback invoked
    ↓
actions.goNextPage() called
    ↓
usePDFViewer updates: currentPage += 1
    ↓
PDFViewer re-renders with new currentPage prop
    ↓
PDFCanvas receives new currentPage, re-renders page N+1
    ↓
PDFPageNav receives new currentPage, "Previous" button becomes enabled
    ↓
User sees next page displayed
```

---

## Accessibility Notes

**Per Constitution Principle III (Accessibility & UX)**:

- All buttons are semantic `<button>` elements (not `<div>` or `<span>`)
- File input is accessible via `<label>` or visible button click
- Keyboard navigation: Arrow keys work for page nav; Tab key cycles through interactive elements
- Focus states: All buttons have visible focus indicator (CSS: `focus:ring-2 focus:ring-blue-500`)
- Error messages: Plain text, not browser alerts
- ARIA labels (optional): `aria-label="Previous page"`, `aria-label="Next page"`, etc.

---

**Design Phase Summary**: All component contracts defined. Ready for implementation (Phase 2 via `/speckit.tasks`).
