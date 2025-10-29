import { useState } from 'react';
import type { FC } from 'react';
import { Plus, UserCheck, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import UserModals from './components/UserModals';
import UserDetailModal from './components/UserDetailModal';
import ConfirmationModal from './components/ConfirmationModal';

// Mock data based on database schema
const mockUsers = [
  {
    id: 1,
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@aai.com',
    username: 'admin',
    position_id: 1,
    position_name: 'Administrator',
    is_active: true,
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-15T08:30:00Z'
  },
  {
    id: 2,
    first_name: 'Maria',
    last_name: 'Santos',
    email: 'manager@aai.com',
    username: 'msantos',
    position_id: 2,
    position_name: 'Marketing Manager',
    is_active: true,
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T09:15:00Z'
  },
  {
    id: 3,
    first_name: 'John',
    last_name: 'Cruz',
    email: 'user@aai.com',
    username: 'jcruz',
    position_id: 3,
    position_name: 'Staff Member',
    is_active: true,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  },
  {
    id: 4,
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@aai.com',
    username: 'sjohnson',
    position_id: 2,
    position_name: 'Marketing Manager',
    is_active: false,
    created_at: '2024-01-18T11:30:00Z',
    updated_at: '2024-01-20T14:15:00Z'
  },
  {
    id: 5,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@aai.com',
    username: 'mbrown',
    position_id: 3,
    position_name: 'Staff Member',
    is_active: true,
    created_at: '2024-01-19T13:45:00Z',
    updated_at: '2024-01-19T13:45:00Z'
  }
];

const mockPositions = [
  { id: 1, name: 'Administrator' },
  { id: 2, name: 'Marketing Manager' },
  { id: 3, name: 'Staff Member' }
];

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

const UserManagement: FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'deactivate' | 'activate' | 'update';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Role-based user filtering
  const roleFilteredUsers = currentUser?.role === 'Administrator' 
    ? users 
    : users.filter(user => user.position_name !== 'Administrator');

  // Filter users based on search and filters
  const filteredUsers = roleFilteredUsers.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = filterPosition === 'all' || user.position_id.toString() === filterPosition;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setViewingUser(null);
  };

  const handleToggleUserStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmationModal({
      isOpen: true,
      type: user.is_active ? 'deactivate' : 'activate',
      title: `${user.is_active ? 'Deactivate' : 'Activate'} User`,
      message: `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.first_name} ${user.last_name}?`,
      onConfirm: () => {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, is_active: !u.is_active, updated_at: new Date().toISOString() }
            : u
        ));
        setConfirmationModal(null);
        setViewingUser(null);
      }
    });
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
      onConfirm: () => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setConfirmationModal(null);
        setViewingUser(null);
      }
    });
  };

  const userStats = [
    {
      title: 'Total Users',
      value: users.length,
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
      title: 'Administrators',
      value: users.filter(u => u.position_name === 'Administrator').length,
      description: 'Admin accounts',
      icon: UsersIcon
    },
    {
      title: 'Marketing Managers',
      value: users.filter(u => u.position_name === 'Marketing Manager').length,
      description: 'Manager accounts',
      icon: UsersIcon
    }
  ];

  return (
    <div className="space-y-6 p-7">
      {/* Overview */}
      <div className="bg-gray space-y-6 p-7 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-custom">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
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

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPosition={filterPosition}
        onPositionFilterChange={setFilterPosition}
        filterStatus={filterStatus}
        onStatusFilterChange={setFilterStatus}
        positions={mockPositions}
      />

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onViewUser={handleViewUser}
        currentUserRole={currentUser?.role}
      />

      {/* Modals */}
      <UserModals
        showAddModal={showAddModal}
        selectedUser={selectedUser}
        onCloseAddModal={() => setShowAddModal(false)}
        onCloseEditModal={() => setSelectedUser(null)}
        currentUserRole={currentUser?.role}
        positions={mockPositions}
      />

      <UserDetailModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
        currentUserRole={currentUser?.role}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
        onDelete={handleDeleteUser}
      />

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