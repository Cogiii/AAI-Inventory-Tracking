import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api/dashboard';
import type { 
  DashboardStats, 
  RecentProject, 
  InventoryLog, 
  ActivityLog, 
  LowStockItem, 
  InventorySummary 
} from '@/types';

// Query keys for React Query
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentProjects: () => [...dashboardKeys.all, 'recent-projects'] as const,
  inventoryLogs: () => [...dashboardKeys.all, 'inventory-logs'] as const,
  activityLogs: () => [...dashboardKeys.all, 'activity-logs'] as const,
  lowStockItems: () => [...dashboardKeys.all, 'low-stock-items'] as const,
  inventorySummary: () => [...dashboardKeys.all, 'inventory-summary'] as const,
};

// Dashboard statistics hook
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Recent projects hook
export const useRecentProjects = () => {
  return useQuery<RecentProject[]>({
    queryKey: dashboardKeys.recentProjects(),
    queryFn: dashboardApi.getRecentProjects,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Inventory logs hook
export const useInventoryLogs = () => {
  return useQuery<InventoryLog[]>({
    queryKey: dashboardKeys.inventoryLogs(),
    queryFn: dashboardApi.getInventoryLogs,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Activity logs hook
export const useActivityLogs = () => {
  return useQuery<ActivityLog[]>({
    queryKey: dashboardKeys.activityLogs(),
    queryFn: dashboardApi.getActivityLogs,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Low stock items hook
export const useLowStockItems = () => {
  return useQuery<LowStockItem[]>({
    queryKey: dashboardKeys.lowStockItems(),
    queryFn: dashboardApi.getLowStockItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Inventory summary hook
export const useInventorySummary = () => {
  return useQuery<InventorySummary[]>({
    queryKey: dashboardKeys.inventorySummary(),
    queryFn: dashboardApi.getInventorySummary,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};