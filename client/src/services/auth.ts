import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async validateToken(): Promise<User | null> {
    try {
      const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
      return response.data.success ? response.data.data.user : null;
    } catch (error) {
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<{ success: boolean; data: { token: string } }>('/auth/refresh');
      return response.data.success ? response.data.data.token : null;
    } catch (error) {
      return null;
    }
  }
};