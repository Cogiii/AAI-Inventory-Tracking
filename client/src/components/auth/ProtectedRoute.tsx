import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TokenValidator } from '../../utils/tokenValidator';
import AuthService from '../../services/auth/AuthService';
import { removeSecureToken } from '@/utils/tokenSecurity';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const hasValidatedRef = useRef(false);
  const currentPathRef = useRef<string>('');

  useEffect(() => {
    const validateAccess = async () => {
      // Skip validation if already validated for this path
      if (hasValidatedRef.current && currentPathRef.current === location.pathname) {
        return;
      }

      try {
        // Quick local check first - no API call
        if (!TokenValidator.hasLocalToken()) {
          setIsTokenValid(false);
          return;
        }

        // Only validate with backend if we don't have a cached result
        const isValid = await TokenValidator.validateToken();
        setIsTokenValid(isValid);
        
        // Mark as validated for this path
        if (isValid) {
          hasValidatedRef.current = true;
          currentPathRef.current = location.pathname;
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsTokenValid(false);
      }
    };

    // Reset validation flag when path changes significantly
    if (currentPathRef.current !== location.pathname) {
      hasValidatedRef.current = false;
    }

    validateAccess();
  }, [location.pathname]);

  // Don't show loading for already validated sessions
  if (isTokenValid === null && !hasValidatedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or token invalid
  if (isTokenValid === false) {
    removeSecureToken();
    // navigate('/login');
    return null;
  }

  // Check role permissions if required roles are specified
  const user = AuthService.getCurrentUser();
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    navigate('/unauthorized');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;