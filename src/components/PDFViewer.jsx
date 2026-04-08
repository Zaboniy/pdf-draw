import React, { useRef, useEffect } from 'react';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { usePDFViewer } from '../hooks/usePDFViewer';
import { useDrawing } from '../hooks/useDrawing';
import { PDFFileInput } from './PDFFileInput';
import { PDFCanvas } from './PDFCanvas';
import { PDFPageNav } from './PDFPageNav';
import { ThumbnailPanel } from './ThumbnailPanel';
import { DrawingToolbar } from './DrawingToolbar';
import { DrawingProvider } from './DrawingContext';

/**
 * Main PDF viewer component
 *
 * Manages PDF document state, coordinates child components, and provides
 * scroll and keyboard navigation support for page changes
 */
export function PDFViewer() {
  const { pdfDocument, viewerState, actions } = usePDFViewer();
  const drawingState = useDrawing();
  const containerRef = useRef(null);

  // Handle scroll wheel and keyboard navigation
  useEffect(() => {
    if (!pdfDocument || pdfDocument.error || pdfDocument.numPages <= 1) return;
    if (drawingState.isDrawingEnabled) return; // Skip navigation when drawing mode is active

    const container = containerRef.current;
    if (!container) return;

    // Handle mouse wheel scrolling
    const handleWheel = (e) => {
      // Only handle scrolling if we're at the top or bottom of the container
      const isAtTop = container.scrollTop === 0;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;

      if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
        e.preventDefault();
        if (e.deltaY > 0) {
          actions.goNextPage();
        } else {
          actions.goPreviousPage();
        }
      }
    };

    // Handle keyboard navigation (arrow keys)
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        actions.goNextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actions.goPreviousPage();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [pdfDocument, actions, drawingState.isDrawingEnabled]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        drawingState.undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        drawingState.redo();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [drawingState]);

  return (
    <DrawingProvider drawingState={drawingState}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-app)' }}>
        {/* Modern Header */}
        <header style={{
          background: 'var(--bg-surface)',
          borderBottom: `1px solid var(--border)`,
          padding: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          {/* Left: App name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              📄
            </div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              PDF Sign
            </h1>
          </div>

          {/* Center: File input and toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            {pdfDocument && !pdfDocument.error && (
              <>
                <PDFFileInput
                  onSelect={actions.selectFile}
                  isLoading={viewerState.isLoading}
                  error={viewerState.error}
                  fileName={pdfDocument?.fileName}
                  showButton={true}
                />
                <div style={{ width: '1px', height: '1.5rem', background: 'var(--border)' }} />
              </>
            )}
            {(!pdfDocument || pdfDocument.error) && (
              <PDFFileInput
                onSelect={actions.selectFile}
                isLoading={viewerState.isLoading}
                error={viewerState.error}
                fileName={null}
                showButton={false}
              />
            )}
            {pdfDocument && !pdfDocument.error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DrawingToolbar
                  isDrawingEnabled={drawingState.isDrawingEnabled}
                  onToggleDrawing={drawingState.toggleDrawing}
                  currentColor={drawingState.currentColor}
                  onColorChange={drawingState.setCurrentColor}
                  currentWidth={drawingState.currentWidth}
                  onWidthChange={drawingState.setCurrentWidth}
                  canUndo={drawingState.canUndo}
                  canRedo={drawingState.canRedo}
                  onUndo={drawingState.undo}
                  onRedo={drawingState.redo}
                  onClearPage={drawingState.clearPage}
                />
              </div>
            )}
          </div>

          {/* Right: Save button */}
          {pdfDocument && !pdfDocument.error && drawingState.hasDrawings && (
            <button
              onClick={() => {
                drawingState.savePDF(pdfDocument);
              }}
              style={{
                background: 'var(--success)',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 500,
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
              title="Save PDF with drawings"
            >
              <Save size={16} />
              Save
            </button>
          )}
        </header>

      {/* Main content area with thumbnails sidebar */}
      {pdfDocument && !pdfDocument.error ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Thumbnail sidebar */}
          <div style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <ThumbnailPanel
              pdfDocument={pdfDocument}
              currentPage={viewerState.currentPage}
              onPageSelect={actions.goToPage}
              onLoadSuccess={(pdf) => {
                if (actions.setNumPages) {
                  actions.setNumPages(pdf.numPages);
                }
              }}
            />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Single Page View - scrollable container */}
            <div ref={containerRef} style={{ flex: 1, overflow: 'auto' }}>
              <PDFCanvas
                pdfDocument={pdfDocument}
                currentPage={viewerState.currentPage}
                zoomLevel={viewerState.zoomLevel}
                onNumPagesChange={actions.setNumPages}
              />
            </div>
            {/* Page Navigation Footer */}
            {pdfDocument.numPages > 0 && (
              <PDFPageNav
                currentPage={viewerState.currentPage}
                totalPages={pdfDocument.numPages}
                onPreviousPage={actions.goPreviousPage}
                onNextPage={actions.goNextPage}
                onGoToPage={actions.goToPage}
              />
            )}
          </div>
        </div>
      ) : pdfDocument?.error ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem' }}>
          <div style={{
            background: 'var(--danger-light)',
            border: `1px solid #fecaca`,
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertCircle size={40} color="var(--danger)" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--danger)', margin: '0.5rem 0' }}>
              Error Loading PDF
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
              {pdfDocument.error}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileText size={48} color="var(--text-muted)" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0.5rem 0' }}>
              No PDF Loaded
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
              Select a PDF file to get started
            </p>
            <button
              onClick={() => document.querySelector('input[type="file"]').click()}
              style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.target.style.background = 'var(--accent)')}
            >
              Open PDF
            </button>
          </div>
        </div>
      )}
      </div>
    </DrawingProvider>
  );
}
