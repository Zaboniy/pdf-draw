# Implementation Plan: Port PDF Sign App to Chrome Browser Extension

**Branch**: `004-chrome-extension-port` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-chrome-extension-port/spec.md`

## Summary

Port the existing Vite + React PDF annotation app into a Chrome browser extension (Manifest V3). The extension opens as a full-page tab when the user clicks the toolbar icon; it reuses all existing React components, hooks, and drawing utilities unchanged. New work is limited to: a Manifest V3 descriptor, a service worker for toolbar-click and tab-PDF detection, a Vite build configuration update to produce an extension bundle, and a PDF export utility that rasterizes canvas annotations onto pages using pdf-lib. All processing stays fully in-browser with zero external requests.

## Technical Context

**Language/Version**: JavaScript ES6+ (no TypeScript — per constitution)
**Primary Dependencies**: React 19, Vite 8, pdfjs-dist 5, pdf-lib 1.17, Tailwind CSS 4, lucide-react; new dev dependency: `vite-plugin-web-extension`
**Storage**: None (session-only in-memory state; no IndexedDB or localStorage persistence)
**Testing**: Manual browser testing (no automated test runner currently in project)
**Target Platform**: Chrome (Manifest V3); Chromium-based browsers (Edge, Brave) as secondary
**Project Type**: Browser extension (single-project; extension UI is a full-page tab)
**Performance Goals**: PDFs up to 50 pages load and render within 5 seconds; annotation operations feel instant (<100ms visual response)
**Constraints**: Fully offline after install; zero external network requests; no login; all processing in-browser
**Scale/Scope**: Single user, single session, single device; no concurrency concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. React Component Library | ✅ Pass | All UI remains React components styled with Tailwind; no new inline styles or CSS modules introduced |
| II. Simplicity First | ✅ Pass | Plain JavaScript throughout; service worker is vanilla JS (~30 lines); no new state management layer |
| III. Accessibility & UX | ✅ Pass | New "Import from active tab" button and file upload must use semantic HTML and be keyboard navigable |
| IV. Progressive Functionality | ✅ Pass | Load failures (password-protected, cross-origin, unsupported format) show clear error messages; other features continue working |

**No violations. Proceed.**

Post-Phase 1 re-check: No new violations introduced by the design.

## Project Structure

### Documentation (this feature)

```text
specs/004-chrome-extension-port/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── manifest-schema.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
manifest.json                        # NEW: Chrome Extension Manifest V3 descriptor
vite.config.js                       # MODIFIED: extension build output config

src/
├── background.js                    # NEW: service worker (toolbar click → open tab; tab PDF detection)
├── App.jsx                          # MODIFIED: add "Import from tab" flow entry point
├── main.jsx                         # UNCHANGED
├── index.css                        # UNCHANGED
├── App.css                          # UNCHANGED
├── components/                      # UNCHANGED: all existing components
│   ├── BookView.jsx
│   ├── ColorPicker.jsx
│   ├── DrawingCanvas.jsx
│   ├── DrawingContext.jsx
│   ├── DrawingErrorBoundary.jsx
│   ├── DrawingToolbar.jsx
│   ├── LineWidthSelector.jsx
│   ├── PDFCanvas.jsx
│   ├── PDFFileInput.jsx             # UNCHANGED (local file upload)
│   ├── PDFPageNav.jsx
│   ├── PDFViewer.jsx
│   └── ThumbnailPanel.jsx
├── hooks/
│   ├── useDrawing.js                # UNCHANGED
│   └── usePDFViewer.js              # UNCHANGED
├── utils/
│   ├── drawingUtils.js              # UNCHANGED
│   └── pdfExport.js                 # NEW: rasterize canvas annotations → pdf-lib embed → download
└── styles/
    └── drawing.css                  # UNCHANGED

public/
├── icon16.png                       # NEW: extension icons (16, 48, 128px)
├── icon48.png
└── icon128.png
```

**Structure Decision**: Single-project layout. The extension is the same project with additive files. No new packages or directories are introduced beyond `src/background.js`, `src/utils/pdfExport.js`, and `manifest.json`. The Vite config is updated in-place.

## Complexity Tracking

> No constitution violations — this section is not required.
