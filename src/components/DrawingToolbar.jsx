/**
 * DrawingToolbar Component
 * Integrates drawing controls: toggle, color picker, line width selector, undo/redo, clear
 */

import { Pencil, CheckCircle, Move, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { LineWidthSelector } from './LineWidthSelector';

export function DrawingToolbar({
  isDrawingEnabled,
  onToggleDrawing,
  isSelectEnabled,
  onToggleSelect,
  currentColor,
  onColorChange,
  currentWidth,
  onWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearPage,
}) {
  return (
    <div className="drawing-toolbar">
      {/* Drawing Mode Toggle */}
      <button
        className={`draw-toggle-btn ${isDrawingEnabled ? 'active' : ''}`}
        onClick={onToggleDrawing}
        title={isDrawingEnabled ? 'Click to stop drawing' : 'Click to start drawing'}
        aria-label={isDrawingEnabled ? 'Stop drawing mode' : 'Start drawing mode'}
        aria-pressed={isDrawingEnabled}
      >
        {isDrawingEnabled ? (
          <>
            <CheckCircle size={16} />
            Drawing
          </>
        ) : (
          <>
            <Pencil size={16} />
            Draw
          </>
        )}
      </button>

      {/* Select Mode Toggle */}
      <button
        className={`select-toggle-btn ${isSelectEnabled ? 'active' : ''}`}
        onClick={onToggleSelect}
        title={isSelectEnabled ? 'Click to stop selecting' : 'Click to select drawings'}
        aria-label={isSelectEnabled ? 'Stop select mode' : 'Start select mode'}
        aria-pressed={isSelectEnabled}
      >
        <Move size={16} />
        Select
      </button>

      {/* Separator */}
      <div className="toolbar-separator" />

      {/* Color Picker */}
      <ColorPicker currentColor={currentColor} onColorChange={onColorChange} />

      {/* Line Width Selector */}
      <LineWidthSelector currentWidth={currentWidth} onWidthChange={onWidthChange} />

      {/* Separator */}
      <div className="toolbar-separator" />

      {/* Undo/Redo Buttons */}
      <div className="undo-redo-group">
        <button
          className="undo-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last stroke (Ctrl+Z)"
          aria-label="Undo"
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="redo-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo last undone stroke (Ctrl+Y)"
          aria-label="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Clear Page Button */}
      <button
        className="clear-btn"
        onClick={onClearPage}
        title="Clear all drawings on this page"
        aria-label="Clear page"
      >
        <Trash2 size={16} />
        Clear
      </button>

      {/* Status Indicator */}
      <div className="drawing-status" aria-live="polite" aria-atomic="true">
        {isDrawingEnabled && (
          <>
            <span className="status-dot" />
            <span>Ready to draw</span>
          </>
        )}
        {isSelectEnabled && (
          <>
            <span className="status-dot" />
            <span>Ready to select</span>
          </>
        )}
      </div>
    </div>
  );
}
