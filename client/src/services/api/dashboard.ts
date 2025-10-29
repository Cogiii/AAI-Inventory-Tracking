import { api } from './index';
import type { 
  DashboardStats, 
  RecentProject, 
  InventoryLog, 
  ActivityLog, 
  LowStockItem, 
  InventorySummary 
} from '@/types';

export const dashboardApi = {
  // Get dashboard overview statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  // Get recent projects
  getRecentProjects: async (): Promise<RecentProject[]> => {
    const response = await api.get<RecentProject[]>('/dashboard/recent-projects');
    return response.data;
  },

  // Get recent inventory logs
  getInventoryLogs: async (): Promise<InventoryLog[]> => {
    const response = await api.get<InventoryLog[]>('/dashboard/inventory-logs');
    return response.data;
  },

  // Get recent activity logs
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await api.get<ActivityLog[]>('/dashboard/activity-logs');
    return response.data;
  },

  // Get low stock items
  getLowStockItems: async (): Promise<LowStockItem[]> => {
    const response = await api.get<LowStockItem[]>('/dashboard/low-stock-items');
    return response.data;
  },

  // Get inventory summary
  getInventorySummary: async (): Promise<InventorySummary[]> => {
    const response = await api.get<InventorySummary[]>('/dashboard/inventory-summary');
    return response.data;
  },
};