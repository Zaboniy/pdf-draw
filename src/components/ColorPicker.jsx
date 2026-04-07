/**
 * ColorPicker Component
 * Dropdown color selector with predefined color palette
 */

import { useState, useRef, useEffect } from 'react';

// Predefined color palette with standard markup colors
const COLOR_PALETTE = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00AA00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
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

  const currentColorName = COLOR_PALETTE.find((c) => c.hex === currentColor)?.name || 'Custom';

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
        <span className="text-sm font-medium">Color</span>
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
              className={`color-option ${currentColor === color.hex ? 'selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorSelect(color.hex)}
              title={color.name}
              aria-label={`${color.name} (${color.hex})`}
              aria-current={currentColor === color.hex ? 'true' : 'false'}
              role="menuitem"
            />
          ))}
        </div>
      )}
    </div>
  );
}
