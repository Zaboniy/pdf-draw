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
    <div className="flex justify-center items-center p-4 bg-gray-100 min-h-[calc(100vh-8rem)] overflow-auto">
      <div className="relative" ref={containerRef}>
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
            strokes={drawingContext.getStrokesForPage(currentPage)}
            onStrokeEnd={handleStrokeEnd}
            currentColor={drawingContext.currentColor}
            currentWidth={drawingContext.currentWidth}
            containerRef={containerRef}
          />
        </DrawingErrorBoundary>
      </div>
    </div>
  );
}
