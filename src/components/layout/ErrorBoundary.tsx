/**
 * @file ErrorBoundary.tsx
 *
 * React class-based error boundary that catches unhandled exceptions in
 * its child component tree and displays a user-friendly fallback UI
 * instead of a blank screen.
 *
 * Key behavior:
 * - Accepts an optional `fallback` prop for a custom error UI; otherwise
 *   renders a default card with error details, a refresh button, and a
 *   home button.
 * - In non-production environments, the raw error message and React
 *   component stack are shown in an expandable details panel for debugging.
 * - Provides three recovery actions: reload the page, navigate home, or
 *   reset the error state to re-attempt rendering the children.
 * - Logs errors to the console in production (integration point for
 *   services like Sentry).
 *
 * Must be a class component because React's error boundary API
 * (getDerivedStateFromError / componentDidCatch) is not available to
 * function components.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /** Called during the render phase to update state before the next render. */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /** Called after the error is committed to the DOM; used for side effects like logging. */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with error tracking service like Sentry here
      console.error('Application error:', error, errorInfo);
    }
  }

  /** Full page reload - bypasses React entirely and re-fetches from server. */
  handleReload = (): void => {
    window.location.reload();
  };

  /** Hard navigate to root - avoids client-side routing so all state is reset. */
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  /** Clear error state in-place so React re-attempts rendering the children
   *  without a full page reload. Useful for transient errors. */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If the consumer provided a custom fallback, render that instead of
      // the default error card below.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Your game data is safe - try refreshing the page.
              </p>
            </div>

            {/* Dev-only error details: hidden in production to avoid leaking internals. */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReload} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
