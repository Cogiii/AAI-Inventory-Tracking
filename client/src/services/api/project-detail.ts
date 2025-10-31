import { api } from './index';

// Base interfaces
export interface ProjectDetailResponse {
  project: ProjectInfo;
  project_days: ProjectDay[];
  logs: ProjectLog[];
}

export interface ProjectInfo {
  id: number;
  jo_number: string;
  name: string;
  description: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProjectDay {
  id: number;
  project_id: number;
  project_date: string;
  location_id: number | null;
  location_name: string | null;
  location_type: 'warehouse' | 'project_site' | 'office' | null;
  full_address: string | null;
  created_at: string;
  updated_at: string | null;
  items: ProjectItem[];
  personnel: ProjectPersonnel[];
}

export interface ProjectItem {
  id: number;
  project_day_id: number;
  item_id: number;
  allocated_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;
  returned_quantity: number;
  status: string;
  item_name: string;
  item_type: 'product' | 'material';
  brand_name: string | null;
  warehouse_location: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProjectPersonnel {
  project_day_id: number;
  personnel_id: number;
  role_id: number;
  personnel_name: string;
  contact_number: string | null;
  role_name: string;
}

export interface ProjectLog {
  id: number;
  project_id: number;
  project_day_id: number | null;
  log_type: 'status_change' | 'activity' | 'incident';
  description: string;
  recorded_by: number | null;
  recorded_by_name: string | null;
  created_at: string;
}

export interface AvailableItem {
  id: number;
  name: string;
  type: 'product' | 'material';
  description: string | null;
  available_quantity: number;
  brand_name: string | null;
  warehouse_location: string | null;
}

export interface Personnel {
  id: number;
  name: string;
  contact_number: string | null;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface PersonnelRoleData {
  personnel: Personnel[];
  roles: Role[];
}

export interface Location {
  id: number;
  name: string;
  type: 'warehouse' | 'project_site' | 'office';
  street: string | null;
  barangay: string | null;
  city: string;
  province: string;
  region: string | null;
  postal_code: string | null;
  country: string;
  full_address: string;
}

// API functions
export const projectDetailAPI = {
  // Get complete project details by JO number
  getProjectDetail: async (joNumber: string): Promise<ProjectDetailResponse> => {
    const response = await api.get(`/project-detail/jo/${joNumber}`);
    return response.data.data;
  },

  // Get available items for adding to project
  getAvailableItems: async (joNumber: string): Promise<AvailableItem[]> => {
    const response = await api.get(`/project-detail/items/${joNumber}`);
    return response.data.data;
  },

  // Get personnel and roles data
  getPersonnelRoles: async (): Promise<PersonnelRoleData> => {
    const response = await api.get('/project-detail/personnel');
    return response.data.data;
  },

  // Get all locations
  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/project-detail/locations');
    return response.data.data;
  }
};

// Mutation API functions
export const projectDetailMutationAPI = {
  // Personnel mutations
  addPersonnel: async (data: { 
    joNumber: string;
    project_day_ids: number[];
    personnel_assignments: Array<{
      personnel_id: number;
      role_id: number;
    }>;
    recorded_by?: number;
  }) => {
    const response = await api.post('/project-detail/personnel', {
      joNumber: data.joNumber,
      project_day_ids: data.project_day_ids,
      personnel_assignments: data.personnel_assignments,
      recorded_by: data.recorded_by
    });
    return response.data;
  },

  removePersonnel: async (data: {
    joNumber: string;
    projectDayId: number;
    personnelId: number;
    roleId: number;
    recorded_by?: number;
  }) => {
    const response = await api.delete(
      `/project-detail/personnel/${data.joNumber}/${data.projectDayId}/${data.personnelId}/${data.roleId}`,
      {
        data: { recorded_by: data.recorded_by }
      }
    );
    return response.data;
  },

  // Project day mutations
  addProjectDay: async (data: {
    joNumber: string;
    project_id: number;
    project_date: string;
    location_id?: number;
  }) => {
    const response = await api.post('/project-detail/project-days', {
      project_id: data.project_id,
      project_date: data.project_date,
      location_id: data.location_id
    });
    return response.data;
  },

  updateProjectDay: async (data: {
    joNumber: string;
    id: number;
    project_date: string;
    location_id?: number;
  }) => {
    const response = await api.put(`/project-detail/project-days/${data.id}`, {
      project_date: data.project_date,
      location_id: data.location_id
    });
    return response.data;
  },

  deleteProjectDay: async (data: {
    joNumber: string;
    id: number;
  }) => {
    const response = await api.delete(`/project-detail/project-days/${data.id}`);
    return response.data;
  },

  // Project items mutations
  addProjectItems: async (data: {
    joNumber: string;
    project_day_ids: number[];
    item_assignments: Array<{
      item_id: number;
      allocated_quantity: number;
      status?: string;
    }>;
    recorded_by?: number;
  }) => {
    const response = await api.post('/project-detail/project-items', {
      joNumber: data.joNumber,
      project_day_ids: data.project_day_ids,
      item_assignments: data.item_assignments,
      recorded_by: data.recorded_by
    });
    return response.data;
  },

  updateProjectItem: async (data: {
    joNumber: string;
    id: number;
    allocated_quantity?: number;
    damaged_quantity?: number;
    lost_quantity?: number;
    returned_quantity?: number;
    status?: string;
  }) => {
    const response = await api.put(`/project-detail/project-items/${data.id}`, {
      allocated_quantity: data.allocated_quantity,
      damaged_quantity: data.damaged_quantity,
      lost_quantity: data.lost_quantity,
      returned_quantity: data.returned_quantity,
      status: data.status
    });
    return response.data;
  },

  deleteProjectItem: async (data: {
    joNumber: string;
    id: number;
  }) => {
    const response = await api.delete(`/project-detail/project-items/${data.id}`);
    return response.data;
  }
};

export default projectDetailAPI;