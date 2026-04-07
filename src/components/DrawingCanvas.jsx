/**
 * DrawingCanvas Component
 * Canvas overlay for freehand drawing on PDF pages
 * Handles mouse/touch events, stroke rendering, and page detection
 */

import { useEffect, useRef, useState } from 'react';
import { drawStroke, redrawCanvas, viewportToCanvasCoords, detectPageAtCursor } from '../utils/drawingUtils';

export function DrawingCanvas({ isEnabled, strokes, onStrokeStart, onStrokeEnd, currentColor, currentWidth, containerRef }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef([]);

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

  // Handle mouse down - start drawing
  const handleMouseDown = (e) => {
    if (!isEnabled) return;

    isDrawingRef.current = true;
    currentPointsRef.current = [];

    const canvas = canvasRef.current;
    const { x, y } = viewportToCanvasCoords(e.clientX, e.clientY, canvas);

    currentPointsRef.current.push({ x, y });
  };

  // Handle mouse move - draw stroke
  const handleMouseMove = (e) => {
    if (!isEnabled || !isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = viewportToCanvasCoords(e.clientX, e.clientY, canvas);
    currentPointsRef.current.push({ x, y });

    // Redraw all previous strokes and current stroke
    redrawCanvas(ctx, strokes);
    drawStroke(ctx, currentPointsRef.current, currentColor, currentWidth);
  };

  // Handle mouse up - finish drawing
  const handleMouseUp = () => {
    if (!isEnabled || !isDrawingRef.current) return;

    isDrawingRef.current = false;

    // Only save stroke if it has multiple points
    if (currentPointsRef.current.length > 1) {
      onStrokeEnd(currentPointsRef.current, currentColor, currentWidth);
    }

    currentPointsRef.current = [];
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
      className={`drawing-canvas ${isEnabled ? 'enabled' : 'disabled'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isEnabled ? 'crosshair' : 'default',
        pointerEvents: isEnabled ? 'auto' : 'none',
      }}
    />
  );
}
