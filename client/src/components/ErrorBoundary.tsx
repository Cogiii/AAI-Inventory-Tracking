import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, ArrowLeft } from 'lucide-react';

export function RouterErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An error occurred';
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error occurred';
  }

  return <ErrorDisplay error={errorMessage} status={errorStatus} />;
}

interface ErrorDisplayProps {
  error: string;
  status?: number;
  stack?: string;
}

function ErrorDisplay({ error, status, stack }: ErrorDisplayProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white shadow-xl rounded-lg p-8">
          {/* Error Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Error Content */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status ? `Error ${status}` : 'Oops! Something went wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>

            {/* Development Error Details */}
            {import.meta.env.DEV && stack && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  🔍 Error Details (Development)
                </summary>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                  <code>{stack}</code>
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGoHome} 
                  className="flex-1 flex items-center justify-center"
                  variant="default"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  onClick={handleGoBack} 
                  className="flex-1 flex items-center justify-center"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                className="w-full flex items-center justify-center"
                variant="ghost"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please contact support or try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error?.message || 'An unexpected error occurred'}
          stack={this.state.error?.stack}
        />
      );
    }

    return this.props.children;
  }
}