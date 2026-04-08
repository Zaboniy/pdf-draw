/**
 * ColorPicker Component
 * Dropdown color selector with predefined color palette
 */

import { useState, useRef, useEffect } from 'react';

// Modern color palette with more refined hues
const COLOR_PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Black', hex: '#000000' },
];

export function ColorPicker({ currentColor, onColorChange }) {
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

  const handleColorSelect = (color) => {
    onColorChange(color);
    setIsOpen(false);
  };

  const currentColorName = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === currentColor.toLowerCase())?.name || 'Custom';

  return (
    <div ref={dropdownRef} className="color-picker-dropdown">
      <button
        className="color-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current color: ${currentColorName}`}
        aria-label="Open color picker"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div
          className="color-preview"
          style={{ backgroundColor: currentColor }}
        />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Color</span>
      </button>

      {isOpen && (
        <div
          className="color-palette"
          role="menu"
          aria-label="Color palette"
        >
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.hex}
              className={`color-option ${currentColor.toLowerCase() === color.hex.toLowerCase() ? 'selected' : ''}`}
              style={{
                backgroundColor: color.hex,
                border: currentColor.toLowerCase() === color.hex.toLowerCase() ? '3px solid var(--accent)' : '2px solid var(--border)',
              }}
              onClick={() => handleColorSelect(color.hex)}
              title={color.name}
              aria-label={`${color.name} (${color.hex})`}
              aria-current={currentColor.toLowerCase() === color.hex.toLowerCase() ? 'true' : 'false'}
              role="menuitem"
            />
          ))}
        </div>
      )}
    </div>
  );
}
