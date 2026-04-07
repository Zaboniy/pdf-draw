# Implementation Plan: Open and View PDF

**Branch**: `001-open-view-pdf` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-open-view-pdf/spec.md`

## Summary

Users can upload and view PDF files in the web application with page navigation (previous/next, keyboard arrows), zoom controls (in/out/fit-to-viewport), and graceful error handling. This is the foundational feature—all signing, annotation, and document processing features depend on reliable PDF loading and display. Three prioritized user stories: P1 (upload & display), P2 (page navigation), P3 (zoom/view controls).

## Technical Context

**Language/Version**: JavaScript ES6+, React 18+  
**Primary Dependencies**: react-pdf (pdf.js wrapper), React Router (if multi-page app needed)  
**Build Tool**: Vite (fast, minimal config, excellent HMR for React development)  
**Storage**: sessionStorage for viewer state (optional, no persistence in MVP)  
**Testing**: Not required (greenfield SPA, no-test approach per constitution)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge); desktop and tablet viewports  
**Project Type**: Single Page Application (React web app)  
**Performance Goals**: PDF renders within 2 seconds; page navigation < 100ms; zoom operations smooth (no lag)  
**Constraints**: Max file size 50MB (browser memory); client-side only (no backend API calls for MVP)  
**Scale/Scope**: 1 PDF viewer (parent component), 5-6 subcomponents (file input, canvas, nav, zoom); ~500-800 LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **React Component Library**: PDFViewer is a React component; subcomponents (PDFFileInput, PDFCanvas, PDFPageNav, PDFZoomControls) are modular and reusable. All styled with Tailwind CSS (no inline styles or CSS modules).

✅ **Simplicity First**: Plain React hooks (useState) for document and viewer state. No Redux, Context API, or complex patterns. Straight JavaScript—no TypeScript. One simple library (react-pdf) chosen over complex alternatives.

✅ **Accessibility & UX**: File input is semantic `<button>` + `<input type="file">`; navigation buttons are semantic `<button>` elements; keyboard support (arrow keys for page nav); focus management; zoom controls clearly labeled; error messages are plain text (no browser alerts).

✅ **Progressive Functionality**: Core (P1): PDF loads and displays. Enhancement (P2): navigation. Enhancement (P3): zoom. Graceful degradation: if zoom fails, viewer still displays; if navigation fails, user can reload.

**Status**: ✅ PASS — Feature aligns with all four core principles. No complexity violations. No justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-open-view-pdf/
├── plan.md              # This file
├── spec.md              # Feature specification (complete)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
└── tasks.md             # Phase 2 output (created via /speckit.tasks)
```

### Source Code (repository root)

**Single Project (React SPA)**

```text
src/
├── components/
│   ├── PDFViewer.jsx           # Parent component, manages overall state
│   ├── PDFFileInput.jsx        # File upload (click or drag-drop)
│   ├── PDFCanvas.jsx           # Page rendering using pdf.js
│   ├── PDFPageNav.jsx          # Previous/Next buttons + page counter
│   └── PDFZoomControls.jsx     # Zoom buttons (in, out, fit, reset)
├── hooks/
│   └── usePDFViewer.js         # Custom hook: PDF document state & methods
├── pages/
│   └── ViewerPage.jsx          # Main viewer page (routes here if multi-page app)
├── App.jsx                     # Root component
└── index.js                    # React DOM entry point

public/
├── index.html                  # HTML shell

package.json                    # Dependencies: react, react-pdf, react-router-dom
```

**Structure Decision**: Single project SPA with modular React components. PDFViewer (parent) manages shared state; subcomponents (PDFFileInput, PDFCanvas, PDFPageNav, PDFZoomControls) handle specific concerns. Custom hook `usePDFViewer` encapsulates PDF state logic. No backend or test directory (per constitution: no-test approach for greenfield).

## Complexity Tracking

No violations. All architectural choices align with constitution.

| Decision | Rationale |
|----------|-----------|
| Use react-pdf over raw pdf.js | Cleaner React API; pdf.js alone requires manual worker setup and complex state management |
| useState hooks only (no Redux/Context) | Single feature, shared state is minimal and self-contained; add layers only when needed (YAGNI) |
| No TypeScript | Per constitution: straight JavaScript for greenfield projects; add TS if type safety becomes critical |
| Client-side only (no backend) | MVP scope; backend PDF processing (splitting, validation) out of scope; add later if needed |
