import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

/**
 * Book view component for continuous scrolling through all pages
 *
 * Props:
 * - pdfDocument: { file: Blob, numPages: number, ... } - Loaded PDF document
 * - zoomLevel: number - Scale factor (e.g., 1.0 = 100%)
 * - onNumPagesChange: function - Callback when number of pages is loaded
 */
export function BookView({ pdfDocument, zoomLevel, onNumPagesChange }) {
  // Don't render if no document or document has error
  if (!pdfDocument || pdfDocument.error) {
    return null;
  }

  const onLoadSuccess = (pdf) => {
    if (onNumPagesChange) {
      onNumPagesChange(pdf.numPages);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-100 min-h-screen">
      <div>
        <Document
          file={pdfDocument.file}
          onLoadSuccess={onLoadSuccess}
          loading={<div className="text-gray-500 text-center py-4">Loading PDF...</div>}
          error={<div className="text-red-600 text-center py-4">Failed to load PDF</div>}
        >
          {Array.from(new Array(pdfDocument.numPages), (_, i) => (
            <div key={`page_${i + 1}`} className="mb-4 shadow-md">
              <Page
                pageNumber={i + 1}
                scale={zoomLevel}
                loading={<div className="text-gray-500 text-center py-2">Rendering page...</div>}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
