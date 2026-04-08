/**
 * useDrawing Hook
 * Manages drawing state, strokes, undo/redo, color, and width selection
 * Provides a centralized state management solution for the drawing feature
 */

import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { pdfjs } from 'react-pdf';

export function useDrawing() {
  // Drawing mode state
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);

  // Select mode state
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);
  const [selectedStrokeId, setSelectedStrokeId] = useState(null);
  const [clipboard, setClipboard] = useState(null); // { stroke, sourcePage }

  // Color and width state
  const [currentColor, setCurrentColor] = useState('#FF0000'); // Default red
  const [currentWidth, setCurrentWidth] = useState(3); // Default medium (3px)

  // Undo/redo stacks - stored per page
  const [drawingLayers, setDrawingLayers] = useState({}); // { pageNumber: { strokes, pastStates, futureStates } }
  const currentPageRef = useRef(1);

  /**
   * Get or initialize drawing layer for a page
   */
  const getPageLayer = useCallback((pageNumber) => {
    if (!drawingLayers[pageNumber]) {
      setDrawingLayers((prev) => ({
        ...prev,
        [pageNumber]: {
          strokes: [],
          pastStates: [],
          futureStates: [],
        },
      }));
    }
    return drawingLayers[pageNumber] || { strokes: [], pastStates: [], futureStates: [] };
  }, [drawingLayers]);

  /**
   * Add a new stroke to the current page
   */
  const addStroke = useCallback(
    (points, color, width) => {
      const pageNumber = currentPageRef.current;
      setDrawingLayers((prev) => {
        const layer = { ...prev[pageNumber] } || { strokes: [], pastStates: [], futureStates: [] };
        const newStroke = {
          id: `stroke-${Date.now()}-${Math.random()}`,
          points,
          color,
          width,
          timestamp: Date.now(),
        };

        // Add to past states for undo
        const newPastStates = [...layer.pastStates, [...layer.strokes]];
        // Clear future states when new action taken
        const newFutureStates = [];

        return {
          ...prev,
          [pageNumber]: {
            strokes: [...layer.strokes, newStroke],
            pastStates: newPastStates,
            futureStates: newFutureStates,
          },
        };
      });
    },
    []
  );

  /**
   * Undo last stroke on current page
   */
  const undo = useCallback(() => {
    const pageNumber = currentPageRef.current;
    setDrawingLayers((prev) => {
      const layer = prev[pageNumber];
      if (!layer || layer.pastStates.length === 0) return prev;

      const previousState = layer.pastStates[layer.pastStates.length - 1];
      const newPastStates = layer.pastStates.slice(0, -1);
      const newFutureStates = [layer.strokes, ...layer.futureStates];

      return {
        ...prev,
        [pageNumber]: {
          strokes: previousState,
          pastStates: newPastStates,
          futureStates: newFutureStates,
        },
      };
    });
  }, []);

  /**
   * Redo last undone stroke on current page
   */
  const redo = useCallback(() => {
    const pageNumber = currentPageRef.current;
    setDrawingLayers((prev) => {
      const layer = prev[pageNumber];
      if (!layer || layer.futureStates.length === 0) return prev;

      const nextState = layer.futureStates[0];
      const newFutureStates = layer.futureStates.slice(1);
      const newPastStates = [...layer.pastStates, layer.strokes];

      return {
        ...prev,
        [pageNumber]: {
          strokes: nextState,
          pastStates: newPastStates,
          futureStates: newFutureStates,
        },
      };
    });
  }, []);

  /**
   * Clear all strokes on current page
   */
  const clearPage = useCallback(() => {
    const pageNumber = currentPageRef.current;
    setDrawingLayers((prev) => ({
      ...prev,
      [pageNumber]: {
        strokes: [],
        pastStates: [],
        futureStates: [],
      },
    }));
  }, []);

  /**
   * Set current page (for page-specific drawing layers)
   */
  const setCurrentPage = useCallback((pageNumber) => {
    currentPageRef.current = pageNumber;
    getPageLayer(pageNumber);
  }, [getPageLayer]);

  /**
   * Toggle drawing mode
   */
  const toggleDrawing = useCallback(() => {
    setIsDrawingEnabled((prev) => !prev);
    // Disable select mode when enabling draw mode
    if (isSelectEnabled) {
      setIsSelectEnabled(false);
      setSelectedStrokeId(null);
    }
  }, [isSelectEnabled]);

  /**
   * Toggle select mode
   */
  const toggleSelect = useCallback(() => {
    setIsSelectEnabled((prev) => !prev);
    setSelectedStrokeId(null);
    // Disable draw mode when enabling select mode
    if (isDrawingEnabled) {
      setIsDrawingEnabled(false);
    }
  }, [isDrawingEnabled]);

  /**
   * Copy selected stroke to clipboard
   */
  const copyStroke = useCallback(() => {
    if (!selectedStrokeId) return;

    const layer = drawingLayers[currentPageRef.current];
    if (!layer) return;

    const stroke = layer.strokes.find((s) => s.id === selectedStrokeId);
    if (stroke) {
      setClipboard({
        stroke: { ...stroke, id: `stroke-${Date.now()}-${Math.random()}` }, // Create new ID for pasted copy
        sourcePage: currentPageRef.current,
      });
    }
  }, [selectedStrokeId, drawingLayers]);

  /**
   * Paste stroke from clipboard to current page
   */
  const pasteStroke = useCallback(() => {
    if (!clipboard || !clipboard.stroke) return;

    const pageNumber = currentPageRef.current;
    setDrawingLayers((prev) => {
      const layer = { ...prev[pageNumber] } || { strokes: [], pastStates: [], futureStates: [] };

      // Create a copy of the stroke with a new ID
      const pastedStroke = {
        ...clipboard.stroke,
        id: `stroke-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      // Add to past states for undo
      const newPastStates = [...layer.pastStates, [...layer.strokes]];
      const newFutureStates = [];

      return {
        ...prev,
        [pageNumber]: {
          strokes: [...layer.strokes, pastedStroke],
          pastStates: newPastStates,
          futureStates: newFutureStates,
        },
      };
    });
  }, [clipboard]);

  /**
   * Select a stroke by ID
   */
  const selectStroke = useCallback((strokeId) => {
    setSelectedStrokeId(strokeId);
  }, []);

  /**
   * Move a stroke by offsetting its points
   */
  const moveStroke = useCallback((strokeId, offsetX, offsetY) => {
    const pageNumber = currentPageRef.current;
    setDrawingLayers((prev) => {
      const layer = prev[pageNumber];
      if (!layer) return prev;

      const strokeIndex = layer.strokes.findIndex((s) => s.id === strokeId);
      if (strokeIndex === -1) return prev;

      const stroke = layer.strokes[strokeIndex];
      const newStroke = {
        ...stroke,
        points: stroke.points.map((point) => ({
          x: point.x + offsetX,
          y: point.y + offsetY,
        })),
      };

      const newStrokes = [...layer.strokes];
      newStrokes[strokeIndex] = newStroke;

      // Add to past states for undo
      const newPastStates = [...layer.pastStates, layer.strokes];
      const newFutureStates = [];

      return {
        ...prev,
        [pageNumber]: {
          strokes: newStrokes,
          pastStates: newPastStates,
          futureStates: newFutureStates,
        },
      };
    });
  }, []);

  /**
   * Find stroke at position (for selection in move mode)
   */
  const findStrokeAtPosition = useCallback((x, y, threshold = 8) => {
    const layer = drawingLayers[currentPageRef.current];
    if (!layer || !layer.strokes) return null;

    // Search from last to first (most recent strokes on top)
    for (let i = layer.strokes.length - 1; i >= 0; i--) {
      const stroke = layer.strokes[i];
      for (const point of stroke.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        if (distance < threshold + stroke.width / 2) {
          return stroke.id;
        }
      }
    }
    return null;
  }, [drawingLayers]);

  /**
   * Check if undo is available
   */
  const canUndo = (() => {
    const layer = drawingLayers[currentPageRef.current];
    return layer && layer.pastStates && layer.pastStates.length > 0;
  })();

  /**
   * Check if redo is available
   */
  const canRedo = (() => {
    const layer = drawingLayers[currentPageRef.current];
    return layer && layer.futureStates && layer.futureStates.length > 0;
  })();

  /**
   * Get current page strokes
   */
  const getCurrentStrokes = useCallback(() => {
    const layer = drawingLayers[currentPageRef.current];
    return layer ? layer.strokes : [];
  }, [drawingLayers]);

  /**
   * Get strokes for a specific page
   */
  const getStrokesForPage = useCallback((pageNumber) => {
    const layer = drawingLayers[pageNumber];
    return layer ? layer.strokes : [];
  }, [drawingLayers]);

  /**
   * Check if there are any drawings on any page
   */
  const hasDrawings = Object.values(drawingLayers).some(
    (layer) => layer && layer.strokes && layer.strokes.length > 0
  );

  /**
   * Save PDF with drawings
   * Creates a new PDF file with all drawings overlaid on the pages
   */
  const savePDF = useCallback(async (pdfDocument) => {
    if (!pdfDocument || !pdfDocument.file) return;

    try {
      // Create separate buffers for pdfjs and pdf-lib to avoid ArrayBuffer detachment issues
      const pdfArrayBufferForPdfjs = await pdfDocument.file.arrayBuffer();
      const pdfArrayBufferForPdfLib = await pdfDocument.file.arrayBuffer();

      // Load the original PDF using pdfjs for rendering
      const originalPdfDoc = await pdfjs.getDocument({ data: pdfArrayBufferForPdfjs }).promise;

      // Load the PDF for modification using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfArrayBufferForPdfLib);
      const pages = pdfDoc.getPages();

      // For each page, render the original page content, then draw strokes on top
      for (let pageNum = 0; pageNum < pages.length; pageNum++) {
        const pageNumber = pageNum + 1;
        const pageStrokes = drawingLayers[pageNumber]?.strokes || [];

        // Get the PDF page using pdfjs for rendering
        const pdfPage = await originalPdfDoc.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale: 2 }); // 2x scale for better quality

        // Create canvas with proper dimensions
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Render the original PDF page to canvas
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        await pdfPage.render(renderContext).promise;

        // Now draw strokes on top of the rendered page
        pageStrokes.forEach((stroke) => {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width * 2; // Scale to match viewport
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (stroke.points && stroke.points.length > 0) {
            ctx.beginPath();
            const firstPoint = stroke.points[0];
            // Scale points to match the 2x viewport
            ctx.moveTo(firstPoint.x * 2, firstPoint.y * 2);

            for (let i = 1; i < stroke.points.length; i++) {
              const point = stroke.points[i];
              ctx.lineTo(point.x * 2, point.y * 2);
            }
            ctx.stroke();
          }
        });

        // Convert canvas to image and embed in PDF
        const imageData = canvas.toDataURL('image/png');
        const image = await pdfDoc.embedPng(imageData);

        // Get the page dimensions and embed the image
        const page = pages[pageNum];
        const { width, height } = page.getSize();
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfDocument.fileName || 'document'}-signed.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF. Please try again.');
    }
  }, [drawingLayers]);

  return {
    // State
    isDrawingEnabled,
    isSelectEnabled,
    selectedStrokeId,
    clipboard,
    currentColor,
    currentWidth,
    drawingLayers,

    // Actions
    toggleDrawing,
    toggleSelect,
    selectStroke,
    moveStroke,
    findStrokeAtPosition,
    copyStroke,
    pasteStroke,
    setCurrentColor,
    setCurrentWidth,
    addStroke,
    undo,
    redo,
    clearPage,
    setCurrentPage,
    savePDF,

    // Computed
    canUndo,
    canRedo,
    getCurrentStrokes,
    getStrokesForPage,
    hasDrawings,
  };
}
