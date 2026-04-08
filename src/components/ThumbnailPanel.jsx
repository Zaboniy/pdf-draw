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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-sidebar)',
      borderRight: `1px solid var(--border)`,
    }}>
      {/* Thumbnail header */}
      <div style={{
        padding: '0.75rem',
        background: 'var(--bg-surface)',
        borderBottom: `1px solid var(--border)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          Pages
        </h3>
        <span style={{
          background: 'var(--accent-light)',
          color: 'var(--accent)',
          padding: '0.125rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {pdfDocument.numPages}
        </span>
      </div>

      {/* Thumbnails container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.5rem',
        }}
        ref={containerRef}
      >
        <Document
          file={pdfDocument.file}
          onLoadSuccess={onLoadSuccess}
          loading={<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>Loading...</div>}
          error={<div style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>Error</div>}
        >
          {Array.from(new Array(pdfDocument.numPages), (_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <div
                key={`thumb_${pageNumber}`}
                ref={isCurrentPage ? currentPageRef : null}
                onClick={() => onPageSelect(pageNumber)}
                style={{
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  border: isCurrentPage ? `3px solid var(--accent)` : `1px solid var(--border)`,
                  transition: 'all 200ms ease',
                  background: isCurrentPage ? 'var(--accent-light)' : 'transparent',
                  boxShadow: isCurrentPage ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={`Page ${pageNumber}`}
              >
                <div style={{
                background: 'var(--bg-surface)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '140px',
              }}>
                  <Page
                    pageNumber={pageNumber}
                    scale={0.18}
                    loading={<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>...</div>}
                  />
                </div>
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isCurrentPage ? 'var(--accent)' : 'var(--text-secondary)',
                  padding: '0.25rem',
                  background: isCurrentPage ? 'var(--accent-light)' : 'var(--bg-sidebar)',
                }}>
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
