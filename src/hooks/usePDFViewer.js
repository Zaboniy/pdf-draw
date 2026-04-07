import { useState } from 'react';
import { pdfjs } from 'react-pdf';

// Configure pdf.js worker - served from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

/**
 * Custom hook for managing PDF viewer state and actions
 *
 * Returns:
 * - pdfDocument: { file, numPages, fileName, loadedAt } | null | { error }
 * - viewerState: { currentPage, zoomLevel, isLoading, error, rotation }
 * - actions: Object with methods for file selection, navigation, and zoom
 */
export function usePDFViewer() {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [viewerState, setViewerState] = useState({
    currentPage: 1,
    zoomLevel: 1.0,
    isLoading: false,
    error: null,
    rotation: 0,
    viewMode: 'single', // 'single' or 'book' for continuous scrolling
  });

  /**
   * Select and load a PDF file
   * Validates file size (≤50MB), parses with pdf.js, updates state
   */
  const selectFile = async (file) => {
    if (!file) return;

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      const errorMsg = `File is too large (max 50MB). Yours is ${sizeMB}MB.`;
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      setPdfDocument({ error: errorMsg });
      return;
    }

    // Set loading state
    setViewerState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Update state on success - let react-pdf handle PDF parsing
      setPdfDocument({
        file: file,
        numPages: 0, // Will be set by react-pdf's Document onLoadSuccess
        fileName: file.name,
        loadedAt: new Date().toISOString(),
      });

      // Reset viewer state to defaults
      setViewerState({
        currentPage: 1,
        zoomLevel: 1.0,
        isLoading: false,
        error: null,
        rotation: 0,
        viewMode: 'single',
      });
    } catch (err) {
      // Handle error
      const errorMsg = 'Failed to load PDF. Is it a valid PDF file?';
      setPdfDocument({ error: errorMsg });
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg
      }));
      console.error('PDF load error:', err);
    }
  };

  /**
   * Navigate to next page
   * Respects boundary: no-op if already on last page
   */
  const goNextPage = () => {
    if (!pdfDocument || pdfDocument.error) return;
    setViewerState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, pdfDocument.numPages),
    }));
  };

  /**
   * Navigate to previous page
   * Respects boundary: no-op if already on first page
   */
  const goPreviousPage = () => {
    setViewerState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  /**
   * Jump to specific page (1-indexed)
   * Validates page number and clamps to valid range
   */
  const goToPage = (page) => {
    if (!pdfDocument || pdfDocument.error) return;
    const validPage = Math.max(1, Math.min(page, pdfDocument.numPages));
    setViewerState((prev) => ({ ...prev, currentPage: validPage }));
  };

  /**
   * Increase zoom by 25%
   * Clamps to max 300% (3.0)
   */
  const zoomIn = () => {
    setViewerState((prev) => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 0.25, 3.0),
    }));
  };

  /**
   * Decrease zoom by 25%
   * Clamps to min 50% (0.5)
   */
  const zoomOut = () => {
    setViewerState((prev) => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 0.25, 0.5),
    }));
  };

  /**
   * Fit PDF width to viewport
   * Note: Exact implementation requires ref to PDFCanvas container
   * For MVP, this is a placeholder that resets to 1.0
   */
  const fitToWidth = () => {
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  /**
   * Fit PDF height to viewport
   * Note: Exact implementation requires ref to PDFCanvas container
   * For MVP, this is a placeholder that resets to 1.0
   */
  const fitToHeight = () => {
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  /**
   * Reset zoom to 100% (1.0)
   */
  const resetZoom = () => {
    setViewerState((prev) => ({ ...prev, zoomLevel: 1.0 }));
  };

  /**
   * Clear loaded PDF and reset to initial state
   */
  const clearFile = () => {
    setPdfDocument(null);
    setViewerState({
      currentPage: 1,
      zoomLevel: 1.0,
      isLoading: false,
      error: null,
      rotation: 0,
      viewMode: 'single',
    });
  };

  /**
   * Update the number of pages after PDF is loaded
   */
  const setNumPages = (numPages) => {
    setPdfDocument((prev) => {
      if (prev && !prev.error) {
        return { ...prev, numPages };
      }
      return prev;
    });
  };

  /**
   * Toggle between single page view and book (continuous scroll) view
   */
  const toggleViewMode = () => {
    setViewerState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === 'single' ? 'book' : 'single',
      currentPage: 1, // Reset to first page when switching views
    }));
  };

  return {
    pdfDocument,
    viewerState,
    actions: {
      selectFile,
      goNextPage,
      goPreviousPage,
      goToPage,
      zoomIn,
      zoomOut,
      fitToWidth,
      fitToHeight,
      resetZoom,
      clearFile,
      setNumPages,
      toggleViewMode,
    },
  };
}
