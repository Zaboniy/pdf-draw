import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PDF page navigation component
 *
 * Props:
 * - currentPage: number - Current page number (1-indexed)
 * - totalPages: number - Total number of pages
 * - onPreviousPage: function - Callback for previous page button
 * - onNextPage: function - Callback for next page button
 * - onGoToPage: function - Callback for page number input
 */
export function PDFPageNav({ currentPage, totalPages, onPreviousPage, onNextPage, onGoToPage }) {
  const handlePageInput = (e) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      onGoToPage(page);
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--bg-surface)',
      borderTop: `1px solid var(--border)`,
      padding: '1rem',
    }}>
      <button
        onClick={onPreviousPage}
        disabled={isFirstPage}
        title="Previous page"
        style={{
          background: isFirstPage ? 'var(--bg-sidebar)' : 'var(--bg-surface)',
          color: isFirstPage ? 'var(--text-muted)' : 'var(--text-secondary)',
          border: `1px solid var(--border)`,
          borderRadius: '0.375rem',
          padding: '0.5rem',
          cursor: isFirstPage ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 200ms ease',
          opacity: isFirstPage ? 0.5 : 1,
        }}
        onMouseEnter={(e) => !isFirstPage && (e.target.style.background = 'var(--bg-sidebar)')}
        onMouseLeave={(e) => (e.target.style.background = 'var(--bg-surface)')}
      >
        <ChevronLeft size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px' }}>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handlePageInput}
          style={{
            width: '3.5rem',
            padding: '0.375rem 0.5rem',
            border: `1px solid var(--border)`,
            borderRadius: '0.375rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            background: 'var(--bg-sidebar)',
            color: 'var(--text-primary)',
            fontWeight: 500,
          }}
          title="Go to page"
        />
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          of {totalPages}
        </span>
      </div>

      <button
        onClick={onNextPage}
        disabled={isLastPage}
        title="Next page"
        style={{
          background: isLastPage ? 'var(--bg-sidebar)' : 'var(--bg-surface)',
          color: isLastPage ? 'var(--text-muted)' : 'var(--text-secondary)',
          border: `1px solid var(--border)`,
          borderRadius: '0.375rem',
          padding: '0.5rem',
          cursor: isLastPage ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 200ms ease',
          opacity: isLastPage ? 0.5 : 1,
        }}
        onMouseEnter={(e) => !isLastPage && (e.target.style.background = 'var(--bg-sidebar)')}
        onMouseLeave={(e) => (e.target.style.background = 'var(--bg-surface)')}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
