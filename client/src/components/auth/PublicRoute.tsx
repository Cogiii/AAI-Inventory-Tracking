import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidToken } from '../../utils/tokenSecurity';
import { TokenValidator } from '../../utils/tokenValidator';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = false 
}) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Quick local check first
      const hasToken = hasValidToken();
      
      if (hasToken && restricted) {
        // Validate with backend to be sure
        try {
          const isValid = await TokenValidator.validateToken();
          setIsAuthenticated(isValid);
        } catch (error) {
          console.error('Auth validation failed:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(hasToken);
      }
      
      setIsAuthChecked(true);
    };

    checkAuth();
  }, [restricted]);

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If this is a restricted public route (like login) and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;