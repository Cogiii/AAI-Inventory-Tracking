import { api } from '../api';
import type { ApiResponse } from '../api';
import type { User, LoginCredentials, AuthResponse } from '../../types';
import { 
  setSecureToken, 
  getSecureToken, 
  removeSecureToken,
  setSecureUserData,
  getSecureUserData
} from '../../utils/tokenSecurity';

/**
 * Transform API user data to our User interface format
 * @param apiUser - User data from API (with first_name/last_name)
 * @returns User - Transformed user data (clean, no extra fields)
 */
const transformApiUser = (apiUser: any): User => {
  const {
    id,
    email,
    role,
    username,
    created_at,
    updated_at,
    is_active,
    first_name,
    last_name,
    name,
    lastLogin
  } = apiUser;

  return {
    id,
    email,
    role,
    username,
    created_at,
    updated_at,
    is_active,
    first_name,
    last_name,
    name,
    lastLogin
  };
};

/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls with secure token management.
 * Uses encrypted token storage for enhanced security.
 */
export const AuthService = {
  /**
   * User login
   * @param credentials - Username and password
   * @returns Promise with user data and encrypted token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store encrypted token
        setSecureToken(response.data.data.token);
        
        // Transform and store encrypted user data
        const transformedUser = transformApiUser(response.data.data.user);
        setSecureUserData(transformedUser);
      }
      
      return response.data;
    } catch (error) {
      // console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Validates current token with backend and auto-logout if invalid
   * @param skipCache - Whether to skip cache and force validation
   * @returns Promise<boolean> - true if token is valid, false if invalid (and logged out)
   */
  validateToken: async (skipCache = false): Promise<boolean> => {
    try {
      const token = getSecureToken();
      if (!token) {
        return false;
      }

      // Use /auth/me endpoint to validate token with cache control
      const config = skipCache ? { headers: { 'Cache-Control': 'no-cache' } } : {};
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me', config);
      
      if (response.data.success && response.data.data.user) {
        // Token is valid, transform and update stored user data
        const transformedUser = transformApiUser(response.data.data.user);
        setSecureUserData(transformedUser);
        return true;
      }
      
      // Invalid response, logout
      AuthService.forceLogout();
      return false;
    } catch (error: any) {
      // Only log errors in development to reduce console noise
      if (import.meta.env.DEV) {
        console.error('Token validation failed:', error);
      }
      
      // Check if it's an auth-related error (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        AuthService.forceLogout();
      }
      
      return false;
    }
  },

  /**
   * Get current user profile (also validates token)
   * @returns Promise with current user data
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      
      // Update stored user data if successful (encrypted)
      if (response.data.success && response.data.data.user) {
        const transformedUser = transformApiUser(response.data.data.user);
        setSecureUserData(transformedUser);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get profile failed:', error);
      
      // Auto-logout on auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        AuthService.forceLogout();
      }
      
      throw error;
    }
  },

  /**
   * Update user profile
   * @param data - Partial user data to update
   * @returns Promise with updated user data
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.put<ApiResponse<{ user: User }>>('/auth/me', data);
      
      // Update stored user data if successful (encrypted)
      if (response.data.success && response.data.data.user) {
        const transformedUser = transformApiUser(response.data.data.user);
        setSecureUserData(transformedUser);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  /**
   * User logout
   * @returns Promise with logout confirmation
   */
  logout: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/logout');
      
      removeSecureToken();
      
      return response.data;
    } catch (error) {
      // Even if logout fails, clean up local storage
      console.warn('Logout API call failed, but cleaning up local storage:', error);
      removeSecureToken();
      
      // Return a successful response for UX
      return {
        success: true,
        data: { message: 'Logged out locally due to server error' }
      };
    }
  },

  /**
   * Force logout without API call (for invalid tokens)
   * @returns void
   */
  forceLogout: (): void => {
    removeSecureToken();
    console.log('User logged out due to invalid token');
  },

  /**
   * Check if user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated: (): boolean => {
    try {
      const token = getSecureToken();
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  },

  /**
   * Get current user from encrypted localStorage
   * @returns User object or null if not found
   */
  getCurrentUser: (): User | null => {
    try {
      return getSecureUserData();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Refresh authentication token
   * @returns Promise with new token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh');
      
      // Update stored token if successful
      if (response.data.success && response.data.data.token) {
        setSecureToken(response.data.data.token);
        
        if (response.data.data.user) {
          const transformedUser = transformApiUser(response.data.data.user);
          setSecureUserData(transformedUser);
        }
        
        console.log('Token refreshed successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On refresh failure, user likely needs to login again
      removeSecureToken();
      throw error;
    }
  },

  /**
   * Change user password
   * @param currentPassword - Current password for verification
   * @param newPassword - New password
   * @returns Promise with confirmation
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      console.log('Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param email - Email address for password reset
   * @returns Promise with confirmation
   */
  requestPasswordReset: async (email: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/request-reset', { email });
      
      console.log('Password reset requested successfully');
      return response.data;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Promise with confirmation
   */
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/auth/reset-password', {
        token,
        newPassword
      });
      
      console.log('Password reset completed successfully');
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },
};

export default AuthService;