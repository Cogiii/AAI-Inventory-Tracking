import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { type LoginCredentials, type User } from '../services/auth/authService';
import { TokenValidator } from '../utils/tokenValidator';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const navigate = useNavigate();

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        TokenValidator.clearCache();
        navigate('/dashboard');
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.logout();
      setUser(null);
      TokenValidator.clearCache();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      TokenValidator.clearCache();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const validateTokenWithBackend = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isValid = await AuthService.validateToken();
      if (!isValid) {
        setUser(null);
        navigate('/login');
      }
      return isValid;
    } catch (err) {
      console.error('Token validation error:', err);
      setUser(null);
      navigate('/login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return AuthService.isAuthenticated();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    logout,
    isAuthenticated,
    validateTokenWithBackend,
    user,
    isLoading,
    isLoggingIn,
    error,
    clearError
  };
};