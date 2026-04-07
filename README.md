# PDF Viewer with Drawing Annotation Tool

A React-based PDF viewer with integrated drawing and annotation capabilities. Supports both single-page and continuous book view modes with full undo/redo functionality.

## Features

### Core Features
- **PDF Viewing**: Display PDF documents in single-page or book view modes
- **Drawing Annotation**: Draw freehand lines and annotations directly on PDF pages
- **Color Selection**: Choose from 8 predefined colors (Red, Blue, Green, Yellow, Orange, Purple, Black, White)
- **Line Width Control**: Select from 3 preset line widths (Thin, Medium, Thick)
- **Undo/Redo**: Unlimited undo/redo history with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Multi-page Support**: Each PDF page maintains independent drawing layers

### Viewing Modes
- **Single Page View**: View one page at a time with navigation controls
- **Book View**: Continuous scrolling through all pages with automatic page navigation
- **Drawing in All Modes**: Draw annotations in both single-page and book view modes

## Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

The application will start on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

### Loading a PDF
1. Click on the file input field in the header
2. Select a PDF file from your computer
3. The PDF will load and display

### Drawing on PDF Pages
1. Click the **Draw** button to activate drawing mode (button will highlight in blue)
2. Click and drag on the PDF to draw freehand lines
3. Use the toolbar to:
   - **Select Color**: Click the color button to choose a pen color
   - **Select Width**: Click the width button to adjust line thickness
   - **Undo/Redo**: Use the ↶ and ↷ buttons or press Ctrl+Z / Ctrl+Y
   - **Clear Page**: Click the 🗑️ button to erase all drawings on current page

### Navigation
- **Single Page View**: Use arrow keys or scroll wheel to move between pages
- **Book View**: Scroll to navigate through pages
- **View Mode**: Click the view mode button (📖 Book View / 📄 Single Page) to switch modes

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo last drawing action |
| Ctrl+Y | Redo last undone action |
| Arrow Right / Space | Next page (single page view) |
| Arrow Left | Previous page (single page view) |

## Project Structure

```
src/
├── components/
│   ├── DrawingCanvas.jsx          # Canvas overlay for drawing
│   ├── DrawingContext.jsx         # React Context for drawing state
│   ├── DrawingErrorBoundary.jsx   # Error boundary for drawing
│   ├── DrawingToolbar.jsx         # Drawing controls toolbar
│   ├── ColorPicker.jsx            # Color selection dropdown
│   ├── LineWidthSelector.jsx      # Line width selection dropdown
│   ├── PDFCanvas.jsx              # Single page PDF renderer
│   ├── BookView.jsx               # Book view PDF renderer
│   ├── PDFViewer.jsx              # Main viewer component
│   ├── PDFFileInput.jsx           # File upload input
│   ├── PDFPageNav.jsx             # Page navigation controls
│   └── App.jsx                    # Root component
├── hooks/
│   ├── useDrawing.js              # Drawing state management hook
│   └── usePDFViewer.js            # PDF viewer state hook
├── utils/
│   ├── drawingUtils.js            # Canvas rendering utilities
│   └── ...
└── styles/
    ├── drawing.css                # Drawing component styles
    └── ...
```

## Technical Stack

- **Frontend**: React 18+, ES6+ JavaScript
- **PDF Rendering**: react-pdf with pdfjs-dist
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas API for drawing
- **State Management**: React Hooks (useState, useRef, useContext)

## Features & Capabilities

### Drawing
- Real-time stroke rendering as you draw
- Smooth line drawing with anti-aliasing
- Multiple stroke support (draw multiple lines on same page)
- Touch and mouse input support

### Undo/Redo
- Per-page unlimited undo/redo stacks
- Memory-efficient state management
- Keyboard shortcut support (Ctrl+Z/Y)

### Persistence
- Session-based drawing persistence (data persists during current session)
- Per-page drawing layers (each page has independent drawing state)
- Drawings persist when switching between view modes

### Book View
- Automatic page detection based on cursor position
- Draw annotations across multiple visible pages
- Continuous scrolling with drawing support

## Accessibility

- Semantic HTML (proper button elements, ARIA labels)
- Keyboard navigation support
- Focus states for all interactive elements
- Color-independent visual feedback

## Browser Support

Tested and working in:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Known Limitations

- Drawing persistence is session-only (no save to file)
- Drawing does not persist after page reload
- Stylus/pen input optimization is out of scope for v1
- Professional design features (layers, gradients, etc.) are out of scope

## Future Enhancements

- Export drawings as image or PDF
- Permanent drawing persistence (save/load)
- Drawing layers and transparency
- Freeform shapes and text annotations
- Drawing eraser tool
- Customizable color palette

## License

[Add your license here]
