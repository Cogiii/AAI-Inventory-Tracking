import type { Permissions, PermissionModule, PermissionAction } from '../types';

/**
 * Check if a user has a specific permission
 * @param permissions - The user's permissions object
 * @param module - The module to check (projects, inventory, users)
 * @param action - The action to check (view, add, edit, delete)
 * @returns boolean indicating if the user has the permission
 */
export const hasPermission = (
  permissions: Permissions | undefined | null,
  module: PermissionModule,
  action: PermissionAction
): boolean => {
  if (!permissions) return false;
  const modulePermissions = permissions[module];
  if (!modulePermissions || !Array.isArray(modulePermissions)) return false;
  return modulePermissions.includes(action);
};

/**
 * Check if a user has any permission for a module
 * @param permissions - The user's permissions object
 * @param module - The module to check
 * @returns boolean indicating if the user has any permission for the module
 */
export const hasAnyPermission = (
  permissions: Permissions | undefined | null,
  module: PermissionModule
): boolean => {
  if (!permissions) return false;
  const modulePermissions = permissions[module];
  return Array.isArray(modulePermissions) && modulePermissions.length > 0;
};

/**
 * Check if a user has all specified permissions
 * @param permissions - The user's permissions object
 * @param checks - Array of [module, action] tuples to check
 * @returns boolean indicating if the user has all specified permissions
 */
export const hasAllPermissions = (
  permissions: Permissions | undefined | null,
  checks: Array<[PermissionModule, PermissionAction]>
): boolean => {
  return checks.every(([module, action]) => hasPermission(permissions, module, action));
};

/**
 * Check if a user has any of the specified permissions
 * @param permissions - The user's permissions object
 * @param checks - Array of [module, action] tuples to check
 * @returns boolean indicating if the user has any of the specified permissions
 */
export const hasAnyOfPermissions = (
  permissions: Permissions | undefined | null,
  checks: Array<[PermissionModule, PermissionAction]>
): boolean => {
  return checks.some(([module, action]) => hasPermission(permissions, module, action));
};

/**
 * Get all permissions for a module
 * @param permissions - The user's permissions object
 * @param module - The module to get permissions for
 * @returns Array of permission actions or empty array
 */
export const getModulePermissions = (
  permissions: Permissions | undefined | null,
  module: PermissionModule
): PermissionAction[] => {
  if (!permissions) return [];
  const modulePermissions = permissions[module];
  return Array.isArray(modulePermissions) ? modulePermissions : [];
};

/**
 * Create an empty permissions object
 * @returns Empty permissions object with all modules as empty arrays
 */
export const createEmptyPermissions = (): Permissions => ({
  projects: [],
  inventory: [],
  users: []
});

/**
 * Create a full permissions object (all permissions)
 * @returns Permissions object with all actions for all modules
 */
export const createFullPermissions = (): Permissions => ({
  projects: ['view', 'add', 'edit', 'delete'],
  inventory: ['view', 'add', 'edit', 'delete'],
  users: ['view', 'add', 'edit', 'delete']
});

/**
 * All available permission modules
 */
export const PERMISSION_MODULES: PermissionModule[] = ['projects', 'inventory', 'users'];

/**
 * All available permission actions
 */
export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'add', 'edit', 'delete'];

/**
 * Module display names
 */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  projects: 'Projects',
  inventory: 'Inventory',
  users: 'Users'
};

/**
 * Action display names
 */
export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete'
};
