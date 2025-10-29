import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as inventoryAPI from '@/services/api/inventory';
import type { InventoryItemFormData } from '@/schemas';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...inventoryKeys.lists(), { params }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...inventoryKeys.details(), id] as const,
  brands: () => [...inventoryKeys.all, 'brands'] as const,
  locations: () => [...inventoryKeys.all, 'locations'] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
};

// Get all inventory items
export const useInventoryItems = (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  type?: 'product' | 'material' | 'all';
  brand?: string;
  location?: string;
  status?: 'active' | 'low_stock' | 'out_of_stock' | 'inactive' | 'all';
}) => {
  return useQuery({
    queryKey: inventoryKeys.list(params || {}),
    queryFn: () => inventoryAPI.getInventoryItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single inventory item
export const useInventoryItem = (id: string | number, enabled: boolean = true) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryAPI.getInventoryItem(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get brands for dropdown
export const useBrands = () => {
  return useQuery({
    queryKey: inventoryKeys.brands(),
    queryFn: inventoryAPI.getBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Get locations for dropdown
export const useLocations = () => {
  return useQuery({
    queryKey: inventoryKeys.locations(),
    queryFn: inventoryAPI.getLocations,
    staleTime: 10 * 60 * 1000, // 10 minutes - locations don't change often
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Get inventory statistics
export const useInventoryStats = () => {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: inventoryAPI.getInventoryStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create inventory item mutation
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryAPI.createInventoryItem,
    onSuccess: () => {
      // Invalidate and refetch inventory list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to create item:', error);
    },
  });
};

// Create inventory item with project assignment mutation
export const useCreateInventoryItemWithProjectAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryAPI.createInventoryItemWithProjectAssignment,
    onSuccess: () => {
      // Invalidate and refetch inventory list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      // Also invalidate project details since we're adding items to projects
      queryClient.invalidateQueries({ queryKey: ['project-detail'] });
    },
    onError: (error: any) => {
      console.error('Failed to create item with project assignment:', error);
    },
  });
};

// Update inventory item mutation
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<InventoryItemFormData> }) =>
      inventoryAPI.updateInventoryItem(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch inventory list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to update item:', error);
    },
  });
};

// Delete inventory item mutation
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryAPI.deleteInventoryItem,
    onSuccess: (_, variables) => {
      // Invalidate and refetch inventory list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: inventoryKeys.detail(variables) });
    },
    onError: (error: any) => {
      console.error('Failed to delete item:', error);
    },
  });
};

// Add multiple project items mutation
export const useAddProjectItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryAPI.addProjectItems,
    onSuccess: () => {
      // Invalidate project details since we're adding items to projects
      queryClient.invalidateQueries({ queryKey: ['project-detail'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
    },
    onError: (error: any) => {
      console.error('Failed to add project items:', error);
    },
  });
};

// Get available items for a specific project
export const useAvailableItemsForProject = (joNumber?: string) => {
  return useQuery({
    queryKey: ['project-detail', 'available-items', joNumber],
    queryFn: () => inventoryAPI.getAvailableItemsForProject(joNumber!),
    enabled: !!joNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Export inventory to Excel
export const useExportInventory = () => {
  return useMutation({
    mutationFn: (params?: {
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      type?: 'product' | 'material' | 'all';
      brand?: string;
      location?: string;
      status?: 'active' | 'low_stock' | 'out_of_stock' | 'inactive' | 'all';
    }) => inventoryAPI.exportInventoryToExcel(params),
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};