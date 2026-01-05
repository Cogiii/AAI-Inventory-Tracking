import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { ConfirmationModal } from '@/components/ui';
import type { Position } from '@/services/api/users';
import type { Permissions, PermissionModule, PermissionAction } from '@/types';
import {
  createEmptyPermissions,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  MODULE_LABELS,
  ACTION_LABELS
} from '@/utils/permissions';

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
    description: '',
    permissions: createEmptyPermissions()
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    description: '',
    permissions: createEmptyPermissions()
  });

  const isEditing = !!position;

  useEffect(() => {
    if (position) {
      const data = {
        name: position.name,
        description: position.description || '',
        permissions: position.permissions || createEmptyPermissions()
      };
      setFormData(data);
      setOriginalFormData(data);
    } else {
      const defaultData = {
        name: '',
        description: '',
        permissions: createEmptyPermissions()
      };
      setFormData(defaultData);
      setOriginalFormData(defaultData);
    }
    setError(null);
  }, [position, isOpen]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  const handlePermissionChange = (module: PermissionModule, action: PermissionAction, checked: boolean) => {
    setFormData(prev => {
      const currentActions = prev.permissions[module] || [];
      let newActions: PermissionAction[];

      if (checked) {
        // Add action if not already present
        newActions = currentActions.includes(action)
          ? currentActions
          : [...currentActions, action];
      } else {
        // Remove action
        newActions = currentActions.filter(a => a !== action);
      }

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: newActions
        }
      };
    });
  };

  const handleSelectAll = (module: PermissionModule, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked ? [...PERMISSION_ACTIONS] : []
      }
    }));
  };

  const isAllSelected = (module: PermissionModule): boolean => {
    const actions = formData.permissions[module] || [];
    return PERMISSION_ACTIONS.every(action => actions.includes(action));
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

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirmation(false);
    onClose();
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditing ? 'Edit Position' : 'Create New Position'}
      size="2xl"
    >
      <ModalBody>
        <form id="position-form" onSubmit={handleSubmit} className="space-y-6">
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

          {/* Position Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter position description (optional)"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
            </div>
            <div className="space-y-4">
              {PERMISSION_MODULES.map((module) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${module}-all`}
                        checked={isAllSelected(module)}
                        onChange={(e) => handleSelectAll(module, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label htmlFor={`${module}-all`} className="ml-2 text-sm font-semibold text-gray-900">
                        {MODULE_LABELS[module]} - Full Access
                      </label>
                    </div>
                  </div>
                  <div className="ml-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PERMISSION_ACTIONS.map((action) => (
                      <div key={`${module}-${action}`} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${module}-${action}`}
                          checked={(formData.permissions[module] || []).includes(action)}
                          onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <label htmlFor={`${module}-${action}`} className="ml-2 text-sm text-gray-700">
                          {ACTION_LABELS[action]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="position-form"
          disabled={isLoading || !formData.name.trim()}
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
      </ModalFooter>
    </Modal>

    <ConfirmationModal
      isOpen={showDiscardConfirmation}
      type="warning"
      title="Discard Changes?"
      message="You have unsaved changes. Are you sure you want to discard them?"
      onConfirm={handleConfirmDiscard}
      onClose={() => setShowDiscardConfirmation(false)}
      confirmText="Discard"
      cancelText="Keep Editing"
    />
    </>
  );
};

export default PositionModal;
