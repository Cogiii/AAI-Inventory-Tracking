import React, { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Position } from '@/services/api/users';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: Position | null;
  onCreatePosition: (data: any) => Promise<any>;
  onUpdatePosition: (id: number, data: any) => Promise<any>;
}

const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  position,
  onCreatePosition,
  onUpdatePosition
}) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: {
      canManageProjects: false,
      canEditProject: false,
      canAddProject: false,
      canDeleteProject: false,
      canManageInventory: false,
      canAddInventory: false,
      canEditInventory: false,
      canDeleteInventory: false,
      canManageUsers: false,
      canEditUser: false,
      canAddUser: false,
      canDeleteUser: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!position;

  useEffect(() => {
    if (position) {
      setFormData({
        name: position.name,
        permissions: { ...position.permissions }
      });
    } else {
      setFormData({
        name: '',
        permissions: {
          canManageProjects: false,
          canEditProject: false,
          canAddProject: false,
          canDeleteProject: false,
          canManageInventory: false,
          canAddInventory: false,
          canEditInventory: false,
          canDeleteInventory: false,
          canManageUsers: false,
          canEditUser: false,
          canAddUser: false,
          canDeleteUser: false
        }
      });
    }
    setError(null);
  }, [position]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));

    // Auto-enable all sub-permissions when "manage" permission is enabled
    if (checked && permission.startsWith('canManage')) {
      const area = permission.replace('canManage', '').toLowerCase();
      const relatedPermissions: Record<string, string[]> = {
        projects: ['canEditProject', 'canAddProject', 'canDeleteProject'],
        inventory: ['canEditInventory', 'canAddInventory', 'canDeleteInventory'],
        users: ['canEditUser', 'canAddUser', 'canDeleteUser']
      };

      if (relatedPermissions[area]) {
        setFormData(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            ...relatedPermissions[area].reduce((acc, perm) => ({ ...acc, [perm]: true }), {})
          }
        }));
      }
    }

    // Auto-disable "manage" permission when all sub-permissions are disabled
    if (!checked && !permission.startsWith('canManage')) {
      const area = permission.replace(/^can(Edit|Add|Delete)/, '').toLowerCase();
      const managePermission = `canManage${area.charAt(0).toUpperCase() + area.slice(1)}s`;
      
      setFormData(prev => {
        const otherPermissions = Object.entries(prev.permissions)
          .filter(([key]) => key !== permission && key !== managePermission && key.toLowerCase().includes(area))
          .some(([, value]) => value);

        return {
          ...prev,
          permissions: {
            ...prev.permissions,
            [managePermission]: otherPermissions
          }
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && position) {
        await onUpdatePosition(position.id, formData);
      } else {
        await onCreatePosition(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const permissionGroups = [
    {
      title: 'Project Management',
      manage: 'canManageProjects',
      permissions: [
        { key: 'canEditProject', label: 'Edit Projects' },
        { key: 'canAddProject', label: 'Add Projects' },
        { key: 'canDeleteProject', label: 'Delete Projects' }
      ]
    },
    {
      title: 'Inventory Management',
      manage: 'canManageInventory',
      permissions: [
        { key: 'canEditInventory', label: 'Edit Inventory' },
        { key: 'canAddInventory', label: 'Add Inventory' },
        { key: 'canDeleteInventory', label: 'Delete Inventory' }
      ]
    },
    {
      title: 'User Management',
      manage: 'canManageUsers',
      permissions: [
        { key: 'canEditUser', label: 'Edit Users' },
        { key: 'canAddUser', label: 'Add Users' },
        { key: 'canDeleteUser', label: 'Delete Users' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Position' : 'Create New Position'}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Position Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Position Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter position name"
              required
              disabled={isLoading}
            />
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.title} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={group.manage}
                      checked={formData.permissions[group.manage as keyof typeof formData.permissions]}
                      onChange={(e) => handlePermissionChange(group.manage, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <label htmlFor={group.manage} className="ml-2 text-sm font-semibold text-gray-900">
                      {group.title} - Full Access
                    </label>
                  </div>
                  <div className="ml-6 space-y-2">
                    {group.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={perm.key}
                          checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <label htmlFor={perm.key} className="ml-2 text-sm text-gray-700">
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Update Position' : 'Create Position'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionModal;