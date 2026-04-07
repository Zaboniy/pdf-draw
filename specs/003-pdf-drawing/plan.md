# Implementation Plan: PDF Drawing Tool

**Branch**: `003-pdf-drawing` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-pdf-drawing/spec.md`

## Summary

Add a drawing annotation tool to the PDF viewer allowing users to freehand draw on PDF pages with configurable pen color and line width. Core functionality includes unlimited undo/redo, automatic page detection in Book View mode, and session-based persistence. Implementation uses React components with Canvas API for stroke rendering overlaid on react-pdf's PDF viewer layer.

## Technical Context

**Language/Version**: JavaScript ES6+ (React 18+)
**Primary Dependencies**: React, react-pdf, pdfjs-dist, Tailwind CSS, Canvas API
**Storage**: Session memory (in-browser state; no persistence beyond current session)
**Testing**: Jest (via npm test, configured in package.json)
**Target Platform**: Modern web browsers (ES6+ support required)
**Project Type**: Web application (React single-page application)
**Performance Goals**: Real-time drawing with <100ms response for color/width selection; smooth line rendering at 60fps
**Constraints**: Session-only persistence; no file I/O; each page maintains independent drawing layer; automatic page detection in Book View
**Scale/Scope**: Single PDF viewer feature; drawing layer overlay on existing react-pdf viewer; 6 user stories (5 P1/P2 priorities)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. React Component Library
- ✅ Drawing UI built as modular React components (DrawingToolbar, ColorSelector, LineWidthSelector, DrawingCanvas)
- ✅ Each component accepts props for configuration (color, width, enabled state)
- ✅ Styling exclusively with Tailwind CSS classes
- ✅ Components located in `src/components/` with descriptive names

### II. Simplicity First (No Over-Engineering)
- ✅ Straight JavaScript, no TypeScript
- ✅ Canvas API for drawing (standard web API, no complex state management for stroke history)
- ✅ Simple undo/redo stack as in-memory array, not complex state machines
- ✅ YAGNI applied: only implementing features explicitly in spec (no animation, no professional features)

### III. Accessibility & User Experience
- ⚠️ Keyboard support for undo/redo (Ctrl+Z, Ctrl+Y) included
- ⚠️ Drawing toggle via button only (no keyboard shortcut, per clarification)
- ⚠️ Focus management needed for color/width selector buttons
- ⚠️ Clear visual feedback for drawing mode active state
- **Action**: Ensure semantic HTML (button elements, proper ARIA labels if needed for color palette)

### IV. Progressive Functionality
- ✅ Core drawing works at baseline
- ✅ Graceful degradation: if Canvas not supported, show friendly error (out of scope for v1)
- ✅ Performance optimized: Canvas rendering, efficient stroke history
- ✅ Manual browser testing required before completion

**Gate Status**: ✅ PASS - All principles aligned. Accessibility note: ensure buttons use semantic HTML and keyboard focus states.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── DrawingToolbar.jsx          # Toggle button, color selector, width selector UI
│   ├── DrawingCanvas.jsx            # Canvas overlay for stroke rendering
│   ├── ColorPicker.jsx              # Color selection dropdown
│   ├── LineWidthSelector.jsx        # Width selection dropdown
│   ├── PDFViewer.jsx               # Updated: integrate drawing toolbar
│   └── BookView.jsx                # Updated: support drawing overlay in Book View
│
├── hooks/
│   ├── useDrawing.js               # NEW: Drawing state, undo/redo, stroke management
│   └── usePDFViewer.js             # Updated: coordinate with drawing state
│
├── utils/
│   └── drawingUtils.js             # NEW: Stroke rendering, page detection, canvas utilities
│
└── styles/
    └── drawing.css                 # NEW: Drawing canvas and toolbar styles (Tailwind)

tests/
└── drawing.test.js                 # NEW: Unit tests for drawing logic
```

**Structure Decision**: Single-project React app. Drawing feature integrates as overlay components on existing PDFViewer. New hook (`useDrawing`) manages drawing state (strokes, undo/redo, selected color/width). Canvas rendering handled by `DrawingCanvas` component. Utility functions encapsulate page detection and stroke rendering logic.

## Complexity Tracking

**Justification for Accessibility Note**: Drawing mode toggle via button-only (no keyboard shortcut) is intentional per clarification Q3 to maintain simplicity. Keyboard undo/redo (Ctrl+Z/Y) provides power-user efficiency. Accessibility will be verified through semantic HTML (button elements, visible focus states) and manual testing. Future enhancement could add configurable keyboard shortcut if needed.

---

## Phase 0: Research

**Status**: Ready for research phase execution

### Research Tasks

1. **Canvas API stroke rendering optimization**: Best practices for smooth, responsive drawing on HTML5 Canvas with freehand input
   - Touch/mouse event handling
   - Performance optimization for rapid strokes
   - Coordinate transformation for scaled/rotated PDFs

2. **Undo/redo implementation patterns in React**: Effective memory-efficient approaches for unlimited history
   - Stroke history data structure
   - Memory management strategies
   - Performance of large undo stacks

3. **Page boundary detection in react-pdf Book View**: How to reliably determine which page cursor is over in continuous scroll mode
   - PDF page element structure in DOM
   - Hit detection at page boundaries
   - Coordinates relative to page vs viewport

4. **Canvas overlay coordination with PDF rendering**: How to layer Canvas on top of pdf.js without interfering with PDF interaction
   - Z-index and layering strategy
   - Event delegation (PDF interactions vs drawing interactions)
   - Responsive scaling and zoom support

### Clarifications to Resolve

None remaining. All critical ambiguities resolved in clarification phase.

**Next Step**: Run research tasks and consolidate findings in `research.md`

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model Design

**Stroke Entity**:
- `id`: Unique identifier (UUID or sequential)
- `pageNumber`: Which PDF page this stroke belongs to
- `points`: Array of {x, y} coordinates (path of the stroke)
- `color`: Hex color code (e.g., "#FF0000")
- `width`: Line width in pixels (e.g., 2)
- `timestamp`: When stroke was drawn

**Drawing Layer (per page)**:
- `pageNumber`: Identifies the page
- `strokes`: Array of Stroke objects
- `currentColor`: Active color selection
- `currentWidth`: Active width selection

**Undo/Redo Stack**:
- `past`: Array of previous Drawing Layer states
- `present`: Current Drawing Layer state
- `future`: Array of redo-able states

### Contracts

**DrawingContext** (React Context for state management):
```
{
  isDrawingEnabled: boolean,
  currentColor: string,
  currentWidth: number,
  strokes: Array<Stroke>,
  canUndo: boolean,
  canRedo: boolean,
  toggleDrawing: () => void,
  setColor: (color: string) => void,
  setWidth: (width: number) => void,
  undo: () => void,
  redo: () => void,
  clearPage: () => void
}
```

### Project Structure (Code Organization)

- `/src/components/Drawing*`: 4 new component files
- `/src/hooks/useDrawing.js`: State management for drawing
- `/src/utils/drawingUtils.js`: Canvas utilities and page detection
- `/src/styles/drawing.css`: Tailwind-based styling (minimal, component-scoped)

**Next Steps**: Complete research.md, then finalize data model and create component API contracts.
