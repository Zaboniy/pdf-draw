/**
 * useDrawing Hook
 * Manages drawing state, strokes, undo/redo, color, and width selection
 * Provides a centralized state management solution for the drawing feature
 */

import { useState, useCallback, useRef } from 'react';

export function useDrawing() {
  // Drawing mode state
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);

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
  }, []);

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

  return {
    // State
    isDrawingEnabled,
    currentColor,
    currentWidth,
    drawingLayers,

    // Actions
    toggleDrawing,
    setCurrentColor,
    setCurrentWidth,
    addStroke,
    undo,
    redo,
    clearPage,
    setCurrentPage,

    // Computed
    canUndo,
    canRedo,
    getCurrentStrokes,
  };
}
