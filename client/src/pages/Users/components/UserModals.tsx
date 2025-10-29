import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';

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
}

const UserModals: React.FC<UserModalsProps> = ({
  showAddModal,
  selectedUser,
  onCloseAddModal,
  onCloseEditModal,
  currentUserRole,
  positions
}) => {
  // Filter positions based on user role
  const availablePositions = currentUserRole === 'Administrator' 
    ? positions 
    : positions.filter(p => p.name !== 'Administrator');
  return (
    <>
      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={onCloseAddModal} title="Add New User" size="lg">
        <ModalBody>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end space-x-3 w-full">
            <Button variant="ghost" onClick={onCloseAddModal}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Create User
            </Button>
          </div>
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
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.first_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.last_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue={selectedUser.username}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select 
                  defaultValue={selectedUser.position_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex justify-end space-x-3 w-full">
            <Button variant="ghost" onClick={onCloseEditModal}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Update User
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserModals;