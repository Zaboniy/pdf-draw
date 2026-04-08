import React, { useRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { DrawingCanvas } from './DrawingCanvas';
import { useDrawingContext } from './DrawingContext';
import { DrawingErrorBoundary } from './DrawingErrorBoundary';

/**
 * PDF page rendering component using react-pdf
 *
 * Props:
 * - pdfDocument: { file: Blob, numPages: number, ... } - Loaded PDF document
 * - currentPage: number - Current page number (1-indexed)
 * - zoomLevel: number - Scale factor (e.g., 1.0 = 100%)
 * - onNumPagesChange: function - Callback when number of pages is loaded
 */
export function PDFCanvas({ pdfDocument, currentPage, zoomLevel, onNumPagesChange }) {
  const drawingContext = useDrawingContext();
  const containerRef = useRef(null);

  // Don't render if no document or document has error
  if (!pdfDocument || pdfDocument.error) {
    return null;
  }

  const onLoadSuccess = (pdf) => {
    if (onNumPagesChange) {
      onNumPagesChange(pdf.numPages);
    }
  };

  // Update drawing context when page changes
  // Use useLayoutEffect to ensure setCurrentPage runs before render
  React.useLayoutEffect(() => {
    drawingContext.setCurrentPage(currentPage);
  }, [currentPage, drawingContext]);

  const handleStrokeEnd = (points, color, width) => {
    drawingContext.addStroke(points, color, width);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      background: 'var(--bg-canvas)',
      minHeight: 'calc(100vh - 8rem)',
      overflow: 'auto',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ position: 'relative' }} ref={containerRef}>
        <Document
          file={pdfDocument.file}
          onLoadSuccess={onLoadSuccess}
          loading={<div className="text-gray-500">Loading PDF...</div>}
          error={<div className="text-red-600">Failed to load PDF</div>}
        >
          <Page
            key={`page_${currentPage}`}
            pageNumber={currentPage}
            scale={zoomLevel}
            loading={<div className="text-gray-500">Rendering page...</div>}
          />
        </Document>
        <DrawingErrorBoundary>
          <DrawingCanvas
            isEnabled={drawingContext.isDrawingEnabled}
            isSelectEnabled={drawingContext.isSelectEnabled}
            strokes={drawingContext.getStrokesForPage(currentPage)}
            selectedStrokeId={drawingContext.selectedStrokeId}
            onStrokeEnd={handleStrokeEnd}
            onSelectStroke={drawingContext.selectStroke}
            onMoveStroke={drawingContext.moveStroke}
            findStrokeAtPosition={drawingContext.findStrokeAtPosition}
            currentColor={drawingContext.currentColor}
            currentWidth={drawingContext.currentWidth}
            containerRef={containerRef}
          />
        </DrawingErrorBoundary>
      </div>
    </div>
  );
}
