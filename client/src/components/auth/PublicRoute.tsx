import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = false 
}) => {
  // Check if user is authenticated by checking localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const isAuthenticated = !!(token && user);

  // console.log('PublicRoute - Auth check:', { token: !!token, user: !!user, isAuthenticated, restricted });

  if (restricted && isAuthenticated) {
    // console.log('PublicRoute - Redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;