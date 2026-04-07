import React, { useRef } from 'react';

/**
 * File upload input component for selecting PDF files
 *
 * Props:
 * - onSelect: (file: File) => void - Callback when file is selected
 * - isLoading: boolean - Show loading state
 * - error: string | null - Display error message
 */
export function PDFFileInput({ onSelect, isLoading, error }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Loading...' : 'Open PDF'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  );
}
