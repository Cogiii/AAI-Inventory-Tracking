import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { removeSecureToken } from '../../utils/tokenSecurity';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isAuthError: boolean;
}

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  AuthErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false, error: null, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Check if this is an authentication-related error
    const isAuthError = 
      error.message.includes('401') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Token') ||
      error.message.includes('Authentication');

    return {
      hasError: true,
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    // If it's an auth error, clear tokens
    if (this.state.isAuthError) {
      removeSecureToken();
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's an auth error, redirect to login
      if (this.state.isAuthError) {
        return <Navigate to="/login" replace />;
      }

      // For other errors, show error UI or use custom fallback
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, isAuthError: false })}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;