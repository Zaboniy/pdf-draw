# pdf-sign Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-08-05

## Active Technologies
- JavaScript ES6+ (React 18+) + React, react-pdf, pdfjs-dist, Tailwind CSS, Canvas API (003-pdf-drawing)
- Session memory (in-browser state; no persistence beyond current session) (003-pdf-drawing)
- JavaScript ES6+ (no TypeScript — per constitution) + React 19, Vite 8, pdfjs-dist 5, pdf-lib 1.17, Tailwind CSS 4, lucide-react; new dev dependency: `vite-plugin-web-extension` (004-chrome-extension-port)
- None (session-only in-memory state; no IndexedDB or localStorage persistence) (004-chrome-extension-port)

- JavaScript ES6+, React 18+ + react-pdf (pdf.js wrapper), React Router (if multi-page app needed) (001-open-view-pdf)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript ES6+, React 18+: Follow standard conventions

## Recent Changes
- 004-chrome-extension-port: Added JavaScript ES6+ (no TypeScript — per constitution) + React 19, Vite 8, pdfjs-dist 5, pdf-lib 1.17, Tailwind CSS 4, lucide-react; new dev dependency: `vite-plugin-web-extension`
- 003-pdf-drawing: Added JavaScript ES6+ (React 18+) + React, react-pdf, pdfjs-dist, Tailwind CSS, Canvas API

- 001-open-view-pdf: Added JavaScript ES6+, React 18+ + react-pdf (pdf.js wrapper), React Router (if multi-page app needed)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
