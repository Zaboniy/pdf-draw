import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
    <div className="flex justify-center items-center p-4 bg-gray-100 min-h-[calc(100vh-8rem)] overflow-auto">
      <div>
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
      </div>
    </div>
  );
}
