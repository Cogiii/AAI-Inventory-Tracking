import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const isAuthenticated = !!(token && user);

  // console.log('ProtectedRoute - Auth check:', { token: !!token, user: !!user, isAuthenticated, requiredRoles });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // console.log('ProtectedRoute - Redirecting unauthenticated user to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if required roles are specified
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    // console.log('ProtectedRoute - User lacks required roles, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;