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
  role?: UserRole; // Keep for backward compatibility
  username: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
  name?: string;
  lastLogin?: string;
  positionId?: number;
  positionName?: string;
  permissions?: {
    canManageProjects: boolean;
    canEditProject: boolean;
    canAddProject: boolean;
    canDeleteProject: boolean;
    canManageInventory: boolean;
    canAddInventory: boolean;
    canEditInventory: boolean;
    canDeleteInventory: boolean;
    canManageUsers: boolean;
    canEditUser: boolean;
    canAddUser: boolean;
    canDeleteUser: boolean;
  };
}

export type UserRole = 'Administrator' | 'Marketing Manager' | 'Staff Member';

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

// Filter related types
export interface FilterState {
  search: string;
  type: 'all' | 'product' | 'material';
  brand: string;
  location: string;
  status: 'all' | 'active' | 'low_stock' | 'out_of_stock' | 'inactive';
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

// Dashboard types
export interface DashboardStats {
  totalStocks: number;
  activeProjects: number;
  totalLocations: number;
  totalPersonnel: number;
  lowStockItems: number;
  todayAllocations: number;
}

export interface RecentProject {
  id: number;
  jo_number: string;
  name: string;
  description: string;
  status: 'ongoing' | 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  creator_first_name: string;
  creator_last_name: string;
  total_days: number;
  total_items_allocated: number;
}

export interface InventoryLog {
  id: number;
  log_type: 'in' | 'out' | 'transfer';
  reference_no: string;
  quantity: number;
  remarks: string;
  created_at: string;
  item_name: string;
  item_type: 'product' | 'material';
  from_location_name?: string;
  to_location_name?: string;
  handler_first_name?: string;
  handler_last_name?: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity: string;
  entity_id: number;
  description: string;
  created_at: string;
  user_first_name?: string;
  user_last_name?: string;
}

export interface LowStockItem {
  id: number;
  name: string;
  type: 'product' | 'material';
  available_quantity: number;
  delivered_quantity: number;
  brand_name?: string;
  warehouse_name?: string;
}

export interface InventorySummary {
  type: 'product' | 'material';
  item_count: number;
  total_quantity: number;
  total_delivered: number;
  total_damaged: number;
  total_lost: number;
}

// Project related types
export interface Project {
  project_id: number;
  jo_number: string;
  project_name: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by_name: string;
  total_project_days?: number;
  total_allocated_items?: number;
  total_allocated_quantity?: number;
  project_locations?: string;
}

export interface ProjectStats {
  total_projects: number;
  upcoming_projects: number;
  ongoing_projects: number;
  completed_projects: number;
  cancelled_projects: number;
  recent_activity: number;
  total_items_allocated: number;
  total_quantity_allocated: number;
}

export interface ProjectDay {
  project_day_id: number;
  project_date: string;
  location_id: number;
  location_name: string;
  location_type: string;
  city: string;
  province: string;
  total_items: number;
  total_allocated_quantity: number;
}

export interface ProjectItem {
  item_id: number;
  item_name: string;
  item_type: string;
  brand_name: string;
  total_allocated: number;
  total_damaged: number;
  total_lost: number;
  total_returned: number;
}

export interface ProjectDetails {
  project: Project;
  project_days: ProjectDay[];
  project_items: ProjectItem[];
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProjects: number;
    limit: number;
  };
}

export interface CreateProjectRequest {
  jo_number: string;
  name: string;
  description?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateProjectRequest {
  jo_number?: string;
  name?: string;
  description?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Calendar related types
export interface CalendarEvent {
  id: number;
  jo_number: string;
  name: string;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  project_days: CalendarProjectDay[];
}

export interface CalendarProjectDay {
  id: number;
  date: string; // YYYY-MM-DD format
  location: string;
  location_id?: number;
  full_address?: string;
  location_type?: 'warehouse' | 'project_site' | 'office';
}

export interface CalendarEventsResponse {
  success: boolean;
  data: CalendarEvent[];
  total: number;
  message: string;
  month?: number;
  year?: number;
}

export interface CalendarEventsParams {
  start_date?: string;
  end_date?: string;
}