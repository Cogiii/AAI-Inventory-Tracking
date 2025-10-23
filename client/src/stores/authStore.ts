import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await authService.login(credentials);
            
            if (response.success) {
              const { user, token } = response.data;
              
              // Store token in localStorage
              localStorage.setItem('token', token);
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
            } else {
              throw new Error(response.message || 'Login failed');
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.response?.data?.error || error.message || 'Login failed'
            });
            throw error;
          }
        },

        register: async (data: RegisterData) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await authService.register(data);
            
            if (response.success) {
              const { user, token } = response.data;
              
              // Store token in localStorage
              localStorage.setItem('token', token);
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
            } else {
              throw new Error(response.message || 'Registration failed');
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.response?.data?.error || error.message || 'Registration failed'
            });
            throw error;
          }
        },

        logout: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setUser: (user: User | null) => {
          set({ 
            user,
            isAuthenticated: !!user
          });
        },

        initializeAuth: async () => {
          try {
            set({ isLoading: true });
            
            const token = localStorage.getItem('token');
            
            if (token) {
              // Validate token with backend
              const user = await authService.validateToken();
              
              if (user) {
                set({
                  user,
                  token,
                  isAuthenticated: true,
                  isLoading: false
                });
              } else {
                // Invalid token, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false
                });
              }
            } else {
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);