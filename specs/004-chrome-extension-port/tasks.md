# Tasks: Port PDF Sign App to Chrome Browser Extension

**Input**: Design documents from `/specs/004-chrome-extension-port/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not included — no automated test runner in project and none requested in spec. Verification is manual per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add extension build tooling and assets so the project can be built and loaded as a Chrome extension

- [x] T001 Install `vite-plugin-web-extension` as a dev dependency (`npm install --save-dev vite-plugin-web-extension` in project root)
- [x] T002 Create `manifest.json` at project root per `contracts/manifest-schema.md` (name, version, manifest_version 3, action with no default_popup, background service_worker pointing to `background.js`, icons, permissions: activeTab/tabs/storage, host_permissions: `<all_urls>`)
- [x] T003 [P] Update `vite.config.js` to import and register `vite-plugin-web-extension` with `manifest: './manifest.json'`; keep existing `react()` plugin and sourcemap config
- [x] T004 [P] Create placeholder extension icons: `public/icon16.png`, `public/icon48.png`, `public/icon128.png` (16×16, 48×48, 128×128 — use any placeholder image; can be replaced with branded icons in Polish phase)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core extension plumbing and PDF export utility that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/background.js` as a Manifest V3 service worker that: (1) listens for `chrome.action.onClicked`, (2) calls `chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })` to open the extension UI as a full tab; no PDF detection logic yet (added in US2)
- [ ] T006 Run `npm run build` and load the `dist/` directory as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked); confirm the toolbar icon appears and clicking it opens the existing PDF Sign UI in a full browser tab with all existing components visible
- [x] T007 Create `src/utils/pdfExport.js` — **ALREADY IMPLEMENTED**: `savePDF()` in `src/hooks/useDrawing.js` (lines 353-439) renders each page via pdfjs, draws strokes on a canvas, embeds as PNG into pdf-lib, and downloads. The "Save" button in `PDFViewer.jsx` already calls this. No separate utility file needed.

**Checkpoint**: Extension loads in Chrome and PDF export utility exists — user story implementation can begin

---

## Phase 3: User Story 1 - Install and Annotate a Local PDF (Priority: P1) 🎯 MVP

**Goal**: User installs extension, uploads a local PDF, annotates it (draw/text/sign), and downloads the annotated PDF with annotations flattened

**Independent Test**: Install extension → click toolbar icon → upload any PDF → draw a mark → click Download → open the downloaded file in another PDF viewer and confirm the mark is visible as a permanent image

### Implementation for User Story 1

- [x] T008 [US1] Add a Download button — **ALREADY IMPLEMENTED**: "Save" button in `src/components/PDFViewer.jsx` (lines 184-208) calls `drawingState.savePDF(pdfDocument)` when `hasDrawings` is true. Uses semantic `<button>` element styled with inline CSS matching existing patterns.
- [x] T009 [US1] Add load-error display — **ALREADY IMPLEMENTED**: `PDFViewer.jsx` (lines 255-274) renders an error card with `AlertCircle` icon and message from `pdfDocument.error`. `usePDFViewer.js` catches load failures and sets error state.
- [ ] T010 [US1] Manual verification in extension context: load a multi-page PDF → draw on page 1 → switch to page 2 → draw → switch back → confirm both annotations persist → click Download → verify downloaded PDF contains both annotations as flat image marks

**Checkpoint**: User Story 1 is fully functional — file upload, annotation, and download work end-to-end in the extension tab

---

## Phase 4: User Story 2 - Open a PDF Already Viewed in the Browser (Priority: P2)

**Goal**: User viewing a PDF in a browser tab activates the extension; the PDF loads automatically in the extension UI without a separate file upload

**Independent Test**: Navigate to any `.pdf` URL in Chrome → click the extension toolbar icon → verify the extension tab opens with the PDF pre-loaded and ready to annotate

### Implementation for User Story 2

- [x] T011 [US2] Extend `src/background.js` with PDF tab detection: in the `onClicked` handler, (1) query the active tab (`chrome.tabs.query({ active: true, currentWindow: true })`), (2) check if `tab.url` ends with `.pdf` (case-insensitive) or matches Chrome's built-in PDF viewer URL prefix (`chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai`), (3) if PDF detected: `fetch(tab.url)` → convert to `Uint8Array` → store `{ url: tab.url, pdfBytes: Array.from(bytes), timestamp: Date.now() }` in `chrome.storage.session` under key `'tabPDFHint'`; (4) if fetch fails: store `{ url: tab.url, pdfBytes: null, timestamp: Date.now() }`; (5) open the extension tab as before
- [x] T012 [US2] Updated `src/components/PDFViewer.jsx` to read `tabPDFHint` from `chrome.storage.session` on mount with isExtension guard; hint read, cleared, bytes converted and passed to new `loadFromBytes` action in `usePDFViewer.js`
- [x] T013 [US2] Fetch fallback handled in `src/components/PDFViewer.jsx`: if `hint.pdfBytes` is null, fetches `hint.url` directly; on any failure, silently falls through to file upload prompt
- [x] T014 [US2] No-PDF-tab and stale-hint cases handled: silent fall-through to standard `PDFFileInput` file upload prompt; no changes to `PDFFileInput` component

**Checkpoint**: User Stories 1 and 2 both work independently — local upload and tab-PDF import are both functional

---

## Phase 5: User Story 3 - Copy, Paste, and Manage Annotations (Priority: P3)

**Goal**: User can copy an annotation from one page, paste it on any page, move, and delete annotations — matching existing app behavior in the extension context

**Independent Test**: Load any PDF in extension → draw on page 1 → copy annotation → navigate to page 2 → paste → confirm duplicate appears and can be moved/deleted independently

### Implementation for User Story 3

- [ ] T015 [US3] Verify existing copy/paste in `src/hooks/useDrawing.js` functions correctly in the extension tab context by manually running the independent test above; if any breakage is found, fix in `useDrawing.js` without changing the external hook interface
- [ ] T016 [US3] Verify the selection indicator (FR-011) — the contour/highlight around selected drawings added in commit e0887d9 — displays correctly in the extension tab; confirm selected state visually distinguishes the annotation; fix in the relevant canvas component if not rendering correctly
- [ ] T017 [US3] Verify annotation persistence across page navigation in extension session: draw on pages 1, 2, and 3 → navigate away from each page and back → confirm all annotations are present on all pages; fix in `usePDFViewer.js` or `DrawingContext.jsx` if state is being lost during navigation

**Checkpoint**: All three user stories are independently functional in the extension

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, offline validation, and final verification

- [ ] T018 [P] Keyboard navigation audit: verify every interactive element in the extension UI (file upload trigger, all toolbar buttons, page navigation, download button) is reachable and operable via keyboard-only navigation (Tab + Enter/Space); fix any element that relies on click-only interaction in the relevant component
- [ ] T019 Offline verification: disconnect from the internet after installing the extension → upload a local PDF → annotate → download → confirm all steps work without network access (FR-012)
- [ ] T020 [P] Add extension icon `alt` text / `aria-label` and any missing accessible labels identified in T018 to the relevant components
- [ ] T021 Run all quickstart.md verification steps end-to-end on a clean Chrome profile; confirm the extension installs, the toolbar icon appears within 2 actions, PDF loads in under 5 seconds for a 50-page document, and the downloaded PDF shows flattened annotations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T003 and T004 can run in parallel after T001
- **Foundational (Phase 2)**: Requires Phase 1 complete — T006 requires T002+T003+T004+T005 all done
- **User Stories (Phase 3–5)**: Require Phase 2 complete — can then proceed in order or in parallel
- **Polish (Phase 6)**: Requires all desired user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational — no dependency on US2 or US3
- **User Story 2 (P2)**: Starts after Foundational — no dependency on US1 or US3
- **User Story 3 (P3)**: Starts after Foundational — uses existing hooks; no dependency on US1 or US2

### Within Each User Story

- US1: T008 (download button) → T009 (error handling) → T010 (verification)
- US2: T011 (background detection) → T012 (App mount read) → T013 (fetch fallback) → T014 (no-hint fallback)
- US3: T015, T016, T017 can run in parallel (different components/hooks)
- Polish: T018, T020 can run in parallel; T019 and T021 are sequential

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel after T001+T002
- **Phase 2**: T005 and T007 can run in parallel (different files)
- **US3**: T015, T016, T017 can run in parallel (different files)
- **Polish**: T018 and T020 can run in parallel

---

## Parallel Example: User Story 2

```bash
# These can run in parallel (different files):
Task T011: "Extend src/background.js with PDF tab detection"
Task T014: "Handle no-PDF-tab case in src/App.jsx (fallback prompt)"

# Then sequentially:
Task T012: "Update src/App.jsx to read tabPDFHint on mount" (depends on T011)
Task T013: "Handle fetch fallback in src/App.jsx" (depends on T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: User Story 1 (T008–T010)
4. **STOP and VALIDATE**: Load unpacked extension → upload PDF → annotate → download → confirm
5. Ship/demo P1 MVP

### Incremental Delivery

1. Setup + Foundational → extension loads with existing UI ✓
2. User Story 1 → local file annotation + download ✓ (MVP)
3. User Story 2 → tab PDF import ✓
4. User Story 3 → copy/paste verification ✓
5. Polish → accessibility + offline validation ✓

### Parallel Team Strategy

With two developers after Foundational is complete:
- Developer A: User Story 1 (T008–T010) + User Story 3 (T015–T017)
- Developer B: User Story 2 (T011–T014)

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- [Story] label maps each task to its user story for traceability
- The existing React components (PDFViewer, DrawingCanvas, etc.) are unchanged for US1 and US3 — extension porting is additive
- The `isExtension` guard in App.jsx ensures the app continues to work with `npm run dev` (plain web context) during development
- Commit after each phase checkpoint to preserve working state
- T006 is the critical early-validation gate — if the build doesn't load correctly in Chrome, fix before proceeding to any user story
