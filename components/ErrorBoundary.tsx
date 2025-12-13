'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Global error boundary component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs error details to the console, and displays a fallback UI
 * instead of crashing the entire app.
 * 
 * Features:
 * - Prevents entire app crash from component errors
 * - Displays user-friendly error page with reload button
 * - Logs error details to console for debugging
 * - Styled consistently with DjedOps Financial Brutalism theme
 * 
 * Requirements: 9.3
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error component stack:', errorInfo.componentStack);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to send error to a logging service
    // logErrorToService(error, errorInfo);
  }

  handleReload = (): void => {
    // Clear error state and reload the page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleReset = (): void => {
    // Try to recover without full page reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void text-textPrimary flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Container with corner brackets */}
            <div className="relative bg-obsidian border-2 border-alert p-6 sm:p-8 md:p-12">
              {/* Corner L-brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-alert" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-alert" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-alert" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-alert" />

              {/* Error Icon */}
              <div className="text-center mb-6">
                <div className="text-6xl sm:text-7xl text-alert mb-4">⚠</div>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-alert text-glow-red uppercase mb-2">
                  SYSTEM ERROR
                </h1>
                <p className="text-textSecondary font-mono text-sm sm:text-base">
                  An unexpected error occurred
                </p>
              </div>

              {/* Error Message */}
              <div className="bg-void border border-alert/30 p-4 mb-6 overflow-auto max-h-48">
                <p className="text-alert font-mono text-xs sm:text-sm break-words">
                  {this.state.error?.message || 'Unknown error'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <details className="mt-4">
                    <summary className="text-textSecondary font-mono text-xs cursor-pointer hover:text-terminal">
                      Stack Trace (Development Only)
                    </summary>
                    <pre className="text-textSecondary font-mono text-xs mt-2 overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-6 py-3 bg-terminal text-void font-display font-bold text-base hover:shadow-green-glow transition-shadow uppercase touch-manipulation active:scale-95"
                >
                  RELOAD PAGE
                </button>
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 border-2 border-terminal text-terminal font-display font-bold text-base hover:bg-terminal hover:text-void transition-colors uppercase touch-manipulation active:scale-95"
                >
                  TRY AGAIN
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-textSecondary font-mono text-xs">
                  If the problem persists, please check the browser console for details
                </p>
              </div>
            </div>

            {/* Developer Info */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-4 bg-obsidian border border-textSecondary/30 p-4">
                <details>
                  <summary className="text-textSecondary font-mono text-xs cursor-pointer hover:text-terminal">
                    Component Stack (Development Only)
                  </summary>
                  <pre className="text-textSecondary font-mono text-xs mt-2 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
