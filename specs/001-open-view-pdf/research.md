# Research: PDF Viewer Library & React Integration

**Date**: 2026-04-07 | **Phase**: 0 (Research)

## Research Questions

1. Which PDF library best suits a React SPA with simple requirements?
2. How do we handle file uploads in React with drag-drop support?
3. What are the performance implications of different zoom/rendering strategies?
4. How do we ensure accessibility in a custom PDF viewer?

---

## Decision: PDF Library — react-pdf

**Decision**: Use `react-pdf` (npm package based on pdf.js)

**Rationale**:
- **React-first API**: Components like `<Document>` and `<Page>` abstract pdf.js complexity
- **Simple setup**: Handles worker registration automatically; no manual configuration
- **Active maintenance**: Well-maintained with React 18 support
- **File size**: ~70KB gzipped (acceptable for MVP)
- **Accessibility**: Built-in canvas rendering supports text selection and search (future enhancement)

**Alternatives considered**:
- **Raw pdf.js**: More control, but requires manual worker setup, state management more complex, steeper React integration learning curve
- **pdfjs-dist**: Same as raw pdf.js, lower-level API
- **Viewer.js**: Overcomplicated for MVP; includes annotation tools and print features we don't need
- **Server-side rendering**: Out of scope (client-side only per MVP constraints)

**Verdict**: ✅ react-pdf chosen—best balance of simplicity, React integration, and features.

---

## Decision: File Upload Strategy

**Decision**: HTML5 `<input type="file">` + optional drag-drop (drag-drop as P2/P3 enhancement)

**Rationale**:
- **Standard web API**: No external dependencies; works across all browsers
- **Progressive enhancement**: File input works without JavaScript; drag-drop enhances UX
- **Security**: Browser sandbox prevents access to filesystem beyond selected file
- **Simplicity**: Aligns with constitution's "Simplicity First" principle

**Implementation**:
1. P1: Single `<input type="file" accept=".pdf" />` button
2. P2/P3: Add `ondrop` and `ondragover` listeners for drag-drop (if time permits)

**Verdict**: ✅ HTML5 file input is the right choice for MVP.

---

## Decision: Zoom Implementation Strategy

**Decision**: Canvas-based zoom (scale transform) with zoom level state

**Rationale**:
- **react-pdf native support**: `scale` prop on `<Page>` component handles zoom rendering
- **Performance**: No re-rendering of PDF content; CSS transform zoom also possible for quick responsiveness
- **Simplicity**: Single state value (zoomLevel: number, e.g., 1.0 = 100%, 1.25 = 125%)
- **Standard behavior**: Users expect incremental zoom (25% steps) and fit-to-width options

**Zoom levels implemented**:
- 50%, 75%, 100% (default), 125%, 150%, 200%
- Fit to width, fit to height
- Reset to 100%

**Verdict**: ✅ Canvas-based zoom with state is optimal.

---

## Decision: Keyboard Navigation

**Decision**: Arrow keys (Left/Right) advance pages; consider Ctrl+Home/End for document bounds

**Rationale**:
- **User expectation**: Arrow keys are standard for document navigation (preview apps, readers)
- **Accessibility**: Keyboard-only users can fully operate the viewer
- **Simplicity**: Bind events in a `useEffect` hook on the PDFViewer component

**Implementation**:
- `ArrowRight`: Next page (if not on last page)
- `ArrowLeft`: Previous page (if not on first page)
- `Ctrl+Home`: Go to first page
- `Ctrl+End`: Go to last page (out of scope for P1, add in P3)

**Verdict**: ✅ Arrow keys for MVP; expand shortcuts later if needed.

---

## Decision: Error Handling Strategy

**Decision**: Graceful fallback with user-facing error messages + silent console logging

**Rationale**:
- **User experience**: Never crash with browser error; display clear message instead
- **Debugging**: Log errors to console for developer inspection
- **Simplicity**: Try-catch blocks in file handler; conditional rendering for error state

**Error scenarios**:
1. File is not a valid PDF → "Invalid PDF file. Please try another."
2. File is too large (> 50MB) → "File is too large (max 50MB). Please try another."
3. File fails to load → "Failed to load PDF. Please try again."
4. Browser doesn't support File API → "Your browser doesn't support file uploads." (rare)

**Verdict**: ✅ Client-side error boundaries + try-catch patterns.

---

## Decision: No Backend Required (MVP)

**Decision**: Pure client-side PDF processing; no backend API calls

**Rationale**:
- **MVP scope**: File upload, parsing, and rendering all happen in browser
- **Performance**: No network latency; instant PDF display
- **Simplicity**: No server infrastructure needed for this feature
- **Constraint**: Max file size 50MB (browser memory limit)

**When backend becomes necessary** (future):
- Large file handling (e.g., splitting, streaming)
- PDF validation/security scanning
- Persistent storage of uploaded PDFs
- Pre-processing (compression, metadata extraction)

**Verdict**: ✅ Client-side only for MVP.

---

## Decision: No TypeScript (Per Constitution)

**Decision**: Plain JavaScript ES6+ (no TypeScript for greenfield)

**Rationale**:
- **Constitution principle**: "Simplicity First" + "No Over-Engineering"
- **MVP agility**: Faster iteration without type definitions
- **When to add TS**: If codebase grows (> 2000 LOC) or team complexity increases; amend constitution then

**Verdict**: ✅ JavaScript only for MVP.

---

## Decision: Responsive Design

**Decision**: Tailwind CSS responsive classes; support desktop (1024px+) and tablet (768px+)

**Rationale**:
- **Constitution**: All components styled with Tailwind
- **Mobile out of scope**: Mobile PDF viewing requires touch gestures; deferred to future release
- **Tablet support**: Reasonable UX improvement (landscape orientation, touch-friendly buttons)

**Breakpoints**:
- Desktop: `lg:` (1024px+)
- Tablet: `md:` (768px+)
- Mobile phone: Deferred (out of scope for MVP)

**Verdict**: ✅ Responsive for desktop and tablet via Tailwind.

---

## Summary: All Clarifications Resolved ✅

| Question | Resolution | Status |
|----------|-----------|--------|
| PDF library choice | react-pdf | ✅ |
| File upload method | HTML5 `<input type="file">` | ✅ |
| Zoom strategy | Canvas-based with state | ✅ |
| Keyboard navigation | Arrow keys for pages | ✅ |
| Error handling | Try-catch + user messages | ✅ |
| Backend needed? | No (client-side only) | ✅ |
| TypeScript? | No (per constitution) | ✅ |
| Mobile support | Deferred (tablet + desktop MVP) | ✅ |

**Next phase**: Phase 1 (Data-Model & Contracts)
