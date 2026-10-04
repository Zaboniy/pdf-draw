import React, { useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useDrawingContext } from './DrawingContext';
import { drawStroke } from '../utils/drawingUtils';

const THUMBNAIL_SCALE = 0.18;

/**
 * Single thumbnail: renders the PDF page plus an overlay canvas showing
 * that page's drawings, scaled down from the main view's zoom level.
 */
function ThumbnailPage({ pageNumber, isCurrentPage, zoomLevel, onSelect, registerCurrentRef }) {
  const drawingContext = useDrawingContext();
  const pageContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const strokes = drawingContext.getStrokesForPage(pageNumber);

  const syncCanvas = () => {
    const pageEl = pageContainerRef.current?.querySelector('.react-pdf__Page');
    const canvas = canvasRef.current;
    if (!pageEl || !canvas) return;

    canvas.width = pageEl.offsetWidth;
    canvas.height = pageEl.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Strokes are stored in canvas-pixel coordinates at the main view's zoom level
    const scale = THUMBNAIL_SCALE / zoomLevel;
    ctx.save();
    ctx.scale(scale, scale);
    strokes.forEach((stroke) => drawStroke(ctx, stroke.points, stroke.color, stroke.width));
    ctx.restore();
  };

  useEffect(() => {
    syncCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, zoomLevel]);

  return (
    <div
      ref={isCurrentPage ? registerCurrentRef : null}
      onClick={onSelect}
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
        <div style={{ position: 'relative' }} ref={pageContainerRef}>
          <Page
            pageNumber={pageNumber}
            scale={THUMBNAIL_SCALE}
            onRenderSuccess={syncCanvas}
            loading={<div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>...</div>}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          />
        </div>
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
}

/**
 * Thumbnail panel component for PDF page navigation
 *
 * Props:
 * - pdfDocument: { file, numPages } - Loaded PDF document
 * - currentPage: number - Currently displayed page (1-indexed)
 * - zoomLevel: number - Main view's current zoom level (strokes are stored at this scale)
 * - onPageSelect: function - Callback when a thumbnail is clicked
 * - onLoadSuccess: function - Callback when PDF loads
 */
export function ThumbnailPanel({ pdfDocument, currentPage, zoomLevel = 1.0, onPageSelect, onLoadSuccess }) {
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
              <ThumbnailPage
                key={`thumb_${pageNumber}`}
                pageNumber={pageNumber}
                isCurrentPage={isCurrentPage}
                zoomLevel={zoomLevel}
                onSelect={() => onPageSelect(pageNumber)}
                registerCurrentRef={currentPageRef}
              />
            );
          })}
        </Document>
      </div>
    </div>
  );
}
