/**
 * DrawingCanvas Component
 * Canvas overlay for freehand drawing on PDF pages
 * Handles mouse/touch events, stroke rendering, and page detection
 */

import { useEffect, useRef, useState } from 'react';
import { drawStroke, redrawCanvas, viewportToCanvasCoords, detectPageAtCursor } from '../utils/drawingUtils';

export function DrawingCanvas({
  isEnabled,
  isSelectEnabled,
  strokes,
  selectedStrokeId,
  onStrokeStart,
  onStrokeEnd,
  onSelectStroke,
  onMoveStroke,
  findStrokeAtPosition,
  currentColor,
  currentWidth,
  containerRef,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef([]);

  // Select mode refs
  const isMovingRef = useRef(false);
  const moveStartRef = useRef(null);

  // Initialize canvas and set up resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef?.current) return;

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      // Get the actual PDF page element to match its size
      const pageElement = container.querySelector('.react-pdf__Page');
      if (!pageElement) return;

      // Set canvas size to match the PDF page
      canvas.width = pageElement.offsetWidth;
      canvas.height = pageElement.offsetHeight;

      // Redraw - use the current strokes from the ref
      const ctx = canvas.getContext('2d');
      if (ctx) {
        redrawCanvas(ctx, strokes);
      }
    });

    // Observe the container for size changes
    resizeObserver.observe(container);

    // Also trigger an initial resize
    const pageElement = container.querySelector('.react-pdf__Page');
    if (pageElement) {
      canvas.width = pageElement.offsetWidth;
      canvas.height = pageElement.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        redrawCanvas(ctx, strokes);
      }
    }

    return () => resizeObserver.disconnect();
  }, [containerRef, strokes]);

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      redrawCanvas(ctx, strokes);
    }
  }, [strokes]);

  // Handle mouse down - start drawing or moving
  const handleMouseDown = (e) => {
    if (!isEnabled && !isSelectEnabled) return;

    const canvas = canvasRef.current;
    const { x, y } = viewportToCanvasCoords(e.clientX, e.clientY, canvas);

    if (isSelectEnabled) {
      // Move mode: try to select a stroke
      const strokeId = findStrokeAtPosition(x, y);
      if (strokeId) {
        onSelectStroke(strokeId);
        isMovingRef.current = true;
        moveStartRef.current = { x, y };
      }
    } else if (isEnabled) {
      // Draw mode
      isDrawingRef.current = true;
      currentPointsRef.current = [];
      currentPointsRef.current.push({ x, y });
    }
  };

  // Handle mouse move - draw stroke or move selected stroke
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = viewportToCanvasCoords(e.clientX, e.clientY, canvas);

    if (isSelectEnabled) {
      // Move mode: update cursor based on whether hovering over a stroke
      if (isMovingRef.current && moveStartRef.current && selectedStrokeId) {
        // Currently dragging - move the stroke
        const offsetX = x - moveStartRef.current.x;
        const offsetY = y - moveStartRef.current.y;
        onMoveStroke(selectedStrokeId, offsetX, offsetY);
        moveStartRef.current = { x, y };
      } else {
        // Not dragging - check if hovering over a stroke to show appropriate cursor
        const strokeAtPos = findStrokeAtPosition(x, y);
        canvas.style.cursor = strokeAtPos ? 'grab' : 'default';
      }
    } else if (isEnabled && isDrawingRef.current) {
      // Draw mode
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      currentPointsRef.current.push({ x, y });

      // Redraw all previous strokes and current stroke
      redrawCanvas(ctx, strokes);
      drawStroke(ctx, currentPointsRef.current, currentColor, currentWidth);
    }
  };

  // Handle mouse up - finish drawing or moving
  const handleMouseUp = () => {
    if (isSelectEnabled && isMovingRef.current) {
      // Finish moving
      isMovingRef.current = false;
      moveStartRef.current = null;
    } else if (isEnabled && isDrawingRef.current) {
      // Finish drawing
      isDrawingRef.current = false;

      // Only save stroke if it has multiple points
      if (currentPointsRef.current.length > 1) {
        onStrokeEnd(currentPointsRef.current, currentColor, currentWidth);
      }

      currentPointsRef.current = [];
    }
  };

  // Handle mouse leave - cancel current stroke
  const handleMouseLeave = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      currentPointsRef.current = [];

      // Redraw without the incomplete stroke
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        redrawCanvas(ctx, strokes);
      }
    }
  };

  // Handle touch events for mobile support
  const handleTouchStart = (e) => {
    if (!isEnabled) return;

    const touch = e.touches[0];
    handleMouseDown({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  };

  const handleTouchMove = (e) => {
    if (!isEnabled || !isDrawingRef.current) return;

    e.preventDefault(); // Prevent scrolling while drawing
    const touch = e.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!isEnabled) return;
    handleMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-canvas ${isEnabled ? 'enabled' : ''} ${isSelectEnabled ? 'move-enabled' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isEnabled ? 'crosshair' : isSelectEnabled ? 'grab' : 'default',
        pointerEvents: isEnabled || isSelectEnabled ? 'auto' : 'none',
      }}
    />
  );
}
