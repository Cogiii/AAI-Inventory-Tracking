import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/services/api/projects';
import type { 
  ProjectFilters, 
  CreateProjectRequest, 
  UpdateProjectRequest 
} from '@/types';
// Simple toast utility for notifications
const toast = {
  success: (message: string) => {
    console.log('✅', message);
    // You can integrate with your preferred toast library here
  },
  error: (message: string) => {
    console.error('❌', message);
    // You can integrate with your preferred toast library here
  }
};

// Query Keys
export const projectsQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsQueryKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectsQueryKeys.lists(), filters] as const,
  details: () => [...projectsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectsQueryKeys.details(), id] as const,
  stats: () => [...projectsQueryKeys.all, 'stats'] as const,
};

// Custom Hooks for Projects

/**
 * Hook to fetch projects with filters and pagination
 */
export const useProjects = (filters: ProjectFilters = {}) => {
  return useQuery({
    queryKey: projectsQueryKeys.list(filters),
    queryFn: () => projectsApi.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch project statistics
 */
export const useProjectStats = () => {
  return useQuery({
    queryKey: projectsQueryKeys.stats(),
    queryFn: () => projectsApi.getProjectStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch a single project with full details
 */
export const useProject = (id: number, enabled = true) => {
  return useQuery({
    queryKey: projectsQueryKeys.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: enabled && id > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData: CreateProjectRequest) => 
      projectsApi.createProject(projectData),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      
      // Invalidate project stats
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.stats() });
      
      // Add the new project to the cache
      queryClient.setQueryData(
        projectsQueryKeys.detail(newProject.project_id),
        {
          project: newProject,
          project_days: [],
          project_items: []
        }
      );

      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create project';
      toast.error(message);
    },
  });
};

/**
 * Hook to update an existing project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) =>
      projectsApi.updateProject(id, data),
    onSuccess: (updatedProject, { id }) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      
      // Invalidate project stats
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.stats() });
      
      // Update the specific project detail in cache
      queryClient.setQueryData(
        projectsQueryKeys.detail(id),
        (oldData: any) => ({
          ...oldData,
          project: updatedProject
        })
      );

      toast.success('Project updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update project';
      toast.error(message);
    },
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      
      // Invalidate project stats
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.stats() });
      
      // Remove the deleted project from cache
      queryClient.removeQueries({ queryKey: projectsQueryKeys.detail(deletedId) });

      toast.success('Project deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete project';
      toast.error(message);
    },
  });
};

/**
 * Hook to prefetch project details
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: projectsQueryKeys.detail(id),
      queryFn: () => projectsApi.getProject(id),
      staleTime: 3 * 60 * 1000, // 3 minutes
    });
  };
};