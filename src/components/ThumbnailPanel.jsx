import React, { useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

/**
 * Thumbnail panel component for PDF page navigation
 *
 * Props:
 * - pdfDocument: { file, numPages } - Loaded PDF document
 * - currentPage: number - Currently displayed page (1-indexed)
 * - onPageSelect: function - Callback when a thumbnail is clicked
 * - onLoadSuccess: function - Callback when PDF loads
 */
export function ThumbnailPanel({ pdfDocument, currentPage, onPageSelect, onLoadSuccess }) {
  const containerRef = useRef(null);
  const currentPageRef = useRef(null);

  // Don't render if no document or document has error
  if (!pdfDocument || pdfDocument.error) {
    return null;
  }

  // Auto-scroll to current page thumbnail
  useEffect(() => {
    if (currentPageRef.current) {
      currentPageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r border-gray-300">
      {/* Thumbnail header */}
      <div className="p-3 bg-white border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-700">Pages</h3>
      </div>

      {/* Thumbnails container */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-2"
        ref={containerRef}
      >
        <Document
          file={pdfDocument.file}
          onLoadSuccess={onLoadSuccess}
          loading={<div className="text-gray-400 text-xs text-center py-2">Loading...</div>}
          error={<div className="text-red-600 text-xs text-center py-2">Error loading</div>}
        >
          {Array.from(new Array(pdfDocument.numPages), (_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <div
                key={`thumb_${pageNumber}`}
                ref={isCurrentPage ? currentPageRef : null}
                onClick={() => onPageSelect(pageNumber)}
                className={`mb-2 cursor-pointer rounded border-2 transition-all ${
                  isCurrentPage
                    ? 'border-blue-500 shadow-lg bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
                title={`Page ${pageNumber}`}
              >
                <div className="bg-white overflow-hidden">
                  <Page
                    pageNumber={pageNumber}
                    scale={0.15}
                    loading={<div className="text-gray-300 text-xs">...</div>}
                  />
                </div>
                <div className="text-center text-xs font-medium text-gray-600 py-1 bg-gray-50">
                  {pageNumber}
                </div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}
