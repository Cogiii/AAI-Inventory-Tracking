import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, ProjectFilters } from '@/types';

interface ProjectsStore {
  // State
  selectedProject: Project | null;
  filters: ProjectFilters;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setSelectedProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setCreateModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Computed
  hasActiveFilters: () => boolean;
}

const initialFilters: ProjectFilters = {
  page: 1,
  limit: 10,
  status: 'all',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'DESC',
};

export const useProjectsStore = create<ProjectsStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      selectedProject: null,
      filters: initialFilters,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      currentPage: 1,
      itemsPerPage: 10,

      // Actions
      setSelectedProject: (project) => 
        set({ selectedProject: project }, false, 'setSelectedProject'),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: newFilters.page !== undefined ? newFilters.page : state.currentPage,
          }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set(
          {
            filters: initialFilters,
            currentPage: 1,
          },
          false,
          'resetFilters'
        ),

      setCreateModalOpen: (open) =>
        set({ isCreateModalOpen: open }, false, 'setCreateModalOpen'),

      setEditModalOpen: (open) =>
        set(
          (state) => ({
            isEditModalOpen: open,
            // Clear selected project when closing edit modal
            selectedProject: open ? state.selectedProject : null,
          }),
          false,
          'setEditModalOpen'
        ),

      setDeleteModalOpen: (open) =>
        set(
          (state) => ({
            isDeleteModalOpen: open,
            // Clear selected project when closing delete modal
            selectedProject: open ? state.selectedProject : null,
          }),
          false,
          'setDeleteModalOpen'
        ),

      setCurrentPage: (page) =>
        set(
          (state) => ({
            currentPage: page,
            filters: { ...state.filters, page },
          }),
          false,
          'setCurrentPage'
        ),

      setItemsPerPage: (itemsPerPage) =>
        set(
          (state) => ({
            itemsPerPage,
            filters: { ...state.filters, limit: itemsPerPage, page: 1 },
            currentPage: 1,
          }),
          false,
          'setItemsPerPage'
        ),

      // Computed
      hasActiveFilters: () => {
        const { filters } = get();
        return (
          filters.status !== 'all' ||
          (filters.search && filters.search.trim() !== '') ||
          filters.sortBy !== 'created_at' ||
          filters.sortOrder !== 'DESC'
        );
      },
    }),
    {
      name: 'projects-store',
      // Only serialize non-function values for persistence
      partialize: (state: ProjectsStore) => ({
        selectedProject: state.selectedProject,
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);