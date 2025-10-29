import { api } from './index';

// Types for Projects API
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

// Projects API Service
export const projectsApi = {
  // Get all projects with filters and pagination
  getProjects: async (filters: ProjectFilters = {}): Promise<ProjectsResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/projects?${params.toString()}`);
    return response.data.data;
  },

  // Get project statistics
  getProjectStats: async (): Promise<ProjectStats> => {
    const response = await api.get('/projects/stats');
    return response.data.data;
  },

  // Get single project with full details
  getProject: async (id: number): Promise<ProjectDetails> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  // Create new project
  createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
    const response = await api.post('/projects', projectData);
    return response.data.data;
  },

  // Update existing project
  updateProject: async (id: number, projectData: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data.data;
  },

  // Delete project (soft delete)
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};