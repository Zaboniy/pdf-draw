import React from 'react';

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
    <div className="flex items-center justify-center gap-4 bg-white border-t border-gray-200 p-4">
      <button
        onClick={onPreviousPage}
        disabled={isFirstPage}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Page</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handlePageInput}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
        />
        <span className="text-sm font-medium">of {totalPages}</span>
      </div>

      <button
        onClick={onNextPage}
        disabled={isLastPage}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
