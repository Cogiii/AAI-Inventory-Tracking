import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  role: z.enum(['Administrator', 'Marketing Manager', 'Staff Member']).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Inventory schemas
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .default(''),
  category: z
    .string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  quantity: z
    .number()
    .min(0, 'Quantity cannot be negative')
    .int('Quantity must be a whole number'),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .min(3, 'SKU must be at least 3 characters')
    .max(20, 'SKU must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'SKU must contain only letters and numbers'),
  location: z
    .string()
    .max(100, 'Location must not exceed 100 characters')
    .default(''),
  minStockLevel: z
    .number()
    .min(0, 'Minimum stock level cannot be negative')
    .int('Minimum stock level must be a whole number')
    .default(0),
  supplier: z
    .string()
    .max(100, 'Supplier must not exceed 100 characters')
    .default('')
});

// Form-specific schema that's easier to work with in forms
export const inventoryItemFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  quantity: z
    .number()
    .min(0, 'Quantity cannot be negative')
    .int('Quantity must be a whole number'),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .min(3, 'SKU must be at least 3 characters')
    .max(20, 'SKU must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'SKU must contain only letters and numbers'),
  location: z
    .string()
    .max(100, 'Location must not exceed 100 characters'),
  minStockLevel: z
    .number()
    .min(0, 'Minimum stock level cannot be negative')
    .int('Minimum stock level must be a whole number'),
  supplier: z
    .string()
    .max(100, 'Supplier must not exceed 100 characters')
});

export const updateInventoryItemSchema = inventoryItemSchema.partial();

// User profile schema
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .optional(),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional(),
  confirmNewPassword: z
    .string()
    .optional()
}).refine((data) => {
  if (data.newPassword && !data.confirmNewPassword) {
    return false;
  }
  if (data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required when setting a new password',
  path: ['currentPassword']
});

// Search and filter schemas
export const inventoryFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  lowStock: z.boolean().optional()
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort: z.enum(['name', 'category', 'quantity', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;
export type UpdateInventoryItemFormData = z.infer<typeof updateInventoryItemSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type InventoryFilterData = z.infer<typeof inventoryFilterSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;