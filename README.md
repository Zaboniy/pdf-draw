# PDF Sign

A Chrome extension (MV3) for viewing and annotating PDFs — freehand drawing, selection, copy/paste, and thumbnail navigation, all client-side.

## Features

- **PDF Viewing**: Open a PDF via file picker, or from the active browser tab when launched as an extension
- **Drawing Annotation**: Freehand strokes with 8 colors and 3 line widths
- **Select / Move / Copy / Paste**: Select a stroke (highlighted with a contour), drag to reposition, copy and paste across pages
- **Undo/Redo**: Unlimited per-page history (Ctrl+Z / Ctrl+Y)
- **Thumbnail Panel**: Page thumbnails with drawing overlays and click-to-jump navigation
- **Multi-page Support**: Each page maintains an independent drawing layer

## Getting Started

### Installation

```bash
npm install
```

### Running as a Web App

```bash
npm run dev
```

### Building the Extension

```bash
npm run build
```

Then in Chrome: go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `dist/` folder.

Click the toolbar icon to open the viewer in a new tab. If the active tab is showing a PDF, its bytes are pre-fetched by the service worker and handed to the viewer automatically.

## Usage

### Loading a PDF
1. Click the file input in the header, or
2. Open the extension while a PDF is the active tab — it loads automatically

### Drawing
1. Click **Draw** to activate drawing mode
2. Click and drag on the page to draw a freehand stroke
3. Use the toolbar to pick color, line width, undo/redo, or clear the page

### Selecting, Moving, Copying
1. Click a stroke to select it (shown with a contour)
2. Drag to reposition
3. Ctrl+C / Ctrl+V to copy and paste onto the current page

### Navigation
- Arrow keys / scroll to move between pages
- Click a thumbnail in the side panel to jump to that page

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+C | Copy selected stroke |
| Ctrl+V | Paste stroke |
| Arrow Right / Space | Next page |
| Arrow Left | Previous page |

## Project Structure

```
src/
├── background.js                  # MV3 service worker: detects active-tab PDFs, pre-fetches bytes
├── components/
│   ├── App.jsx                    # Root component
│   ├── PDFViewer.jsx              # Main viewer, tab-hint handling, keyboard shortcuts
│   ├── PDFCanvas.jsx              # Single page PDF renderer
│   ├── PDFFileInput.jsx           # File upload input
│   ├── PDFPageNav.jsx             # Page navigation controls
│   ├── ThumbnailPanel.jsx         # Page thumbnails with drawing overlays
│   ├── DrawingCanvas.jsx          # Canvas overlay for drawing/selection
│   ├── DrawingContext.jsx         # React Context for drawing state
│   ├── DrawingErrorBoundary.jsx   # Error boundary for drawing
│   ├── DrawingToolbar.jsx         # Drawing controls toolbar
│   ├── ColorPicker.jsx            # Color selection dropdown
│   └── LineWidthSelector.jsx      # Line width selection dropdown
├── hooks/
│   ├── useDrawing.js              # Drawing/selection/copy-paste state management
│   └── usePDFViewer.js            # PDF document + page state, extension byte loading
└── utils/
    └── drawingUtils.js            # Canvas rendering utilities
```

## Technical Stack

- **Frontend**: React 19, ES6+ JavaScript (no TypeScript)
- **Build**: Vite 8, vite-plugin-web-extension
- **PDF Rendering**: react-pdf / pdfjs-dist
- **PDF Writing**: pdf-lib
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Extension**: Manifest V3

## Persistence

Session-only, in-memory state — drawings do not persist across page reloads or beyond the current session.

## Known Limitations

- No save/export of annotated PDFs yet
- No persistence across reloads
- Stylus/pen input optimization out of scope

## License

[Add your license here]
