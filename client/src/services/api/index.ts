import axios, { type AxiosResponse, type AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { getSecureToken, removeSecureToken } from '../../utils/tokenSecurity';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getSecureToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    (config as any).metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const endTime = Date.now();
    const duration = endTime - ((response.config as any).metadata?.startTime || endTime);
    
    if (duration > 3000) {
      console.warn(`Slow API response: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`API Error [${status}] on ${url}:`, error.response?.data || error.message);

    if (status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {
      console.warn('Authentication failed - cleaning up secure session');
      removeSecureToken();
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    } else if (status === 429) {
      console.warn('Rate limit exceeded - please wait before trying again');
    } else if (status && status >= 500) {
      console.error('Server error - please try again later');
    }

    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      message: responseData?.error || responseData?.message || error.message || 'An error occurred',
      code: error.response?.status?.toString() || 'UNKNOWN',
      details: error.response?.data
    };

    return Promise.reject(apiError);
  }
);

export default api;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}