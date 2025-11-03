import { useState, useEffect, useCallback } from 'react';
import { usersApi, positionsApi, type User, type Position, type UsersListParams } from '@/services/api/users';
import { useAuth } from './useAuth';

export const useUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchUsers = useCallback(async (params: UsersListParams = {}) => {
    if (!currentUser?.permissions?.canManageUsers) {
      setError('Access denied. You do not have permission to manage users.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await usersApi.getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createUser = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      const response = await usersApi.createUser(userData);
      await fetchUsers(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw new Error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: number, userData: any) => {
    try {
      setLoading(true);
      const response = await usersApi.updateUser(id, userData);
      await fetchUsers(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error updating user:', err);
      throw new Error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const toggleUserStatus = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await usersApi.toggleUserStatus(id);
      await fetchUsers(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      throw new Error(err.response?.data?.error || 'Failed to toggle user status');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await usersApi.deleteUser(id);
      await fetchUsers(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw new Error(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const canManageUser = useCallback((user: User) => {
    if (!currentUser) return false;
    
    // Users can always view/edit their own profile (limited)
    if (user.id === currentUser.id) return true;
    
    // Only users with user management permissions can manage others
    if (!currentUser.permissions?.canManageUsers) return false;
    
    // Non-administrators cannot manage Administrator users
    if (user.position_name === 'Administrator' && currentUser.positionName !== 'Administrator') {
      return false;
    }
    
    return true;
  }, [currentUser]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    canManageUser,
    hasPermission: currentUser?.permissions?.canManageUsers || false
  };
};

export const usePositions = () => {
  const { user: currentUser } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!currentUser?.permissions?.canManageUsers) {
      setError('Access denied. You do not have permission to manage positions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await positionsApi.getPositions();
      setPositions(response.data.positions);
    } catch (err: any) {
      console.error('Error fetching positions:', err);
      setError(err.response?.data?.error || 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createPosition = useCallback(async (positionData: any) => {
    try {
      setLoading(true);
      const response = await positionsApi.createPosition(positionData);
      await fetchPositions(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error creating position:', err);
      throw new Error(err.response?.data?.error || 'Failed to create position');
    } finally {
      setLoading(false);
    }
  }, [fetchPositions]);

  const updatePosition = useCallback(async (id: number, positionData: any) => {
    try {
      setLoading(true);
      const response = await positionsApi.updatePosition(id, positionData);
      await fetchPositions(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error updating position:', err);
      throw new Error(err.response?.data?.error || 'Failed to update position');
    } finally {
      setLoading(false);
    }
  }, [fetchPositions]);

  const deletePosition = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await positionsApi.deletePosition(id);
      await fetchPositions(); // Refresh the list
      return response;
    } catch (err: any) {
      console.error('Error deleting position:', err);
      throw new Error(err.response?.data?.error || 'Failed to delete position');
    } finally {
      setLoading(false);
    }
  }, [fetchPositions]);

  const canEditPosition = useCallback((position: Position) => {
    if (!currentUser?.permissions?.canManageUsers) return false;
    
    // Administrator position cannot be edited
    if (position.name === 'Administrator') return false;
    
    return true;
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.permissions?.canManageUsers) {
      fetchPositions();
    }
  }, [fetchPositions, currentUser]);

  return {
    positions,
    loading,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    canEditPosition,
    hasPermission: currentUser?.permissions?.canManageUsers || false
  };
};