import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth/AuthService';
import { TokenValidator } from '../utils/tokenValidator';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Quick local check first
      if (!TokenValidator.hasLocalToken()) {
        setUser(null);
        return false;
      }

      // Validate with backend
      const isValid = await TokenValidator.validateToken();
      if (isValid) {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        TokenValidator.clearCache();
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      TokenValidator.clearCache();
      setIsLoading(false);
      navigate('/login');
    }
  };

  // Check authentication on mount and route changes
  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = await checkAuth();
      
      // If not authenticated and trying to access protected route
      if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
        navigate('/login', { replace: true });
      }
      // If authenticated and on login page, redirect to dashboard
      else if (isAuthenticated && location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    };

    initAuth();
  }, [location.pathname]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};