# Task List: PDF Drawing Tool

**Feature**: PDF Drawing Tool (`003-pdf-drawing`)
**Branch**: `003-pdf-drawing`
**Created**: 2026-04-07
**Based on**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

This task list breaks down the PDF Drawing Tool feature into independently testable increments organized by user story priority. Each task is specific and actionable, with exact file paths for implementation.

**Total Tasks**: 28
**Phases**: 5 (Setup, Foundational, US1-3 (P1), US4-6 (P2), Polish)
**MVP Scope**: User Stories 1-3 (all P1: basic drawing with color selection)

---

## Phase 1: Setup

Project initialization and infrastructure setup.

- [x] T001 Create drawing state management hook at `src/hooks/useDrawing.js` with undo/redo stack
- [x] T002 Create drawing utility functions at `src/utils/drawingUtils.js` for Canvas rendering and page detection
- [x] T003 Create Tailwind-based styling for drawing components at `src/styles/drawing.css`

---

## Phase 2: Foundational

Blocking prerequisites required before implementing user stories.

- [x] T004 [P] Create DrawingCanvas component at `src/components/DrawingCanvas.jsx` for Canvas overlay rendering
- [x] T005 [P] Create ColorPicker dropdown component at `src/components/ColorPicker.jsx` with predefined color options
- [x] T006 [P] Create LineWidthSelector component at `src/components/LineWidthSelector.jsx` with width options
- [x] T007 Create DrawingToolbar component at `src/components/DrawingToolbar.jsx` integrating all controls
- [x] T008 Update PDFViewer component at `src/components/PDFViewer.jsx` to include DrawingToolbar in header
- [x] T009 Integrate useDrawing hook with React Context at `src/components/DrawingContext.jsx` for state management

---

## Phase 3: User Stories 1-3 (P1 - MVP Core)

Core drawing functionality enabling annotation workflow.

### User Story 1: Activate Drawing Mode

**Goal**: Users can toggle drawing mode on/off with visual feedback
**Independent Test**: Click draw button → mode activates → visual feedback appears → click again → mode deactivates
**Acceptance**: Can fully test by toggling button and observing state change

- [x] T010 [US1] Implement drawing mode toggle in DrawingToolbar at `src/components/DrawingToolbar.jsx`
- [x] T011 [US1] Add visual feedback (button highlight) for active drawing mode in `src/styles/drawing.css`
- [x] T012 [P] [US1] Add cursor feedback (cursor change) in DrawingCanvas at `src/components/DrawingCanvas.jsx`
- [x] T013 [US1] Update PDFViewer to disable/enable PDF navigation when drawing mode active in `src/components/PDFViewer.jsx`
- [x] T014 [US1] Verify keyboard shortcut Ctrl+Z/Y works in useDrawing hook at `src/hooks/useDrawing.js`

### User Story 2: Draw Freehand Lines

**Goal**: Users can draw visible freehand lines on PDF pages
**Independent Test**: Enter drawing mode → click and drag on page → verify lines appear → draw multiple lines → verify all preserved
**Acceptance**: Can fully test by drawing and observing rendered strokes

- [x] T015 [P] [US2] Implement mouse/touch event handlers in DrawingCanvas at `src/components/DrawingCanvas.jsx`
- [x] T016 [P] [US2] Implement Canvas stroke rendering in drawingUtils at `src/utils/drawingUtils.js` (drawStroke function)
- [x] T017 [P] [US2] Implement stroke coordinate collection in useDrawing hook at `src/hooks/useDrawing.js`
- [x] T018 [US2] Implement stroke persistence (add to strokes array) in useDrawing at `src/hooks/useDrawing.js`
- [x] T019 [US2] Implement page boundary constraint in drawingUtils at `src/utils/drawingUtils.js` (constrainToPageBounds function)
- [x] T020 [US2] Add stroke rendering on page load/redraw in DrawingCanvas at `src/components/DrawingCanvas.jsx`

### User Story 3: Select Drawing Color

**Goal**: Users can choose pen color from predefined palette
**Independent Test**: Open color selector → select color → draw line → verify correct color applied → select different color → draw → verify only new lines use new color
**Acceptance**: Can fully test by selecting color, drawing, and observing output color

- [x] T021 [P] [US3] Implement color selection handler in ColorPicker at `src/components/ColorPicker.jsx`
- [x] T022 [P] [US3] Implement currentColor state in useDrawing hook at `src/hooks/useDrawing.js`
- [x] T023 [US3] Update DrawingToolbar to display selected color at `src/components/DrawingToolbar.jsx`
- [x] T024 [US3] Apply color to strokes in drawingUtils renderStroke function at `src/utils/drawingUtils.js`
- [x] T025 [US3] Verify color persists across multiple strokes in useDrawing at `src/hooks/useDrawing.js`

---

## Phase 4: User Stories 4-6 (P2 - Enhanced Features)

Extended functionality for drawing control and multiview support.

### User Story 4: Adjust Line Width

**Goal**: Users can control pen thickness from preset options
**Independent Test**: Select different widths → draw lines → verify visually different thicknesses → select new width → draw → verify only new lines use new width
**Acceptance**: Can fully test by selecting width, drawing, and observing stroke thickness

- [x] T026 [P] [US4] Implement width selection handler in LineWidthSelector at `src/components/LineWidthSelector.jsx`
- [x] T027 [P] [US4] Implement currentWidth state in useDrawing hook at `src/hooks/useDrawing.js`
- [x] T028 [US4] Update DrawingToolbar to display selected width at `src/components/DrawingToolbar.jsx`

### User Story 5: Persist Drawings Across Interactions

**Goal**: Drawings remain visible during zoom, scroll, and page navigation
**Independent Test**: Draw lines → zoom in/out → verify drawings visible and scaled → switch view modes → verify drawings persist
**Acceptance**: Can fully test by drawing, interacting with viewer, and confirming persistence

- [x] T029 [P] [US5] Implement canvas redraw on zoom/scroll in DrawingCanvas at `src/components/DrawingCanvas.jsx`
- [x] T030 [US5] Implement per-page stroke storage in useDrawing hook at `src/hooks/useDrawing.js` (per-page drawing layers)
- [x] T031 [US5] Implement page change handler to load/clear strokes in useDrawing at `src/hooks/useDrawing.js`
- [x] T032 [US5] Verify drawings persist when switching between Single Page and Book View in PDFViewer at `src/components/PDFViewer.jsx`

### User Story 6: Draw in Book View Mode

**Goal**: Users can draw annotations in Book View with automatic page detection
**Independent Test**: Enter Book View → position cursor over different pages → draw → verify strokes appear on correct page → scroll → draw on new page → verify correct page receives strokes
**Acceptance**: Can fully test by drawing in Book View and verifying page-specific stroke placement

- [x] T033 [P] [US6] Implement page boundary detection in drawingUtils at `src/utils/drawingUtils.js` (detectPageAtCursor function)
- [x] T034 [P] [US6] Implement automatic page selection in DrawingCanvas at `src/components/DrawingCanvas.jsx` based on cursor position
- [x] T035 [US6] Update BookView component to support drawing overlay at `src/components/BookView.jsx`
- [x] T036 [US6] Test drawing near page boundaries in Book View integration test

---

## Phase 5: Polish & Cross-Cutting Concerns

Quality, accessibility, and finalization tasks.

- [x] T037 [P] Add undo/redo button UI to DrawingToolbar at `src/components/DrawingToolbar.jsx`
- [x] T038 [P] Implement undo/redo button handlers in useDrawing hook at `src/hooks/useDrawing.js`
- [x] T039 Verify semantic HTML (button elements, focus states) in all drawing components for accessibility
- [x] T040 Add loading state handling for Canvas initialization in DrawingCanvas at `src/components/DrawingCanvas.jsx`
- [x] T041 Add error boundary for drawing feature failures in DrawingCanvas at `src/components/DrawingCanvas.jsx`
- [x] T042 Manual browser testing: Verify drawing works in Chrome, Firefox, Safari at minimum
- [x] T043 Update README.md with drawing feature documentation

---

## Task Dependencies & Execution Strategy

### Critical Path (MVP - User Stories 1-3)

```
Phase 1: Setup (T001-T003)
    ↓
Phase 2: Foundational (T004-T009)
    ↓
Phase 3: P1 User Stories (T010-T025)
    ├─ US1 (T010-T014) - Can start immediately after Phase 2
    ├─ US2 (T015-T020) - Blocks on US1 (needs drawing mode), can start T015-T017 in parallel with US1
    └─ US3 (T021-T025) - Blocks on US2 (needs strokes), but color UI (T021) can start in parallel
```

### Parallel Opportunities (Phase 3 - MVP)

**US1 & US3 parallel start**: ColorPicker (T021) and LineWidthSelector UI can be built in parallel with drawing mode (T010-T012) since they don't depend on canvas rendering.

**Canvas & Event Handlers**: DrawingCanvas component structure (T004) and event handling (T015) can be coordinated but event handling blocks on Canvas structure.

### Phase 4+ (Extended Features)

- User Stories 4-6 (P2) can start after Phase 2
- US4 (line width) blocks on US3 (color) for consistency
- US5 (persistence) blocks on US2 (drawing works)
- US6 (Book View) can start in parallel with US5 after Page detection utility available

### Suggested MVP Delivery Sequence

1. **Phase 1-2** (Foundations): Complete all setup and foundational components (T001-T009)
2. **Phase 3 (P1 Only)**: Complete User Stories 1-3 for MVP (T010-T025)
3. **Test MVP**: Manual browser testing of draw, color, basic persistence
4. **Phase 4 (P2)**: Add line width, persistence enhancements, Book View support (T026-T036)
5. **Phase 5**: Polish, accessibility verification, documentation (T037-T043)

**MVP Completion Estimate**: Phases 1-3 (25 tasks total for full P1+P2, 15 tasks for P1-only MVP)

---

## Task Format Validation

✅ All tasks follow strict format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Task IDs sequential (T001-T043)
✅ Parallelizable tasks marked with [P]
✅ User story tasks marked with [USN]
✅ All descriptions include exact file paths
✅ Each user story independently testable
✅ Dependencies documented in Critical Path section

---

## Execution Checklist

Use this to track overall progress:

- [ ] Phase 1 Complete (Setup infrastructure)
- [ ] Phase 2 Complete (Foundational components & state management)
- [ ] Phase 3 Complete (P1 User Stories - MVP)
- [ ] MVP Testing Complete
- [ ] Phase 4 Complete (P2 User Stories - Extended features)
- [ ] Phase 5 Complete (Polish & finalization)
- [ ] Feature ready for merge to main
