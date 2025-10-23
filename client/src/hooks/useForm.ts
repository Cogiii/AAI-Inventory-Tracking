import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  inventoryItemFormSchema,
  userProfileSchema,
  type LoginFormData,
  type RegisterFormData,
  type InventoryItemFormData,
  type UserProfileFormData
} from '@/schemas';

// Specific form hooks for better type safety and reusability
export function useLoginForm(defaultValues?: Partial<LoginFormData>) {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: 'onChange'
  });
}

export function useRegisterForm(defaultValues?: Partial<RegisterFormData>) {
  return useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues,
    mode: 'onChange'
  });
}

export function useInventoryItemForm(defaultValues?: Partial<InventoryItemFormData>) {
  return useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      quantity: 0,
      price: 0,
      sku: '',
      location: '',
      minStockLevel: 0,
      supplier: '',
      ...defaultValues
    },
    mode: 'onChange'
  });
}

export function useUserProfileForm(defaultValues?: Partial<UserProfileFormData>) {
  return useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues,
    mode: 'onChange'
  });
}