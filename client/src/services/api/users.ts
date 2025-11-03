import { api } from './index';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  position_id: number;
  position_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions: {
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

export interface Position {
  id: number;
  name: string;
  permissions: {
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
  created_at: string;
  updated_at: string;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  position_id?: string | number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    filters: {
      search: string;
      sort: string;
      order: string;
      position_id: string | number;
    };
  };
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  position_id: number;
  is_active?: boolean;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  position_id?: number;
  is_active?: boolean;
}

export interface CreatePositionData {
  name: string;
  permissions: {
    canManageProjects?: boolean;
    canEditProject?: boolean;
    canAddProject?: boolean;
    canDeleteProject?: boolean;
    canManageInventory?: boolean;
    canAddInventory?: boolean;
    canEditInventory?: boolean;
    canDeleteInventory?: boolean;
    canManageUsers?: boolean;
    canEditUser?: boolean;
    canAddUser?: boolean;
    canDeleteUser?: boolean;
  };
}

export interface UpdatePositionData {
  name?: string;
  permissions?: {
    canManageProjects?: boolean;
    canEditProject?: boolean;
    canAddProject?: boolean;
    canDeleteProject?: boolean;
    canManageInventory?: boolean;
    canAddInventory?: boolean;
    canEditInventory?: boolean;
    canDeleteInventory?: boolean;
    canManageUsers?: boolean;
    canEditUser?: boolean;
    canAddUser?: boolean;
    canDeleteUser?: boolean;
  };
}

// User Management API
export const usersApi = {
  // Get all users with filtering and pagination
  getUsers: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<{ success: boolean; message: string; data: { user: User } }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserData): Promise<{ success: boolean; message: string; data: { user: User } }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Toggle user status (activate/deactivate)
  toggleUserStatus: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change user password
  changePassword: async (id: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}/password`, { currentPassword, newPassword });
    return response.data;
  }
};

// Position Management API
export const positionsApi = {
  // Get all positions with permissions
  getPositions: async (): Promise<{ success: boolean; data: { positions: Position[] } }> => {
    const response = await api.get('/users/admin/positions');
    return response.data;
  },

  // Create new position
  createPosition: async (positionData: CreatePositionData): Promise<{ success: boolean; message: string; data: { position: Position } }> => {
    const response = await api.post('/users/admin/positions', positionData);
    return response.data;
  },

  // Update position
  updatePosition: async (id: number, positionData: UpdatePositionData): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/admin/positions/${id}`, positionData);
    return response.data;
  },

  // Delete position
  deletePosition: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/admin/positions/${id}`);
    return response.data;
  }
};