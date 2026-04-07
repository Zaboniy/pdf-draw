/**
 * Drawing Utilities
 * Canvas API helpers for stroke rendering, page boundary constraints, and page detection
 */

/**
 * Draw a single stroke on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array<{x, y}>} points - Array of coordinate objects along the stroke path
 * @param {string} color - Hex color code (e.g., "#FF0000")
 * @param {number} width - Line width in pixels
 */
export function drawStroke(ctx, points, color, width) {
  if (!ctx || !points || points.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}

/**
 * Constrain a point to stay within page boundaries
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {HTMLElement} pageElement - DOM element representing the PDF page
 * @returns {{x: number, y: number}} - Constrained coordinates
 */
export function constrainToPageBounds(x, y, pageElement) {
  if (!pageElement) return { x, y };

  const rect = pageElement.getBoundingClientRect();
  const constrainedX = Math.max(rect.left, Math.min(x, rect.right));
  const constrainedY = Math.max(rect.top, Math.min(y, rect.bottom));

  return {
    x: constrainedX - rect.left, // Convert to page-relative coordinates
    y: constrainedY - rect.top,
  };
}

/**
 * Detect which PDF page the cursor is over in Book View
 * @param {number} cursorX - Cursor X coordinate (viewport)
 * @param {number} cursorY - Cursor Y coordinate (viewport)
 * @param {HTMLElement} container - Container element holding all pages (Book View container)
 * @returns {number|null} - Page number (1-indexed) or null if not over a page
 */
export function detectPageAtCursor(cursorX, cursorY, container) {
  if (!container) return null;

  // In react-pdf, pages are typically marked with data attributes or specific classes
  // Look for page elements within the container
  const pageElements = container.querySelectorAll('[data-page-number], .react-pdf__Page');

  for (const pageElement of pageElements) {
    const rect = pageElement.getBoundingClientRect();

    // Check if cursor is within this page's bounds
    if (
      cursorX >= rect.left &&
      cursorX <= rect.right &&
      cursorY >= rect.top &&
      cursorY <= rect.bottom
    ) {
      // Try to get page number from data attribute first, then from class
      const pageNumber = pageElement.dataset.pageNumber || pageElement.getAttribute('data-page-number');
      if (pageNumber) {
        return parseInt(pageNumber, 10);
      }

      // Fallback: count position in page list
      const allPages = container.querySelectorAll('[data-page-number], .react-pdf__Page');
      for (let i = 0; i < allPages.length; i++) {
        if (allPages[i] === pageElement) {
          return i + 1; // Return 1-indexed page number
        }
      }
    }
  }

  return null;
}

/**
 * Get canvas element positioned as overlay on a given container
 * @param {HTMLElement} container - Container element to overlay canvas on
 * @returns {HTMLCanvasElement} - Canvas element ready for drawing
 */
export function createOverlayCanvas(container) {
  if (!container) return null;

  const canvas = document.createElement('canvas');
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  // Position canvas as absolute overlay
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.cursor = 'crosshair';
  canvas.style.zIndex = '10';

  return canvas;
}

/**
 * Redraw all strokes on a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array} strokes - Array of stroke objects { points, color, width }
 */
export function redrawCanvas(ctx, strokes) {
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Redraw all strokes
  if (strokes && Array.isArray(strokes)) {
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke.points, stroke.color, stroke.width);
    });
  }
}

/**
 * Convert viewport coordinates to canvas coordinates
 * Accounts for canvas positioning and scaling
 * @param {number} vpX - Viewport X coordinate
 * @param {number} vpY - Viewport Y coordinate
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {{x: number, y: number}} - Canvas-relative coordinates
 */
export function viewportToCanvasCoords(vpX, vpY, canvas) {
  if (!canvas) return { x: vpX, y: vpY };

  const rect = canvas.getBoundingClientRect();
  return {
    x: vpX - rect.left,
    y: vpY - rect.top,
  };
}
