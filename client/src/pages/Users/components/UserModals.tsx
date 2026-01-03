import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Check } from 'lucide-react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  position_id: number;
  position_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Position {
  id: number;
  name: string;
}

interface UserModalsProps {
  showAddModal: boolean;
  selectedUser: User | null;
  onCloseAddModal: () => void;
  onCloseEditModal: () => void;
  currentUserRole?: string;
  positions: Position[];
  onCreateUser: (userData: any) => Promise<any>;
  onUpdateUser: (id: number, userData: any) => Promise<any>;
}

const UserModals: FC<UserModalsProps> = ({
  showAddModal,
  selectedUser,
  onCloseAddModal,
  onCloseEditModal,
  currentUserRole,
  positions,
  onCreateUser,
  onUpdateUser
}) => {
  // Add User Form State
  const [addFormData, setAddFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    position_id: '',
    password: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    position_id: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Filter positions based on user role
  const availablePositions = currentUserRole === 'Administrator'
    ? positions
    : positions.filter(p => p.name !== 'Administrator');

  // Reset add form when modal opens/closes
  useEffect(() => {
    if (showAddModal) {
      setAddFormData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        position_id: '',
        password: ''
      });
      setAddError(null);
    }
  }, [showAddModal]);

  // Populate edit form when user is selected
  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        username: selectedUser.username,
        position_id: selectedUser.position_id.toString()
      });
      setEditError(null);
    }
  }, [selectedUser]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      await onCreateUser({
        ...addFormData,
        position_id: parseInt(addFormData.position_id)
      });
      onCloseAddModal();
    } catch (err: any) {
      setAddError(err.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await onUpdateUser(selectedUser.id, {
        ...editFormData,
        position_id: parseInt(editFormData.position_id)
      });
      onCloseEditModal();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const isAddFormValid = addFormData.first_name.trim() &&
    addFormData.last_name.trim() &&
    addFormData.email.trim() &&
    addFormData.username.trim() &&
    addFormData.position_id &&
    addFormData.password.trim();

  const isEditFormValid = editFormData.first_name.trim() &&
    editFormData.last_name.trim() &&
    editFormData.email.trim() &&
    editFormData.username.trim() &&
    editFormData.position_id;

  return (
    <>
      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={onCloseAddModal} title="Add New User" size="lg">
        <ModalBody>
          <form id="add-user-form" onSubmit={handleAddSubmit} className="space-y-4">
            {addError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{addError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={addFormData.first_name}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                  disabled={addLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={addFormData.last_name}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                  disabled={addLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                disabled={addLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={addFormData.username}
                onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
                disabled={addLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <select
                value={addFormData.position_id}
                onChange={(e) => setAddFormData(prev => ({ ...prev, position_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={addLoading}
              >
                <option value="">Select a position</option>
                {availablePositions.map(position => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                disabled={addLoading}
              />
            </div>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onCloseAddModal} disabled={addLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            disabled={addLoading || !isAddFormValid}
          >
            {addLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Create User
              </div>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={onCloseEditModal}
        title={selectedUser ? `Edit User: ${selectedUser.first_name} ${selectedUser.last_name}` : ""}
        size="lg"
      >
        <ModalBody>
          {selectedUser && (
            <form id="edit-user-form" onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{editError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={editLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  value={editFormData.position_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, position_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editLoading}
                >
                  {availablePositions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onCloseEditModal} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            disabled={editLoading || !isEditFormValid}
          >
            {editLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Update User
              </div>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserModals;
