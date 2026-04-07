---
description: "Task list for PDF Viewer feature implementation (001-open-view-pdf)"
---

# Tasks: Open and View PDF Files

**Input**: Design documents from `/specs/001-open-view-pdf/`  
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/component-contracts.md (complete)

**Tests**: Not requested in specification; greenfield SPA with no-test approach per constitution. Manual testing in browser per quickstart.md.

**Organization**: Tasks grouped by user story (US1, US2, US3) to enable independent implementation and testing. Each story is a standalone increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3) or none if setup/foundational
- File paths are relative to repository root (`src/`, `public/`, `package.json`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize React project and install dependencies

- [X] T001 Initialize React project and install base dependencies (run `npx create-react-app pdf-sign` or verify existing setup with `npm --version` and `node --version`)
- [X] T002 [P] Install react-pdf and pdfjs-dist in `package.json` (run `npm install react-pdf pdfjs-dist`)
- [X] T003 [P] Install Tailwind CSS for styling (run `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`)
- [X] T004 [P] Configure Tailwind CSS by updating `tailwind.config.js` to include content paths: `['./src/**/*.{js,jsx}']`
- [X] T005 [P] Add Tailwind directives to `src/index.css`: `@tailwind base; @tailwind components; @tailwind utilities;`
- [X] T006 Create project directory structure: `src/components/`, `src/hooks/`, `src/pages/` directories

**Checkpoint**: Project initialized, dependencies installed, Tailwind CSS configured. Ready for foundational phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and state management that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Create custom hook `usePDFViewer` in `src/hooks/usePDFViewer.js` with:
  - State: `pdfDocument` (null | { file, numPages, fileName, loadedAt, error })
  - State: `viewerState` (currentPage, zoomLevel, isLoading, error, rotation)
  - Function: `selectFile(file)` — validates size (≤50MB), parses with pdf.js, updates state
  - Function: `goNextPage()`, `goPreviousPage()`, `goToPage(n)` — page navigation with boundary checks
  - Function: `zoomIn()`, `zoomOut()`, `fitToWidth()`, `fitToHeight()`, `resetZoom()` — zoom with clamping [0.5, 3.0]
  - Function: `clearFile()` — reset to initial state
  - Configure pdf.js worker URL from CDN

- [X] T008 [P] Create base App component in `src/App.jsx` that renders the PDFViewer component (stub for now)

- [ ] T009 [P] Verify pdf.js worker can be accessed (test in browser console: open DevTools and confirm no worker 404 errors when loading PDF)

- [X] T010 Create main entry point `src/index.js` with React.render to #root in `public/index.html`

- [X] T011 Create `public/index.html` with basic HTML structure and `<div id="root"></div>`

**Checkpoint**: Foundation ready — usePDFViewer hook functional with full state management. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Upload and Display PDF (Priority: P1) 🎯 MVP

**Goal**: Users can select a PDF file and see it rendered on the page. This is the core MVP feature.

**Independent Test**: User clicks "Open PDF" → selects a local PDF file → PDF renders on page → page shows "Page 1 of N" (if multi-page)

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `PDFFileInput` component in `src/components/PDFFileInput.jsx`:
  - Props: `onSelect(file)`, `isLoading`, `error`
  - Renders: "Open PDF" button, hidden file input (accept=".pdf"), loading spinner, error message
  - Behavior: Click button → file picker → select PDF → call `onSelect(file)` with File object
  - Styling: Tailwind classes (blue button, red error text, disabled state styling)

- [X] T013 [P] [US1] Create `PDFCanvas` component in `src/components/PDFCanvas.jsx`:
  - Props: `pdfDocument`, `currentPage`, `zoomLevel`
  - Renders: react-pdf `<Document>` and `<Page>` components
  - Set: `scale={zoomLevel}` on `<Page>` for zoom support
  - Display: Spinner while page loading, error fallback if document invalid
  - Styling: Centered page view with padding via Tailwind

- [X] T014 [US1] Create parent `PDFViewer` component in `src/components/PDFViewer.jsx`:
  - Initialize: `const { pdfDocument, viewerState, actions } = usePDFViewer();`
  - Render: Header with PDFFileInput
  - Conditional render:
    - If `pdfDocument` loaded: show PDFCanvas (no PDFPageNav/PDFZoomControls yet—added in US2/US3)
    - If `pdfDocument.error`: show error message
    - If no document: show "No PDF loaded. Select a file to view."
  - Pass props to children: onSelect, isLoading, error, pdfDocument, currentPage, zoomLevel
  - Styling: Flexbox layout (header + main content) with Tailwind, min-height: full viewport

- [X] T015 [US1] Update `src/App.jsx` to render `<PDFViewer />` as main component

- [ ] T016 [US1] Verify file size validation in `usePDFViewer.selectFile()`: 
  - Create test file >50MB (or mock) → should show error "File is too large"
  - Create valid PDF <50MB → should load successfully
  - Create non-PDF file → should show error "Failed to load PDF"

- [ ] T017 [US1] Test in browser:
  - Run `npm start` (should start dev server on http://localhost:3000)
  - Click "Open PDF" button → file picker appears
  - Select a valid PDF from computer → PDF renders on page
  - Page displays "No PDF loaded" message before file is selected
  - Error message appears for invalid files (test with .txt file)
  - Console shows no worker errors (pdf.js worker loaded successfully)

**Checkpoint**: User Story 1 complete and independently functional. Users can upload and view single-page or multi-page PDFs. MVP is deliverable at this point.

---

## Phase 4: User Story 2 - Navigation Within PDF (Priority: P2)

**Goal**: Users can move between pages of a multi-page PDF using buttons and keyboard.

**Independent Test**: User opens multi-page PDF → clicks "Next" button → page 2 displays → clicks "Previous" → page 1 displays → presses arrow keys (→ and ←) → pages advance. Buttons disabled at boundaries.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `PDFPageNav` component in `src/components/PDFPageNav.jsx`:
  - Props: `currentPage`, `numPages`, `onPrev()`, `onNext()`
  - Renders:
    - "Previous" button (disabled if currentPage === 1)
    - Text: "Page {currentPage} of {numPages}"
    - "Next" button (disabled if currentPage === numPages)
  - Behavior: Click buttons → invoke `onPrev()` or `onNext()` callbacks
  - Styling: Flex layout with Tailwind, buttons gray with disabled opacity

- [ ] T019 [P] [US2] Update `PDFViewer` component in `src/components/PDFViewer.jsx`:
  - Add footer section (below PDFCanvas) when PDF is loaded
  - Render `<PDFPageNav />` in footer
  - Pass props: `currentPage={viewerState.currentPage}`, `numPages={pdfDocument.numPages}`, `onPrev={actions.goPreviousPage}`, `onNext={actions.goNextPage}`

- [ ] T020 [US2] Add keyboard navigation to `PDFViewer`:
  - Implement `useEffect` hook that listens for keydown events
  - ArrowRight key → call `actions.goNextPage()`
  - ArrowLeft key → call `actions.goPreviousPage()`
  - Only active when PDF is loaded (check `pdfDocument` exists)
  - Dependencies: `[pdfDocument, actions]` to avoid stale closures

- [ ] T021 [US2] Test page navigation in browser:
  - Open multi-page PDF (e.g., 5+ pages)
  - Click "Next" → page increments to 2 → page counter shows "Page 2 of 5"
  - Click "Previous" → page decrements to 1 → page counter shows "Page 1 of 5"
  - Click "Previous" on page 1 → button disabled (grayed out), nothing happens
  - Click "Next" on last page → button disabled, nothing happens
  - Press right arrow key → page advances to next
  - Press left arrow key → page goes to previous
  - Focus stays on page when navigating (no focus jumps)

**Checkpoint**: User Story 2 complete and independently functional. Users can navigate multi-page PDFs using buttons and keyboard. US1 + US2 together form a solid MVP.

---

## Phase 5: User Story 3 - Zoom and View Controls (Priority: P3)

**Goal**: Users can zoom in/out and fit PDF to viewport for better readability.

**Independent Test**: User opens PDF → clicks "Zoom In" → PDF enlarges (zoom % increases) → clicks "Zoom Out" → shrinks. Clicks "Fit Width" → PDF width matches viewport. Clicks "Reset" → zoom returns to 100%.

### Implementation for User Story 3

- [ ] T022 [P] [US3] Create `PDFZoomControls` component in `src/components/PDFZoomControls.jsx`:
  - Props: `zoomLevel`, `onZoomIn()`, `onZoomOut()`, `onFitWidth()`, `onFitHeight()`, `onReset()`
  - Renders:
    - "Zoom Out" button (−)
    - Text display: "{zoomLevel * 100}%" (e.g., "100%")
    - "Zoom In" button (+)
    - "Fit Width" button
    - "Fit Height" button
    - "Reset" button
  - Behavior: Click any button → invoke corresponding callback
  - Styling: Flex row with gap, gray buttons, zoom % centered and fixed-width

- [ ] T023 [P] [US3] Update `PDFViewer` footer in `src/components/PDFViewer.jsx`:
  - Add `<PDFZoomControls />` to footer (alongside or after PDFPageNav)
  - Pass props: `zoomLevel={viewerState.zoomLevel}`, `onZoomIn={actions.zoomIn}`, `onZoomOut={actions.zoomOut}`, `onFitWidth={actions.fitToWidth}`, `onFitHeight={actions.fitToHeight}`, `onReset={actions.resetZoom}`
  - Layout: Use Tailwind `flex justify-between` so nav on left, zoom on right

- [ ] T024 [US3] Implement `fitToWidth()` and `fitToHeight()` in `usePDFViewer` hook:
  - **fitToWidth**: Calculate zoom needed to fit page width to viewport
    - Get viewport width from window.innerWidth (or useRef on PDFCanvas container)
    - Estimate PDF page width (standard: 612px for letter size) or use actual page dimensions if available from react-pdf
    - Compute: `zoomLevel = viewportWidth / estimatedPageWidth` (or use 1.2 as approximation)
    - Set state: `setViewerState(prev => ({ ...prev, zoomLevel: computed }))`
  - **fitToHeight**: Similar logic for vertical fit
    - Alternative: Use hard-coded reasonable defaults (e.g., 1.0 for fit-to-page, 1.2 for compact fit)
  - Note: Exact implementation depends on react-pdf API; see quickstart.md for guidance

- [ ] T025 [US3] Verify zoom bounds in `usePDFViewer`:
  - `zoomIn()`: Increment by 0.25, clamp max to 3.0 (300%)
  - `zoomOut()`: Decrement by 0.25, clamp min to 0.5 (50%)
  - `resetZoom()`: Set to 1.0 (100%)
  - Test: zoomIn multiple times → stops at 3.0; zoomOut multiple times → stops at 0.5

- [ ] T026 [US3] Test zoom controls in browser:
  - Open PDF
  - Click "Zoom In" → PDF enlarges, zoom % increases (e.g., 100% → 125%)
  - Continue clicking → zoom reaches 300%, stops incrementing
  - Click "Zoom Out" → PDF shrinks, zoom % decreases
  - Continue clicking → zoom reaches 50%, stops decrementing
  - Click "Reset" → zoom returns to 100%
  - Click "Fit Width" → PDF width fills viewport (approximate test; exact pixels depend on screen size)
  - Click "Fit Height" → PDF height fills viewport
  - Zoom operations are smooth (no lag or flickering)

**Checkpoint**: User Story 3 complete and independently functional. All three user stories now complete. Feature is fully polished with all planned functionality.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, validation, and documentation

- [ ] T027 [P] Test error handling comprehensively:
  - Test with corrupted PDF file (should show "Failed to load PDF" error without crashing)
  - Test with 100+ page PDF (should load all pages and allow navigation)
  - Test with file >50MB (should show file size error)
  - Test with non-PDF file (.txt, .docx, etc.) (should show "Failed to load PDF" error)
  - Confirm no JavaScript errors in browser console for any error case

- [ ] T028 [P] Test browser compatibility:
  - Test in Chrome → all features work
  - Test in Firefox → all features work
  - Test in Safari → all features work
  - Test in Edge → all features work
  - Confirm responsive behavior on desktop (≥1024px) and tablet (768px+) viewports

- [ ] T029 Validate accessibility:
  - All buttons are keyboard-accessible (Tab key cycles through interactive elements)
  - All buttons have visible focus indicators (outline or ring)
  - File input button and file picker work via keyboard
  - Error messages are plain text (readable by screen readers)
  - Confirm no ARIA violations (use browser accessibility inspector)

- [ ] T030 [P] Review code style and consistency:
  - All component files use `.jsx` extension
  - All Tailwind classes are consistent (no inline styles, no CSS modules)
  - All components have clear prop documentation in code comments
  - Consistent use of React hooks (useState, useEffect)
  - No console.errors left in production code (only console.error for debugging, marked as TODO)

- [ ] T031 Verify quickstart.md matches implementation:
  - Review `/specs/001-open-view-pdf/quickstart.md`
  - Confirm code snippets match actual components in `src/components/` and `src/hooks/`
  - Confirm dependency installation commands are correct
  - Confirm npm start and testing instructions are accurate

- [ ] T032 Update `README.md` (project root, if it exists) or create one:
  - Document feature: "PDF Viewer - Open and view PDF files with page navigation and zoom controls"
  - Installation: `npm install` (list all dependencies: react, react-pdf, pdfjs-dist, tailwindcss)
  - Running: `npm start`
  - Supported browsers: Chrome, Firefox, Safari, Edge
  - MVP scope: P1 (upload & display), P2 (navigation), P3 (zoom)
  - Future work: Drag-drop file upload, PDF signing, annotations

- [ ] T033 Final manual testing (full feature validation):
  - Start fresh: `rm -rf node_modules` and `npm install` to simulate new developer environment
  - Run `npm start` → app loads without errors
  - Test all three user stories in sequence:
    - US1: Upload PDF → verify displays
    - US2: Navigate pages (buttons + keyboard) → verify works
    - US3: Zoom in/out/fit → verify works
  - Test error cases (corrupted file, oversized file, non-PDF)
  - Confirm no console errors or warnings
  - Confirm responsive design (resize to tablet and desktop widths)

**Checkpoint**: Feature complete, tested, and ready for merge. All user stories functional and independently testable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies → start immediately
- **Foundational (Phase 2)**: Depends on Setup → BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational → can start after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational + can start when US1 complete
- **User Story 3 (Phase 5)**: Depends on Foundational + can start when US2 complete
- **Polish (Phase 6)**: Depends on all user stories → final validation

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories (independent)
- **User Story 2 (P2)**: Builds on US1 (needs PDFViewer + PDFCanvas in place) but independently testable
- **User Story 3 (P3)**: Builds on US1 + US2 (needs PDFViewer + PDFCanvas in place) but independently testable

### Within Each Phase

- **Setup**: All tasks marked [P] run in parallel (no dependencies)
- **Foundational**: Task T007 (usePDFViewer) must finish before T008/T009/T010 (they depend on the hook)
- **User Story 1**: T012/T013 [P] can run in parallel (different components), T014 depends on both, T015/T016/T017 depend on T014
- **User Story 2**: T018/T019/T020 have dependencies (T018 first, T019 depends on T018, T020 last)
- **User Story 3**: T022/T023/T024 have sequential dependencies

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004, T005, T006 all [P] → can run in parallel

**Phase 2 (Foundational)**:
- T007, T008, T009, T011 can potentially run in parallel if split by developer (but T007 is critical path)
- T010 depends on T011

**Phase 3 (US1)**:
- T012, T013 [P] can run in parallel (different components)
- T014 waits for T012 + T013
- T015, T016, T017 sequential

**Phase 4 (US2)**:
- T018 → T019 (sequential, T019 updates PDFViewer to use T018's component)
- T020 → T021 (sequential)

**Phase 5 (US3)**:
- T022 → T023 (sequential, T023 updates PDFViewer to use T022's component)
- T024 → T025 (sequential)

**Phase 6 (Polish)**:
- T027, T028, T029, T030, T031, T032 mostly [P] → can run in parallel (different testing focus)
- T033 (final integration test) waits for all others

---

## Implementation Strategy

### MVP First (Recommended - Focus on User Story 1 only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T011)
3. Complete Phase 3: User Story 1 (T012-T017)
4. **STOP and VALIDATE**: User can open PDF and view it
5. Deploy or demo US1 as standalone MVP

**Result**: Minimal viable product. Users can upload and view PDFs. Ready for stakeholder feedback before continuing to navigation (US2) and zoom (US3).

### Incremental Delivery (Recommended - Add features one at a time)

1. Phases 1-2: Setup + Foundational
2. Phases 3: US1 → Test independently → Demo/Deploy (MVP!)
3. Phase 4: US2 → Test independently → Demo/Deploy (Enhanced MVP)
4. Phase 5: US3 → Test independently → Demo/Deploy (Full Feature)
5. Phase 6: Polish and final validation

**Result**: Three incremental releases, each building on the previous.

### Parallel Team Strategy (If multiple developers)

With 2-3 developers:

1. **Developer A**: Completes Phases 1-2 (Setup + Foundational) alone
2. **Once Phases 1-2 done**:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: Research & document tests (Phase 6 prep)
3. **After US1 done**:
   - Developer A: User Story 2 (Phase 4)
   - Developer B: User Story 3 (Phase 5) in parallel
4. **Final**: Merge and validate all stories together (Phase 6)

**Result**: Faster completion with parallel work on different user stories.

---

## Notes

- **[P] tasks** = tasks in different files with no dependencies; safe to run in parallel
- **[Story] labels** = [US1], [US2], [US3] map to user stories from spec.md for traceability
- **Each user story** is independently completable and testable; users see value after each story
- **No tests included** per constitution (greenfield SPA, no-test approach); manual browser testing via quickstart.md
- **Commit strategy**: Commit after each task or logical group (e.g., commit after T012+T013, commit after T014-T017)
- **Stop at checkpoints**: After each phase checkpoint, validate the feature works independently before moving to next phase
- **Avoid**: Vague tasks, same-file task conflicts without dependencies, cross-story dependencies that break independence
- **Browser testing**: Use actual PDFs from computer; test with various file sizes, page counts, and formats

---

## Task Summary

| Phase | Tasks | Focus | Checkpoint |
|-------|-------|-------|-----------|
| 1. Setup | T001-T006 | Initialize project, install dependencies | Project ready for development |
| 2. Foundational | T007-T011 | State management hook, project structure | Core infrastructure in place; ready for user stories |
| 3. US1 (P1) | T012-T017 | Upload PDF, display on page | Users can open and view PDFs ✅ MVP |
| 4. US2 (P2) | T018-T021 | Page navigation, keyboard support | Users can navigate multi-page PDFs ✅ |
| 5. US3 (P3) | T022-T026 | Zoom controls, fit-to-width/height | Users can zoom and control view ✅ |
| 6. Polish | T027-T033 | Testing, accessibility, final validation | Feature complete and polished ✅ |

**Total**: 33 tasks | **US1**: 6 tasks | **US2**: 4 tasks | **US3**: 5 tasks | **Setup + Foundational**: 8 tasks | **Polish**: 7 tasks

---

**Implementation Ready** ✅

All tasks are specific, testable, and ready to execute. Begin with Phase 1 (Setup), then move through phases in order. MVP (US1) is deliverable after Phase 3. Full feature complete after Phase 5. Polish and final validation in Phase 6.
