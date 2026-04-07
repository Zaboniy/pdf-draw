/**
 * DrawingContext
 * React Context for global drawing state management
 * Provides drawing state and actions to all components in the app
 */

import { createContext, useContext } from 'react';

// Create the drawing context
export const DrawingContextAPI = createContext(null);

/**
 * Hook to use drawing context
 * @returns {Object} Drawing context with state and actions
 * @throws {Error} If used outside DrawingProvider
 */
export function useDrawingContext() {
  const context = useContext(DrawingContextAPI);
  if (!context) {
    throw new Error('useDrawingContext must be used within DrawingProvider');
  }
  return context;
}

/**
 * DrawingProvider Component
 * Wraps the app with drawing state management
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.drawingState - Drawing state from useDrawing hook
 */
export function DrawingProvider({ children, drawingState }) {
  return (
    <DrawingContextAPI.Provider value={drawingState}>
      {children}
    </DrawingContextAPI.Provider>
  );
}
