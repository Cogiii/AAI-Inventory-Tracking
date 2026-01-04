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

// Create a new brand
export const createBrand = async (brandData: { name: string; description?: string }) => {
  const { data } = await api.post('/inventory/brands', brandData);
  return data;
};

// Get warehouse locations for dropdown
export const getLocations = async () => {
  const { data } = await api.get('/inventory/locations');
  return data;
};

// Get inventory statistics
export const getInventoryStats = async () => {
  const { data } = await api.get('/inventory/stats');
  return data;
};

// Update item quantity
export const updateItemQuantity = async (id: string | number, quantityData: { delivered_quantity: number }) => {
  const { data } = await api.put(`/inventory/${id}/quantity`, quantityData);
  return data;
};

// Move item location
export const moveItemLocation = async (id: string | number, locationData: { warehouse_location_id: number }) => {
  const { data } = await api.put(`/inventory/${id}/location`, locationData);
  return data;
};

// Report issue (damage or loss)
export const reportItemIssue = async (id: string | number, issueData: {
  issue_type: 'damage' | 'loss';
  quantity: number;
  description?: string;
}) => {
  const { data } = await api.post(`/inventory/${id}/issue`, issueData);
  return data;
};

// Get activity logs for item
export const getItemActivity = async (id: string | number) => {
  const { data } = await api.get(`/inventory/${id}/activity`);
  return data;
};

// Get item reservations (scheduled project allocations)
export const getItemReservations = async (id: string | number) => {
  const { data } = await api.get(`/inventory/${id}/reservations`);
  return data;
};

// Reservation response types
export interface ItemReservation {
  project_item_id: number;
  reserved_quantity: number;
  project_day_id: number;
  project_date: string;
  project_id: number;
  jo_number: string;
  project_name: string;
  location_name: string | null;
}

export interface ReservationsResponse {
  success: boolean;
  data: {
    item_id: number;
    item_name: string;
    total_reserved: number;
    reservations: ItemReservation[];
  };
}

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

// ====================
// MULTI-WAREHOUSE API FUNCTIONS
// ====================

// Item location types
export interface ItemLocation {
  id: number;
  item_id: number;
  location_id: number;
  location_name: string;
  location_type: string;
  city: string;
  province: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;
  created_at: string;
  updated_at: string | null;
}

export interface ItemLocationsResponse {
  success: boolean;
  message: string;
  data: {
    item: { id: number; name: string; total_delivered: number };
    locations: ItemLocation[];
  };
}

// Delivery types
export interface DeliveryFormData {
  location_id: number;
  quantity: number;
  reference_number?: string;
  notes?: string;
}

export interface DeliveryLogEntry {
  id: number;
  item_id: number;
  location_id: number;
  location_name: string;
  quantity: number;
  type: 'delivery' | 'adjustment';
  adjustment_reason: string | null;
  notes: string | null;
  reference_number: string | null;
  performed_by: number | null;
  performed_by_name: string | null;
  created_at: string;
}

export interface DeliveryHistoryResponse {
  success: boolean;
  message: string;
  data: {
    item: { id: number; name: string };
    deliveries: DeliveryLogEntry[];
  };
}

// Adjustment types
export interface AdjustmentFormData {
  location_id: number;
  quantity: number;
  reason: string;
}

// Transfer types
export interface TransferFormData {
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  notes?: string;
}

// Get item locations with quantities
export const getItemLocations = async (id: string | number): Promise<ItemLocationsResponse> => {
  const { data } = await api.get(`/inventory/${id}/locations`);
  return data;
};

// Add delivery to item at specific location
export const addDelivery = async (id: string | number, deliveryData: DeliveryFormData) => {
  const { data } = await api.post(`/inventory/${id}/delivery`, deliveryData);
  return data;
};

// Adjust quantity at location (admin only)
export const adjustQuantity = async (id: string | number, adjustmentData: AdjustmentFormData) => {
  const { data } = await api.post(`/inventory/${id}/adjustment`, adjustmentData);
  return data;
};

// Transfer stock between locations
export const transferStock = async (id: string | number, transferData: TransferFormData) => {
  const { data } = await api.post(`/inventory/${id}/transfer`, transferData);
  return data;
};

// Get delivery and adjustment history
export const getDeliveryHistory = async (id: string | number): Promise<DeliveryHistoryResponse> => {
  const { data } = await api.get(`/inventory/${id}/deliveries`);
  return data;
};