import type { FC } from 'react';
import { 
  Modal, 
  ModalBody, 
  ModalFooter 
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';

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

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentUserRole?: string;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: number) => void;
  onDelete: (userId: number) => void;
}

const UserDetailModal: FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserRole,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Active
        </>
      ) : (
        <>
          <UserX className="w-4 h-4 mr-2" />
          Inactive
        </>
      )}
    </span>
  );

  const getPositionBadge = (positionName: string) => {
    const colorMap: { [key: string]: string } = {
      'Administrator': 'bg-purple-100 text-purple-800',
      'Marketing Manager': 'bg-blue-100 text-blue-800',
      'Staff Member': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        colorMap[positionName] || 'bg-gray-100 text-gray-800'
      }`}>
        <Shield className="w-4 h-4 mr-2" />
        {positionName}
      </span>
    );
  };

  // Role-based action permissions
  const canEdit = currentUserRole === 'Administrator' || 
    (currentUserRole === 'Marketing Manager' && user.position_name !== 'Administrator');
  
  const canToggleStatus = canEdit;
  const canDelete = canEdit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <ModalBody>
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-xl">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                {getStatusBadge(user.is_active)}
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-gray-600">@{user.username}</p>
                {getPositionBadge(user.position_name)}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Username</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Account Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Position</p>
                    <p className="text-sm text-gray-600">{user.position_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-2">
            {canEdit && (
              <Button
                onClick={() => onEdit(user)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
            {canToggleStatus && (
              <Button
                onClick={() => onToggleStatus(user.id)}
                variant="outline"
                className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
              >
                {user.is_active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={() => onDelete(user.id)}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default UserDetailModal;