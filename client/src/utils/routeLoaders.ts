import { redirect } from 'react-router-dom';
import { hasValidToken } from '../utils/tokenSecurity';
import { TokenValidator } from '../utils/tokenValidator';

/**
 * Route loader that ensures authentication is checked before accessing protected routes
 */
export const protectedRouteLoader = async () => {
  // Quick local check first
  if (!hasValidToken()) {
    console.log('No valid token found, redirecting to login');
    throw redirect('/login');
  }

  try {
    // Validate with backend
    const isValid = await TokenValidator.validateToken();
    if (!isValid) {
      console.log('Token validation failed, redirecting to login');
      throw redirect('/login');
    }
    
    return null; // Allow access
  } catch (error) {
    console.error('Authentication check failed:', error);
    throw redirect('/login');
  }
};

/**
 * Route loader for public routes that should redirect authenticated users
 */
export const publicRouteLoader = async () => {
  // Check if user is authenticated
  if (hasValidToken()) {
    try {
      const isValid = await TokenValidator.validateToken();
      if (isValid) {
        console.log('User is authenticated, redirecting to dashboard');
        throw redirect('/dashboard');
      }
    } catch (error) {
      // If validation fails, allow access to login
      console.log('Token validation failed, allowing access to login');
    }
  }
  
  return null; // Allow access to login
};