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

// Inventory schemas (based on database schema)
export const inventoryItemSchema = z.object({
  type: z.enum(['product', 'material']),
  brand_id: z
    .number()
    .positive('Brand ID must be a positive number')
    .nullable()
    .optional(),
  name: z
    .string()
    .min(1, 'Item name is required')
    .min(2, 'Item name must be at least 2 characters')
    .max(255, 'Item name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .nullable()
    .optional(),
  delivered_quantity: z
    .number()
    .min(0, 'Delivered quantity cannot be negative')
    .int('Delivered quantity must be a whole number')
    .default(0),
  damaged_quantity: z
    .number()
    .min(0, 'Damaged quantity cannot be negative')
    .int('Damaged quantity must be a whole number')
    .default(0),
  lost_quantity: z
    .number()
    .min(0, 'Lost quantity cannot be negative')
    .int('Lost quantity must be a whole number')
    .default(0),
  available_quantity: z
    .number()
    .min(0, 'Available quantity cannot be negative')
    .int('Available quantity must be a whole number')
    .default(0),
  warehouse_location_id: z
    .number()
    .positive('Warehouse location ID must be a positive number')
    .nullable()
    .optional(),
  status: z
    .string()
    .max(50, 'Status must not exceed 50 characters')
    .nullable()
    .optional()
});

// Form-specific schema that's easier to work with in forms
export const inventoryItemFormSchema = z.object({
  type: z.enum(['product', 'material']),
  brand_id: z
    .string()
    .optional()
    .transform(val => val === '' ? null : Number(val))
    .refine(val => val === null || !isNaN(val as number), 'Invalid brand'),
  name: z
    .string()
    .min(1, 'Item name is required')
    .min(2, 'Item name must be at least 2 characters')
    .max(255, 'Item name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  delivered_quantity: z
    .string()
    .optional()
    .transform(val => val === '' ? 0 : Number(val))
    .refine(val => !isNaN(val) && val >= 0, 'Delivered quantity must be a non-negative number'),
  damaged_quantity: z
    .string()
    .optional()
    .transform(val => val === '' ? 0 : Number(val))
    .refine(val => !isNaN(val) && val >= 0, 'Damaged quantity must be a non-negative number'),
  lost_quantity: z
    .string()
    .optional()
    .transform(val => val === '' ? 0 : Number(val))
    .refine(val => !isNaN(val) && val >= 0, 'Lost quantity must be a non-negative number'),
  available_quantity: z
    .string()
    .optional()
    .transform(val => val === '' ? 0 : Number(val))
    .refine(val => !isNaN(val) && val >= 0, 'Available quantity must be a non-negative number'),
  warehouse_location_id: z
    .string()
    .optional()
    .transform(val => val === '' ? null : Number(val))
    .refine(val => val === null || !isNaN(val as number), 'Invalid warehouse location'),
  status: z
    .string()
    .max(50, 'Status must not exceed 50 characters')
    .optional()
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
  sort: z.enum(['name', 'type', 'available_quantity', 'delivered_quantity', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

// Brand and Location types for dropdowns
export const brandSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const locationSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.string().optional(),
  province: z.string().optional()
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
// Input type for forms (before transformation)
export type InventoryItemFormInput = z.input<typeof inventoryItemFormSchema>;
// Output type after transformation
export type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;
export type UpdateInventoryItemFormData = z.infer<typeof updateInventoryItemSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type InventoryFilterData = z.infer<typeof inventoryFilterSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Location = z.infer<typeof locationSchema>;

// Project schemas
export const projectStatusSchema = z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']);

export const createProjectSchema = z.object({
  jo_number: z
    .string()
    .min(1, 'JO Number is required')
    .min(3, 'JO Number must be at least 3 characters')
    .max(100, 'JO Number must not exceed 100 characters')
    .regex(/^[A-Z0-9-]+$/, 'JO Number must contain only uppercase letters, numbers, and hyphens'),
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(255, 'Project name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: projectStatusSchema.default('upcoming'),
});

export const updateProjectSchema = z.object({
  jo_number: z
    .string()
    .min(3, 'JO Number must be at least 3 characters')
    .max(100, 'JO Number must not exceed 100 characters')
    .regex(/^[A-Z0-9-]+$/, 'JO Number must contain only uppercase letters, numbers, and hyphens')
    .optional(),
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(255, 'Project name must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: projectStatusSchema.optional(),
});

export const projectFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(5).max(100).default(10),
  status: z.string().default('all'),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'name', 'jo_number', 'status']).default('created_at'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type ProjectFiltersFormData = z.infer<typeof projectFiltersSchema>;