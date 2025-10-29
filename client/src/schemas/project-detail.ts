import { z } from 'zod';

// Personnel form schemas
export const PersonnelAssignmentSchema = z.object({
  personnel_id: z.number().min(1, 'Personnel is required'),
  role_id: z.number().min(1, 'Role is required'),
});

export const AddPersonnelFormSchema = z.object({
  personnel_assignments: z.array(PersonnelAssignmentSchema).min(1, 'At least one personnel assignment is required'),
  project_day_ids: z.array(z.number()).min(1, 'At least one project day is required'),
  apply_to_all_days: z.boolean().default(false),
});

// Project day form schemas
export const AddProjectDaySchema = z.object({
  project_date: z.string().min(1, 'Project date is required'),
  location_id: z.number().nullable().optional(),
  status: z.enum(['scheduled', 'ongoing', 'completed']),
});

export const UpdateProjectDaySchema = z.object({
  project_date: z.string().min(1, 'Project date is required'),
  location_id: z.number().optional(),
});

// Project items form schemas
export const ItemAssignmentSchema = z.object({
  item_id: z.number().min(1, 'Item is required'),
  allocated_quantity: z.number().min(1, 'Allocated quantity must be at least 1'),
  status: z.string().default('allocated'),
});

export const AddProjectItemsSchema = z.object({
  item_assignments: z.array(ItemAssignmentSchema).min(1, 'At least one item assignment is required'),
  project_day_ids: z.array(z.number()).min(1, 'At least one project day is required'),
  apply_to_all_days: z.boolean().default(false),
});

export const UpdateProjectItemSchema = z.object({
  allocated_quantity: z.number().min(0).optional(),
  damaged_quantity: z.number().min(0).optional(),
  lost_quantity: z.number().min(0).optional(),
  returned_quantity: z.number().min(0).optional(),
  status: z.enum(['allocated', 'in_use', 'partial_return', 'returned', 'damaged']).optional(),
});

// Export types
export type PersonnelAssignment = z.infer<typeof PersonnelAssignmentSchema>;
export type AddPersonnelFormData = z.infer<typeof AddPersonnelFormSchema>;
export type AddProjectDayData = z.infer<typeof AddProjectDaySchema>;
export type UpdateProjectDayData = z.infer<typeof UpdateProjectDaySchema>;
export type ItemAssignment = z.infer<typeof ItemAssignmentSchema>;
export type AddProjectItemsData = z.infer<typeof AddProjectItemsSchema>;
export type UpdateProjectItemData = z.infer<typeof UpdateProjectItemSchema>;