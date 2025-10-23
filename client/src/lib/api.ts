import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'manager' | 'admin';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  location: string;
  minStockLevel: number;
  supplier: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

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

// Auth API calls
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/me', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/auth/logout');
    return response.data;
  },
};

// Inventory API calls
export const inventoryApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginationResponse<InventoryItem>>> => {
    const response = await api.get<ApiResponse<PaginationResponse<InventoryItem>>>('/inventory', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ item: InventoryItem }>> => {
    const response = await api.get<ApiResponse<{ item: InventoryItem }>>(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>): Promise<ApiResponse<{ item: InventoryItem }>> => {
    const response = await api.post<ApiResponse<{ item: InventoryItem }>>('/inventory', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InventoryItem>): Promise<ApiResponse<{ item: InventoryItem }>> => {
    const response = await api.put<ApiResponse<{ item: InventoryItem }>>(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ deletedItem: InventoryItem }>> => {
    const response = await api.delete<ApiResponse<{ deletedItem: InventoryItem }>>(`/inventory/${id}`);
    return response.data;
  },

  getLowStock: async (): Promise<ApiResponse<{ items: InventoryItem[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ items: InventoryItem[]; count: number }>>('/inventory/alerts/low-stock');
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<{ categories: string[] }>> => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/inventory/meta/categories');
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categoryCounts: Record<string, number>;
  }>> => {
    const response = await api.get('/inventory/meta/stats');
    return response.data;
  },
};

// Users API calls (Admin/Manager only)
export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginationResponse<User>>> => {
    const response = await api.get<ApiResponse<PaginationResponse<User>>>('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ deletedUser: User }>> => {
    const response = await api.delete<ApiResponse<{ deletedUser: User }>>(`/users/${id}`);
    return response.data;
  },

  activate: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/deactivate`);
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;