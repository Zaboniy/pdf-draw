# Feature Specification: PDF Drawing Tool

**Feature Branch**: `003-pdf-drawing`
**Created**: 2026-04-07
**Status**: Draft
**Input**: User description: "draw option should be added to the viewer, it should be simple pen with selecting color, width of the line. Capability to draw on pdf pages should be added"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Activate Drawing Mode (Priority: P1)

Users need to toggle a drawing mode on and off to begin and end annotation of PDF pages. This is the foundational capability that enables all drawing functionality.

**Why this priority**: Core feature - without the ability to activate drawing mode, no drawing can occur. This is MVP critical.

**Independent Test**: Can be fully tested by clicking the draw button to enter drawing mode, verifying visual feedback, then clicking again to exit. Delivers the ability to control when drawing is active.

**Acceptance Scenarios**:

1. **Given** a PDF is loaded, **When** the user clicks the draw tool button, **Then** drawing mode activates with visual feedback (button highlight, cursor change)
2. **Given** drawing mode is active, **When** the user clicks the draw tool button again, **Then** drawing mode deactivates and normal navigation resumes

---

### User Story 2 - Draw Freehand Lines (Priority: P1)

Users need to draw freehand lines on PDF pages when in drawing mode. This is the core drawing functionality that makes the feature functional.

**Why this priority**: Without drawing capability, the entire feature is unusable. This is critical to MVP.

**Independent Test**: Can be fully tested by entering drawing mode, clicking and dragging on the PDF page, and verifying visible lines appear where drawn.

**Acceptance Scenarios**:

1. **Given** drawing mode is active, **When** the user clicks and drags on the PDF page, **Then** a line is drawn following the cursor
2. **Given** a line has been drawn, **When** the user draws additional lines, **Then** all lines are preserved and visible
3. **Given** drawing mode is active, **When** the user draws near page edges, **Then** lines stay within PDF page boundaries

---

### User Story 3 - Select Drawing Color (Priority: P1)

Users need to choose the color of their pen strokes to differentiate different types of markups and annotations on PDFs.

**Why this priority**: Color selection is essential for meaningful annotation - enables users to use different colors for different purposes. Critical to feature usability.

**Independent Test**: Can be fully tested by opening the color picker, selecting a color, drawing a line, and verifying the correct color is applied.

**Acceptance Scenarios**:

1. **Given** drawing mode is active, **When** the user opens the color selector, **Then** predefined color options are displayed
2. **Given** the color selector is open, **When** the user selects a color, **Then** the selector closes and new lines are drawn in that color
3. **Given** lines of different colors exist, **When** the user selects a new color, **Then** only new lines use the new color; existing lines keep their original color

---

### User Story 4 - Adjust Line Width (Priority: P2)

Users need to control the thickness of their pen strokes to emphasize important areas and create varied visual effects in their annotations.

**Why this priority**: Enhances drawing capability beyond basic functionality. Important for usability but secondary to core drawing.

**Independent Test**: Can be fully tested by selecting different line widths and verifying visibly different line thicknesses in drawn strokes.

**Acceptance Scenarios**:

1. **Given** drawing mode is active, **When** the user opens the line width selector, **Then** width options are displayed
2. **Given** a width is selected, **When** the user draws lines, **Then** all new lines use the selected width
3. **Given** lines of different widths exist, **When** the user selects a new width, **Then** only new lines use the new width

---

### User Story 5 - Persist Drawings Across Interactions (Priority: P2)

Users expect their drawn annotations to remain on the PDF as they interact with the viewer (zoom, scroll, page navigation), ensuring their annotation work is not lost.

**Why this priority**: Essential for usability - prevents data loss. Secondary only to core drawing functionality.

**Independent Test**: Can be fully tested by drawing lines, performing viewer interactions (zoom, page change), and verifying drawings remain visible and in correct positions.

**Acceptance Scenarios**:

1. **Given** drawings exist on a page, **When** the user zooms in or out, **Then** the drawings remain visible and properly scaled
2. **Given** drawings exist on a page, **When** the user switches view modes or pages, **Then** the drawings persist on their page

---

### User Story 6 - Draw in Book View Mode (Priority: P2)

Users need to draw annotations in Book View mode where multiple pages are visible in continuous scroll, with clear automatic detection of which page is being drawn on.

**Why this priority**: Extends drawing capability to Book View; secondary to core drawing but important for feature completeness.

**Independent Test**: Can be fully tested by entering Book View, positioning cursor over different pages, drawing, and verifying strokes appear only on the intended page based on cursor position.

**Acceptance Scenarios**:

1. **Given** Book View is active with multiple pages visible, **When** the user positions cursor over a page and draws, **Then** the stroke is drawn on the detected page only
2. **Given** multiple pages are visible in Book View, **When** the user draws near a page boundary, **Then** the system correctly detects which page the cursor is over and draws on that page
3. **Given** a user has drawn on one page in Book View, **When** they scroll to another page and draw, **Then** the new stroke appears on the newly selected page

### Edge Cases

- What happens when a user attempts to draw outside the PDF page boundaries? (Should be constrained to page area)
- How does the system handle extremely rapid drawing movements? (Should respond smoothly without lag or dropped strokes)
- What happens when a user draws on a rotated PDF page? (Drawings should follow page orientation)
- What happens when users switch between Single Page and Book View with active drawings? (Drawings should persist)
- How does the system handle drawing on pages with complex layouts or images? (Drawings should appear as overlay without affecting page content)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a draw tool button in the viewer interface to toggle drawing mode on/off
- **FR-002**: System MUST allow users to draw freehand lines on PDF pages when drawing mode is active
- **FR-003**: System MUST provide a color selector with at least 8 predefined colors for pen strokes
- **FR-004**: System MUST apply the selected color to all new strokes drawn after color selection
- **FR-005**: System MUST provide a line width selector with at least 3 width options
- **FR-006**: System MUST apply the selected line width to all new strokes drawn after width selection
- **FR-007**: System MUST display all drawn lines with proper positioning and scaling relative to the PDF page
- **FR-008**: System MUST prevent drawn lines from extending outside the PDF page boundaries
- **FR-009**: System MUST preserve all drawn lines when switching between Single Page and Book View modes
- **FR-010**: System MUST preserve all drawn lines on a page when navigating between PDF pages
- **FR-011**: System MUST clear drawings when the user navigates to a different PDF page (each page has independent drawing layer)
- **FR-012**: System MUST provide visual feedback indicating when drawing mode is active
- **FR-013**: System MUST provide visual feedback showing the currently selected color and line width
- **FR-014**: System MUST support unlimited undo of drawing actions (strokes, color changes, width changes)
- **FR-015**: System MUST support redo of undone drawing actions
- **FR-016**: Users MUST be able to undo/redo drawing actions using keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y for redo)
- **FR-017**: Drawing mode toggle MUST be accessible via button click; no keyboard shortcut is required for toggling drawing mode
- **FR-018**: System MUST support drawing in Book View mode with automatic page detection based on cursor position
- **FR-019**: System MUST correctly identify which page the cursor is over when multiple pages are visible in Book View
- **FR-020**: System MUST only apply drawing strokes to the detected page; strokes must not cross page boundaries even when cursor moves rapidly

### Key Entities

- **Stroke**: Individual line drawn by user, containing color, width, and sequence of coordinates
- **Drawing Layer**: Collection of all strokes on a single PDF page
- **Color Palette**: Set of predefined colors available for user selection

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can activate/deactivate drawing mode with a single click and receive immediate visual feedback
- **SC-002**: Users can draw visible lines on PDF pages with real-time output as they drag the cursor
- **SC-003**: Color selector displays at least 8 distinct colors and applies selected color to new strokes within 100ms
- **SC-004**: Line width selector displays at least 3 width options and applies selected width to new strokes within 100ms
- **SC-005**: Drawings remain visible and correctly positioned when switching between view modes (Single Page/Book View)
- **SC-006**: Drawing strokes do not extend beyond PDF page boundaries
- **SC-007**: Drawing interface is intuitive enough that users can begin drawing within 30 seconds of first interaction
- **SC-008**: Users can undo and redo drawing actions within 100ms per action
- **SC-009**: Undo/redo history persists for the duration of the editing session on each page
- **SC-010**: In Book View, system accurately detects page boundaries and applies strokes to the correct page with 95%+ accuracy at page edges

## Clarifications

### Session 2026-04-07

- Q: Should users be able to undo or delete individual strokes? → A: Support unlimited undo/redo stack for all drawing actions
- Q: In Book View with multiple pages visible, how should drawing work? → A: Automatic page detection based on cursor position
- Q: Should there be a keyboard shortcut to toggle drawing mode on/off? → A: No keyboard shortcut required; drawing mode toggle via button click only

## Assumptions

- Users have mouse or trackpad with click-and-drag capability (stylus/pen input support is out of scope for v1)
- Drawing operates in session memory only; persistence beyond the current session is out of scope for v1
- Each PDF page maintains its own independent drawing layer; drawings do not carry over between pages
- Predefined color palette includes standard markup colors (red, blue, green, yellow, orange, purple, black, white)
- Line width options presented as Thin (1-2px), Medium (3-4px), and Thick (5-6px) for visual clarity
- The existing PDF rendering and page navigation infrastructure supports drawing overlay without major modification
- Drawing feature is intended as a simple annotation tool, not a professional design application
- Both Single Page View and Book View modes support drawing on visible page content
- Unlimited undo/redo stack is maintained per page to allow users to recover from mistakes and experiment freely
- In Book View mode, automatic page detection uses cursor position to determine which page receives drawing input
- Page boundaries are clearly detectable from the PDF rendering layer for reliable hit detection
- Drawing mode toggle is controlled by button click only; no keyboard shortcut is required for simplicity
