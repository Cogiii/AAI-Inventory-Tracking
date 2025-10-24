import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidToken } from '../../utils/tokenSecurity';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = false 
}) => {
  // Check if user is authenticated using secure token validation
  const isAuthenticated = hasValidToken();

  // console.log('PublicRoute - Auth check:', { isAuthenticated, restricted });

  if (restricted && isAuthenticated) {
    // console.log('PublicRoute - Redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;