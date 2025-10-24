// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  id: number;
  email: string;
  role: UserRole;
  username: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
  name?: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'manager' | 'user';

// Auth related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Inventory related types
export interface InventoryItem extends BaseEntity {
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  location: string;
  minStockLevel: number;
  supplier: string;
  isLowStock: boolean;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
}

// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form related types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Route types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth: boolean;
  requiredRole?: UserRole;
  title: string;
}