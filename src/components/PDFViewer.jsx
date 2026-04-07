import React, { useRef, useEffect } from 'react';
import { usePDFViewer } from '../hooks/usePDFViewer';
import { useDrawing } from '../hooks/useDrawing';
import { PDFFileInput } from './PDFFileInput';
import { PDFCanvas } from './PDFCanvas';
import { PDFPageNav } from './PDFPageNav';
import { BookView } from './BookView';
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

  // Handle scroll wheel and keyboard navigation (single page view only)
  useEffect(() => {
    if (!pdfDocument || pdfDocument.error || pdfDocument.numPages <= 1) return;
    if (viewerState.viewMode === 'book') return; // Skip navigation in book view
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
  }, [pdfDocument, viewerState.viewMode, actions, drawingState.isDrawingEnabled]);

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
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with file input and view mode toggle */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <PDFFileInput
                  onSelect={actions.selectFile}
                  isLoading={viewerState.isLoading}
                  error={viewerState.error}
                />
              </div>
              {pdfDocument && !pdfDocument.error && (
                <button
                  onClick={actions.toggleViewMode}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                  title={viewerState.viewMode === 'single' ? 'Switch to book view' : 'Switch to single page view'}
                >
                  {viewerState.viewMode === 'single' ? '📖 Book View' : '📄 Single Page'}
                </button>
              )}
            </div>
            {pdfDocument && !pdfDocument.error && (
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
            )}
          </div>
        </header>

      {/* Main content area */}
      {pdfDocument && !pdfDocument.error ? (
        <>
          {/* Render based on view mode */}
          {viewerState.viewMode === 'single' ? (
            <>
              {/* Single Page View - scrollable container */}
              <div ref={containerRef} className="flex-1 overflow-auto">
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
            </>
          ) : (
            <>
              {/* Book View - continuous scrolling */}
              <div ref={containerRef} className="flex-1 overflow-auto">
                <BookView
                  pdfDocument={pdfDocument}
                  zoomLevel={viewerState.zoomLevel}
                  onNumPagesChange={actions.setNumPages}
                />
              </div>
            </>
          )}
        </>
      ) : pdfDocument?.error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading PDF</h2>
            <p className="text-gray-600">{pdfDocument.error}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">No PDF Loaded</h2>
            <p className="text-gray-500">Select a file to view</p>
          </div>
        </div>
      )}
      </div>
    </DrawingProvider>
  );
}
