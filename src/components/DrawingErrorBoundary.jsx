/**
 * DrawingErrorBoundary Component
 * Error boundary for drawing canvas to prevent feature failures from breaking the app
 */

import React from 'react';

export class DrawingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Drawing error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded">
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Drawing Error</h3>
            <p className="text-sm text-red-700">The drawing feature encountered an error. Please refresh the page.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
