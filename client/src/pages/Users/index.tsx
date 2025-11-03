import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Plus, UserCheck, Users as UsersIcon, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, usePositions } from '@/hooks/useUsers';
import type { User as ApiUser } from '@/services/api/users';

import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import UserModals from './components/UserModals';
import UserDetailModal from './components/UserDetailModal';
import ConfirmationModal from './components/ConfirmationModal';
import PositionModal from './components/PositionModal';

const UserManagement: FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    pagination,
    fetchUsers,
    toggleUserStatus,
    deleteUser,
    hasPermission
  } = useUsers();
  
  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
    createPosition,
    updatePosition,
    deletePosition,
    canEditPosition
  } = usePositions();

  // Local state for UI control
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ApiUser | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'positions'>('users');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'deactivate' | 'activate' | 'update';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Check if user has permission to access this page
  useEffect(() => {
    if (!hasPermission) {
      // Redirect or show access denied
      return;
    }
  }, [hasPermission]);

  // Fetch users when filters change
  useEffect(() => {
    if (hasPermission) {
      fetchUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        position_id: filterPosition
      });
    }
  }, [currentPage, searchTerm, filterPosition, fetchUsers, hasPermission]);

  // Filter users by status (client-side filter since it's not in API yet)
  const filteredUsers = users.filter(user => {
    if (filterStatus === 'all') return true;
    return filterStatus === 'active' ? user.is_active : !user.is_active;
  });

  const handleViewUser = (user: ApiUser) => {
    setViewingUser(user);
  };

  const handleEditUser = (user: ApiUser) => {
    setSelectedUser(user);
    setViewingUser(null);
  };

  const handleToggleUserStatus = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmationModal({
      isOpen: true,
      type: user.is_active ? 'deactivate' : 'activate',
      title: `${user.is_active ? 'Deactivate' : 'Activate'} User`,
      message: `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.first_name} ${user.last_name}?`,
      onConfirm: async () => {
        try {
          await toggleUserStatus(userId);
          setConfirmationModal(null);
          setViewingUser(null);
        } catch (error) {
          console.error('Error toggling user status:', error);
        }
      }
    });
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          setConfirmationModal(null);
          setViewingUser(null);
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      }
    });
  };

  const handleDeletePosition = async (positionId: number) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Position',
      message: `Are you sure you want to delete the position "${position.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deletePosition(positionId);
          setConfirmationModal(null);
          setSelectedPosition(null);
        } catch (error) {
          console.error('Error deleting position:', error);
        }
      }
    });
  };

  const userStats = [
    {
      title: 'Total Users',
      value: pagination.totalItems,
      description: 'Registered users',
      icon: UsersIcon
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.is_active).length,
      description: 'Currently active',
      icon: UserCheck
    },
    {
      title: 'Positions',
      value: positions.length,
      description: 'Available roles',
      icon: Shield
    },
    {
      title: 'Administrators',
      value: users.filter(u => u.position_name === 'Administrator').length,
      description: 'Admin accounts',
      icon: Settings
    }
  ];

  // Show access denied if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="space-y-6 p-7">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">You do not have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-7">
      {/* Overview */}
      <div className="bg-gray space-y-6 p-7 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-custom">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'users' ? (
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            ) : (
              <Button 
                onClick={() => setShowPositionModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Position
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UsersIcon className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'positions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Positions & Permissions
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'users' ? (
        <>
          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterPosition={filterPosition}
            onPositionFilterChange={setFilterPosition}
            filterStatus={filterStatus}
            onStatusFilterChange={setFilterStatus}
            positions={positions.map(p => ({ id: p.id, name: p.name }))}
          />

          {/* Users Table */}
          {usersLoading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : usersError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{usersError}</p>
            </div>
          ) : (
            <UserTable
              users={filteredUsers as any[]}
              onViewUser={handleViewUser as any}
              pagination={pagination}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        /* Position Management */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Position Management</h3>
            <p className="text-gray-600 mt-1">Manage system positions and their permissions</p>
          </div>
          
          <div className="p-6">
            {positionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading positions...</p>
              </div>
            ) : positionsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{positionsError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{position.name}</h4>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {Object.entries(position.permissions)
                            .filter(([, value]) => Boolean(value))
                            .map(([key]) => (
                              <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {key
                                  .replace(/can/i, '')
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()
                                  .replace(/^./, str => str.toUpperCase())
                                }
                              </span>
                            ))
                          }
                          {Object.values(position.permissions).every(value => !Boolean(value)) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              No permissions assigned
                            </span>
                          )}
                        </div>
                      </div>
                      {canEditPosition(position) && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedPosition(position);
                              setShowPositionModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeletePosition(position.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <UserModals
        showAddModal={showAddModal}
        selectedUser={selectedUser}
        onCloseAddModal={() => setShowAddModal(false)}
        onCloseEditModal={() => setSelectedUser(null)}
        currentUserRole={currentUser?.positionName}
        positions={positions.map(p => ({ id: p.id, name: p.name }))}
      />

      <UserDetailModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
        currentUserRole={currentUser?.positionName}
        onEdit={handleEditUser as any}
        onToggleStatus={handleToggleUserStatus}
        onDelete={handleDeleteUser}
      />

      {/* Position Modal */}
      {(showPositionModal || selectedPosition) && (
        <PositionModal
          isOpen={showPositionModal || !!selectedPosition}
          onClose={() => {
            setShowPositionModal(false);
            setSelectedPosition(null);
          }}
          position={selectedPosition}
          onCreatePosition={createPosition}
          onUpdatePosition={updatePosition}
        />
      )}

      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(null)}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
        />
      )}
    </div>
  );
};

export default UserManagement;