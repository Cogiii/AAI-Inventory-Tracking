import { create } from 'zustand';

interface ProjectDetailModalState {
  // Personnel modal
  isPersonnelModalOpen: boolean;
  personnelModalData: any | null;
  
  // Project day modals
  isAddDayModalOpen: boolean;
  isEditDayModalOpen: boolean;
  editingDay: any | null;
  
  // Item modals
  isAddItemModalOpen: boolean;
  isEditItemModalOpen: boolean;
  editingItem: any | null;
  
  // General modal states
  applyToAllDays: boolean;
  selectedProjectDays: number[];
  
  // Actions
  openPersonnelModal: (data?: any) => void;
  closePersonnelModal: () => void;
  
  openAddDayModal: () => void;
  closeAddDayModal: () => void;
  
  openEditDayModal: (day: any) => void;
  closeEditDayModal: () => void;
  
  openAddItemModal: () => void;
  closeAddItemModal: () => void;
  
  openEditItemModal: (item: any) => void;
  closeEditItemModal: () => void;
  
  setApplyToAllDays: (value: boolean) => void;
  setSelectedProjectDays: (days: number[]) => void;
  
  // Reset all modals
  resetAllModals: () => void;
}

export const useProjectDetailModalStore = create<ProjectDetailModalState>((set) => ({
  // Initial state
  isPersonnelModalOpen: false,
  personnelModalData: null,
  
  isAddDayModalOpen: false,
  isEditDayModalOpen: false,
  editingDay: null,
  
  isAddItemModalOpen: false,
  isEditItemModalOpen: false,
  editingItem: null,
  
  applyToAllDays: false,
  selectedProjectDays: [],
  
  // Actions
  openPersonnelModal: (data = null) => set({ 
    isPersonnelModalOpen: true, 
    personnelModalData: data 
  }),
  closePersonnelModal: () => set({ 
    isPersonnelModalOpen: false, 
    personnelModalData: null 
  }),
  
  openAddDayModal: () => set({ isAddDayModalOpen: true }),
  closeAddDayModal: () => set({ isAddDayModalOpen: false }),
  
  openEditDayModal: (day) => set({ 
    isEditDayModalOpen: true, 
    editingDay: day 
  }),
  closeEditDayModal: () => set({ 
    isEditDayModalOpen: false, 
    editingDay: null 
  }),
  
  openAddItemModal: () => set({ isAddItemModalOpen: true }),
  closeAddItemModal: () => set({ isAddItemModalOpen: false }),
  
  openEditItemModal: (item) => set({ 
    isEditItemModalOpen: true, 
    editingItem: item 
  }),
  closeEditItemModal: () => set({ 
    isEditItemModalOpen: false, 
    editingItem: null 
  }),
  
  setApplyToAllDays: (value) => set({ applyToAllDays: value }),
  setSelectedProjectDays: (days) => set({ selectedProjectDays: days }),
  
  resetAllModals: () => set({
    isPersonnelModalOpen: false,
    personnelModalData: null,
    isAddDayModalOpen: false,
    isEditDayModalOpen: false,
    editingDay: null,
    isAddItemModalOpen: false,
    isEditItemModalOpen: false,
    editingItem: null,
    applyToAllDays: false,
    selectedProjectDays: [],
  }),
}));