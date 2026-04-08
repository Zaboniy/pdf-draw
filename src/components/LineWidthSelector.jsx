/**
 * LineWidthSelector Component
 * Dropdown line width selector with preset thickness options
 */

import { useState, useRef, useEffect } from 'react';

// Predefined width options with visual descriptions
const WIDTH_OPTIONS = [
  { name: 'Thin', value: 1 },
  { name: 'Medium', value: 3 },
  { name: 'Thick', value: 5 },
];

export function LineWidthSelector({ currentWidth, onWidthChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWidthSelect = (width) => {
    onWidthChange(width);
    setIsOpen(false);
  };

  const currentWidthName = WIDTH_OPTIONS.find((w) => w.value === currentWidth)?.name || 'Custom';

  return (
    <div ref={dropdownRef} className="line-width-selector">
      <button
        className="line-width-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current width: ${currentWidthName} (${currentWidth}px)`}
        aria-label="Open line width selector"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="width-preview">
          <div
            className="width-indicator"
            style={{ width: '60%', height: `${currentWidth}px` }}
          />
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Width</span>
      </button>

      {isOpen && (
        <div
          className="width-options"
          role="menu"
          aria-label="Line width options"
        >
          {WIDTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`width-option ${currentWidth === option.value ? 'selected' : ''}`}
              onClick={() => handleWidthSelect(option.value)}
              title={`${option.name} (${option.value}px)`}
              aria-label={`${option.name} - ${option.value}px`}
              aria-current={currentWidth === option.value ? 'true' : 'false'}
              role="menuitem"
            >
              <div className="width-option-preview">
                <div
                  style={{
                    width: '60%',
                    height: `${option.value}px`,
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.875rem' }}>
                {option.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
