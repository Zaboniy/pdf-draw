import React, { useRef } from 'react';
import { FolderOpen, Loader } from 'lucide-react';

/**
 * File upload input component for selecting PDF files
 *
 * Props:
 * - onSelect: (file: File) => void - Callback when file is selected
 * - isLoading: boolean - Show loading state
 * - error: string | null - Display error message
 * - fileName: string | null - Display current file name
 * - showButton: boolean - Show the button (default true)
 */
export function PDFFileInput({ onSelect, isLoading, error, fileName, showButton = true }) {
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
    <>
      {showButton && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClick}
            disabled={isLoading}
            style={{
              background: isLoading ? 'var(--accent)' : 'var(--accent)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.background = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.target.style.background = 'var(--accent)')}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FolderOpen size={16} />
                Open PDF
              </>
            )}
          </button>
          {fileName && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              📄 {fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName}
            </p>
          )}
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>{error}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
