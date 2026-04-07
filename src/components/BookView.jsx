import React, { useRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { DrawingCanvas } from './DrawingCanvas';
import { useDrawingContext } from './DrawingContext';
import { detectPageAtCursor } from '../utils/drawingUtils';
import { DrawingErrorBoundary } from './DrawingErrorBoundary';

/**
 * Book view component for continuous scrolling through all pages
 *
 * Props:
 * - pdfDocument: { file: Blob, numPages: number, ... } - Loaded PDF document
 * - zoomLevel: number - Scale factor (e.g., 1.0 = 100%)
 * - onNumPagesChange: function - Callback when number of pages is loaded
 */
export function BookView({ pdfDocument, zoomLevel, onNumPagesChange }) {
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

  const handleStrokeEnd = (points, color, width) => {
    // Detect which page the stroke was drawn on
    if (containerRef.current) {
      // For Book View, we need to detect the page based on the canvas position
      // Get the canvas element and detect which page it's over
      const canvas = containerRef.current.querySelector('canvas.drawing-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const detectedPage = detectPageAtCursor(centerX, centerY, containerRef.current);

        if (detectedPage) {
          drawingContext.setCurrentPage(detectedPage);
        }
      }
    }

    drawingContext.addStroke(points, color, width);
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-100 min-h-screen relative" ref={containerRef}>
      <div className="relative">
        <Document
          file={pdfDocument.file}
          onLoadSuccess={onLoadSuccess}
          loading={<div className="text-gray-500 text-center py-4">Loading PDF...</div>}
          error={<div className="text-red-600 text-center py-4">Failed to load PDF</div>}
        >
          {Array.from(new Array(pdfDocument.numPages), (_, i) => (
            <div key={`page_${i + 1}`} className="mb-4 shadow-md" data-page-number={i + 1}>
              <Page
                pageNumber={i + 1}
                scale={zoomLevel}
                loading={<div className="text-gray-500 text-center py-2">Rendering page...</div>}
              />
            </div>
          ))}
        </Document>
        {containerRef.current && (
          <DrawingErrorBoundary>
            <DrawingCanvas
              isEnabled={drawingContext.isDrawingEnabled}
              strokes={drawingContext.getCurrentStrokes()}
              onStrokeEnd={handleStrokeEnd}
              currentColor={drawingContext.currentColor}
              currentWidth={drawingContext.currentWidth}
              containerRef={containerRef}
            />
          </DrawingErrorBoundary>
        )}
      </div>
    </div>
  );
}
