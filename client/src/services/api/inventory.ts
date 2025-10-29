import type { 
  InventoryItem, 
  InventoryItemFormData, 
  Brand, 
  Location 
} from '@/schemas';
import api from './';

// Get all inventory items with pagination and filtering
export const getInventoryItems = async (params?: {
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
  const { data } = await api.get('/inventory', { params });
  return data;
};

// Get single inventory item by ID
export const getInventoryItem = async (id: string | number) => {
  const { data } = await api.get(`/inventory/${id}`);
  return data;
};

// Create new inventory item
export const createInventoryItem = async (itemData: InventoryItemFormData) => {
  const { data } = await api.post('/inventory', itemData);
  return data;
};

// Update existing inventory item
export const updateInventoryItem = async (id: string | number, itemData: Partial<InventoryItemFormData>) => {
  const { data } = await api.put(`/inventory/${id}`, itemData);
  return data;
};

// Delete inventory item
export const deleteInventoryItem = async (id: string | number) => {
  const { data } = await api.delete(`/inventory/${id}`);
  return data;
};

// Get brands for dropdown
export const getBrands = async () => {
  const { data } = await api.get('/inventory/brands');
  return data;
};

// Get warehouse locations for dropdown
export const getLocations = async () => {
  const { data } = await api.get('/inventory/locations');
  console.log("DASDASDASDASDSA", data)
  return data;
};

// Get inventory statistics
export const getInventoryStats = async () => {
  const { data } = await api.get('/inventory/stats');
  return data;
};

// Create inventory item and assign to project
export const createInventoryItemWithProjectAssignment = async (itemData: {
  joNumber: string;
  project_day_ids?: number[];
  apply_to_all_schedules?: boolean;
  type: 'product' | 'material';
  brand_id?: number | null;
  name: string;
  description?: string;
  allocated_quantity?: number;
  damaged_quantity?: number;
  lost_quantity?: number;
  returned_quantity?: number;
  warehouse_location_id?: number | null;
}) => {
  const { data } = await api.post('/project-detail/create-item-and-assign', itemData);
  return data;
};

// Add multiple existing items to project
export const addProjectItems = async (itemsData: {
  joNumber: string;
  project_day_ids: number[];
  item_assignments: Array<{
    item_id: number;
    allocated_quantity: number;
    status: string;
  }>;
}) => {
  const { data } = await api.post('/project-detail/add-items', itemsData);
  return data;
};

// Get available items for project (no auth required)
export const getAvailableItemsForProject = async (joNumber: string) => {
  const { data } = await api.get(`/project-detail/items/${joNumber}`);
  return data;
};

// Inventory API types
export interface InventoryResponse {
  success: boolean;
  data: {
    items: InventoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    filters: {
      search?: string;
      type?: string;
      sort: string;
      order: string;
    };
  };
}

export interface SingleInventoryResponse {
  success: boolean;
  data: {
    item: InventoryItem;
  };
}

export interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
  };
}

export interface LocationsResponse {
  success: boolean;
  data: {
    locations: Location[];
  };
}

export interface InventoryStatsResponse {
  success: boolean;
  data: {
    totalItems: number;
    typeCounts: {
      product?: number;
      material?: number;
    };
    quantities: {
      total_delivered: number;
      total_available: number;
      total_damaged: number;
      total_lost: number;
    };
  };
}

// Export inventory items to Excel
export const exportInventoryToExcel = async (params?: {
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  type?: 'product' | 'material' | 'all';
  brand?: string;
  location?: string;
  status?: 'active' | 'low_stock' | 'out_of_stock' | 'inactive' | 'all';
}) => {
  const response = await api.get('/inventory/export/excel', { 
    params,
    responseType: 'blob' // Important for file downloads
  });
  return response.data;
};