# Quickstart: PDF Viewer Implementation

**Date**: 2026-04-07 | **Phase**: 1 (Design)

This guide walks through implementing the PDF viewer feature from scratch.

---

## Prerequisites

- Node.js 16+ (for npm)
- React 18+ project set up (or create via `create-react-app`)
- Basic React knowledge (hooks, props, state)
- Tailwind CSS configured (or install in project)

---

## Step 1: Project Setup

### 1.1 Initialize React Project (if not already done)

```bash
npx create-react-app pdf-sign
cd pdf-sign
npm install
```

### 1.2 Install Dependencies

```bash
npm install react-pdf pdfjs-dist
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Why**:
- `react-pdf`: React wrapper for PDF.js; handles rendering and page navigation
- `pdfjs-dist`: Peer dependency; provides the PDF parsing engine
- `tailwindcss`: Utility-first CSS framework (per constitution)

### 1.3 Configure Tailwind CSS

Edit `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4 Check folder structure

```
src/
├── components/        (create this)
├── hooks/            (create this)
├── pages/            (create this)
├── App.jsx
└── index.js
```

---

## Step 2: Create Custom Hook (usePDFViewer)

**File**: `src/hooks/usePDFViewer.js`

**Purpose**: Encapsulate PDF state and action logic.

```javascript
import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker (required by pdf.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function usePDFViewer() {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [viewerState, setViewerState] = useState({
    currentPage: 1,
    zoomLevel: 1.0,
    isLoading: false,
    error: null,
    rotation: 0,
  });

  const selectFile = async (file) => {
    if (!file) return;

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setViewerState((prev) => ({
        ...prev,
        error: `File is too large (max 50MB). Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      }));
      return;
    }

    // Set loading state
    setViewerState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Parse PDF
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      // Update state on success
      setPdfDocument({
        file: file,
        numPages: pdf.numPages,
        fileName: file.name,
        loadedAt: new Date().toISOString(),
      });

      // Reset viewer state to defaults
      setViewerState({
        currentPage: 1,
        zoomLevel: 1.0,
        isLoading: false,
        error: null,
        rotation: 0,
      });
    } catch (err) {
      // Handle error
      const errorMsg = 'Failed to load PDF. Is it a valid PDF file?';
      setPdfDocument({ error: errorMsg });
      setViewerState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
      console.error('PDF parse error:', err);
    }
  };

  const goNextPage = () => {
    if (!pdfDocument || pdfDocument.error) return;
    setViewerState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, pdfDocument.numPages),
    }));
  };

  const goPreviousPage = () => {
    setViewerState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  const goToPage = (page) => {
    if (!pdfDocument || pdfDocument.error) return;
    const validPage = Math.max(1, Math.min(page, pdfDocument.numPages));
    setViewerState((prev) => ({ ...prev, currentPage: validPage }));
  };

  const zoomIn = () => {
    setViewerState((prev) => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 0.25, 3.0),
    }));
  };

  const zoomOut = () => {
    setViewerState((prev) => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 0.25, 0.5),
    }));
  };

  const fitToWidth = () => {
    // Note: Actual viewport width calculation requires ref to PDFCanvas
    // For now, this is a placeholder; full implementation in Phase 2
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  const fitToHeight = () => {
    // Placeholder
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  const resetZoom = () => {
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  const clearFile = () => {
    setPdfDocument(null);
    setViewerState({
      currentPage: 1,
      zoomLevel: 1.0,
      isLoading: false,
      error: null,
      rotation: 0,
    });
  };

  return {
    pdfDocument,
    viewerState,
    actions: {
      selectFile,
      goNextPage,
      goPreviousPage,
      goToPage,
      zoomIn,
      zoomOut,
      fitToWidth,
      fitToHeight,
      resetZoom,
      clearFile,
    },
  };
}
```

---

## Step 3: Create Components

### 3.1 PDFFileInput Component

**File**: `src/components/PDFFileInput.jsx`

```javascript
import React, { useRef } from 'react';

export function PDFFileInput({ onSelect, isLoading, error }) {
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Open PDF'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
```

### 3.2 PDFCanvas Component

**File**: `src/components/PDFCanvas.jsx`

```javascript
import React from 'react';
import { Document, Page } from 'react-pdf';

export function PDFCanvas({ pdfDocument, currentPage, zoomLevel }) {
  if (!pdfDocument || pdfDocument.error) return null;

  return (
    <div className="flex justify-center p-4 bg-white">
      <Document file={pdfDocument.file}>
        <Page pageNumber={currentPage} scale={zoomLevel} />
      </Document>
    </div>
  );
}
```

### 3.3 PDFPageNav Component

**File**: `src/components/PDFPageNav.jsx`

```javascript
import React from 'react';

export function PDFPageNav({ currentPage, numPages, onPrev, onNext }) {
  return (
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
  );
}
```

### 3.4 PDFZoomControls Component

**File**: `src/components/PDFZoomControls.jsx`

```javascript
import React from 'react';

export function PDFZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitHeight,
  onReset,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onZoomOut}
        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
      >
        −
      </button>

      <span className="w-12 text-center text-sm font-medium">
        {Math.round(zoomLevel * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
      >
        +
      </button>

      <button
        onClick={onFitWidth}
        className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        Fit Width
      </button>

      <button
        onClick={onFitHeight}
        className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        Fit Height
      </button>

      <button
        onClick={onReset}
        className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        Reset
      </button>
    </div>
  );
}
```

### 3.5 PDFViewer Component (Parent)

**File**: `src/components/PDFViewer.jsx`

```javascript
import React, { useEffect } from 'react';
import { usePDFViewer } from '../hooks/usePDFViewer';
import { PDFFileInput } from './PDFFileInput';
import { PDFCanvas } from './PDFCanvas';
import { PDFPageNav } from './PDFPageNav';
import { PDFZoomControls } from './PDFZoomControls';

export function PDFViewer() {
  const { pdfDocument, viewerState, actions } = usePDFViewer();

  // Keyboard support: Arrow keys for page navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!pdfDocument || pdfDocument.error) return;

      if (e.key === 'ArrowRight') {
        actions.goNextPage();
      } else if (e.key === 'ArrowLeft') {
        actions.goPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pdfDocument, actions]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <PDFFileInput
          onSelect={actions.selectFile}
          isLoading={viewerState.isLoading}
          error={viewerState.error}
        />
      </header>

      {pdfDocument && !pdfDocument.error ? (
        <>
          <div className="flex-1 overflow-auto bg-gray-100">
            <PDFCanvas
              pdfDocument={pdfDocument}
              currentPage={viewerState.currentPage}
              zoomLevel={viewerState.zoomLevel}
            />
          </div>
          <footer className="bg-white border-t p-4 flex justify-between items-center">
            <PDFPageNav
              currentPage={viewerState.currentPage}
              numPages={pdfDocument.numPages}
              onPrev={actions.goPreviousPage}
              onNext={actions.goNextPage}
            />
            <PDFZoomControls
              zoomLevel={viewerState.zoomLevel}
              onZoomIn={actions.zoomIn}
              onZoomOut={actions.zoomOut}
              onFitWidth={actions.fitToWidth}
              onFitHeight={actions.fitToHeight}
              onReset={actions.resetZoom}
            />
          </footer>
        </>
      ) : pdfDocument?.error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 text-lg font-semibold">{pdfDocument.error}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-lg">No PDF loaded. Select a file to view.</div>
        </div>
      )}
    </div>
  );
}
```

### 3.6 Use PDFViewer in App

**File**: `src/App.jsx`

```javascript
import React from 'react';
import { PDFViewer } from './components/PDFViewer';
import './App.css';

export default function App() {
  return <PDFViewer />;
}
```

---

## Step 4: Test the Implementation

### 4.1 Run the app

```bash
npm start
```

The app opens at `http://localhost:3000`. You should see:
- "Open PDF" button at the top
- Empty state message below

### 4.2 Manual testing

1. Click "Open PDF" button
2. Select a PDF file from your computer
3. PDF should render
4. Test page navigation:
   - Click "Previous" and "Next" buttons
   - Try pressing arrow keys (← →)
5. Test zoom controls:
   - Click zoom in/out buttons
   - Check zoom percentage updates

---

## Step 5: Keyboard Shortcuts (Optional)

To add Ctrl+Home / Ctrl+End (go to first/last page), update the keyboard handler in PDFViewer:

```javascript
const handleKeyPress = (e) => {
  if (!pdfDocument || pdfDocument.error) return;

  if (e.key === 'ArrowRight') {
    actions.goNextPage();
  } else if (e.key === 'ArrowLeft') {
    actions.goPreviousPage();
  } else if (e.ctrlKey && e.key === 'Home') {
    actions.goToPage(1);
  } else if (e.ctrlKey && e.key === 'End') {
    actions.goToPage(pdfDocument.numPages);
  }
};
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| PDF renders blank | Ensure `pdfjs-dist` is installed; check worker URL is correct |
| File size error | Increase `maxSize` in `usePDFViewer` if > 50MB files needed |
| Zoom buttons do nothing | Check `zoomLevel` state is being updated; verify PDFCanvas receives `scale={zoomLevel}` |
| Keyboard nav doesn't work | Ensure `addEventListener` is set up in `useEffect` with proper dependencies |
| Tailwind styles not applied | Check `tailwind.config.js` has correct content paths and `@tailwind` directives in CSS |

---

## Next Steps

After completing this implementation, you're ready for:

1. **Testing** (Phase 2): Create test cases for all interactions (if tests are added to constitution later)
2. **Signing feature** (Next feature): Build on top of this viewer to add signature placement and PDF signing
3. **Polish** (Phase 3): Add drag-drop file upload, thumbnails panel, search functionality

---

**Implementation Guide Complete** ✅

All components are ready to implement. Begin with Step 1 (Setup), then create the hook (Step 2), then all components in order (Step 3-5).
