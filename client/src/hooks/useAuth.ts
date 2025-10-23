import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginCredentials, RegisterData, User } from '@/types';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Auth validation hook
export const useAuthValidation = () => {
  const { setUser, setLoading } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: authService.validateToken,
    enabled: !!localStorage.getItem('token'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  // Handle the response manually using useEffect pattern
  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data);
    } else if (query.isError) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (!query.isLoading) {
      setLoading(false);
    }
  }, [query.isSuccess, query.isError, query.isLoading, query.data, setUser, setLoading]);

  return query;
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response) => {
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), user);
      setLoading(false);
    },
    onError: (error) => {
      setUser(null);
      setLoading(false);
      throw error;
    }
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response) => {
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), user);
      setLoading(false);
    },
    onError: (error) => {
      setUser(null);
      setLoading(false);
      throw error;
    }
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      // Clear all queries
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logout();
      queryClient.clear();
    }
  });
};