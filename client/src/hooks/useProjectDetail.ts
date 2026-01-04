import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectDetailAPI, projectDetailMutationAPI } from '@/services/api/project-detail';

// Query keys
export const PROJECT_DETAIL_KEYS = {
  all: ['project-detail'] as const,
  detail: (joNumber: string, logsPage?: number, logsLimit?: number) => 
    [...PROJECT_DETAIL_KEYS.all, 'detail', joNumber, { logsPage, logsLimit }] as const,
  availableItems: (joNumber: string) => [...PROJECT_DETAIL_KEYS.all, 'available-items', joNumber] as const,
  personnelRoles: () => [...PROJECT_DETAIL_KEYS.all, 'personnel-roles'] as const,
  locations: () => [...PROJECT_DETAIL_KEYS.all, 'locations'] as const,
};

// Hook to get complete project details
export const useProjectDetail = (joNumber: string | undefined, logsPage: number = 1, logsLimit: number = 10) => {
  return useQuery({
    queryKey: PROJECT_DETAIL_KEYS.detail(joNumber || '', logsPage, logsLimit),
    queryFn: () => projectDetailAPI.getProjectDetail(joNumber!, logsPage, logsLimit),
    enabled: !!joNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};

// Hook to get available items for project
export const useAvailableItems = (joNumber: string | undefined) => {
  return useQuery({
    queryKey: PROJECT_DETAIL_KEYS.availableItems(joNumber || ''),
    queryFn: () => projectDetailAPI.getAvailableItems(joNumber!),
    enabled: !!joNumber,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get personnel and roles
export const usePersonnelRoles = () => {
  return useQuery({
    queryKey: PROJECT_DETAIL_KEYS.personnelRoles(),
    queryFn: projectDetailAPI.getPersonnelRoles,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook to get locations
export const useLocations = () => {
  return useQuery({
    queryKey: PROJECT_DETAIL_KEYS.locations(),
    queryFn: projectDetailAPI.getLocations,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mutation hooks
export const useCreatePersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectDetailMutationAPI.createPersonnel,
    onSuccess: () => {
      // Invalidate and refetch personnel list
      queryClient.invalidateQueries({
        queryKey: PROJECT_DETAIL_KEYS.personnelRoles(),
      });
    },
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectDetailMutationAPI.createLocation,
    onSuccess: () => {
      // Invalidate and refetch locations list
      queryClient.invalidateQueries({
        queryKey: PROJECT_DETAIL_KEYS.locations(),
      });
    },
  });
};

export const useAddPersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectDetailMutationAPI.addPersonnel,
    onSuccess: (_, variables) => {
      // Invalidate and refetch project detail for the affected project
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
    },
  });
};

export const useRemovePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.removePersonnel,
    onSuccess: (_, variables) => {
      // Invalidate project detail data
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
    },
  });
};

export const useAddProjectDay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.addProjectDay,
    onSuccess: (_, variables) => {
      // Invalidate project detail data
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
    },
  });
};

export const useUpdateProjectDay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.updateProjectDay,
    onSuccess: (_, variables) => {
      // Invalidate project detail data
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
    },
  });
};

export const useDeleteProjectDay = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.deleteProjectDay,
    onSuccess: (_, variables) => {
      // Invalidate project detail data
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
      // Invalidate available items for this project
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'available-items', joNumber],
        exact: false
      });
      // Invalidate all inventory queries since items are restored to inventory
      queryClient.invalidateQueries({ 
        queryKey: ['inventory'],
        exact: false
      });
    },
  });
};

export const useAddProjectItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.addProjectItems,
    onSuccess: (_, variables) => {
      // Invalidate both project detail and available items
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'available-items', joNumber],
        exact: false
      });
      // Also invalidate inventory queries to update stock everywhere
      queryClient.invalidateQueries({ 
        queryKey: ['inventory'],
        exact: false
      });
    },
  });
};

export const useUpdateProjectItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectDetailMutationAPI.updateProjectItem,
    onSuccess: (_, variables) => {
      // Invalidate project detail and available items data
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', 'available-items', joNumber],
        exact: false
      });
      // Also invalidate inventory queries to update stock everywhere
      queryClient.invalidateQueries({ 
        queryKey: ['inventory'],
        exact: false
      });
    },
  });
};

export const useDeleteProjectItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectDetailMutationAPI.deleteProjectItem,
    onSuccess: (_, variables) => {
      // Invalidate both project detail and available items
      const joNumber = variables.joNumber;
      queryClient.invalidateQueries({
        queryKey: ['project-detail', 'detail', joNumber],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: ['project-detail', 'available-items', joNumber],
        exact: false
      });
      // Also invalidate inventory queries to update stock everywhere
      queryClient.invalidateQueries({
        queryKey: ['inventory'],
        exact: false
      });
    },
  });
};

export const useCompleteProjectDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectDetailMutationAPI.completeProjectDay,
    onSuccess: () => {
      // Invalidate all project detail queries (day status changed)
      queryClient.invalidateQueries({
        queryKey: ['project-detail'],
        exact: false
      });
      // Invalidate all inventory queries (reserved -> available/damaged/lost)
      queryClient.invalidateQueries({
        queryKey: ['inventory'],
        exact: false
      });
    },
  });
};

export const useGetItemsForReconciliation = () => {
  return useMutation({
    mutationFn: projectDetailMutationAPI.getItemsForReconciliation,
  });
};

export default {
  useProjectDetail,
  useAvailableItems,
  usePersonnelRoles,
  useLocations,
  useCreatePersonnel,
  useCreateLocation,
  useAddPersonnel,
  useRemovePersonnel,
  useAddProjectDay,
  useUpdateProjectDay,
  useDeleteProjectDay,
  useAddProjectItems,
  useUpdateProjectItem,
  useDeleteProjectItem,
  useCompleteProjectDay,
  useGetItemsForReconciliation,
};
