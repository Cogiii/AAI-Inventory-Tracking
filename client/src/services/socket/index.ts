import { io, Socket } from 'socket.io-client';
import { getSecureToken } from '@/utils/tokenSecurity';

// Get socket URL from environment, removing /api path if present
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket: Socket | null = null;

/**
 * Real-time event payload structure
 */
export interface RealtimeEvent {
  type: 'created' | 'updated' | 'deleted';
  entity: 'inventory' | 'project' | 'project-detail' | 'user' | 'dashboard' | 'calendar' | 'location' | 'brand';
  id?: string | number;
  data?: any;
  metadata?: {
    triggeredBy: number;
    triggeredByName: string;
    timestamp: string;
    joNumber?: string;
  };
}

/**
 * Connect to Socket.io server with JWT authentication
 * @returns Socket instance or null if no token
 */
export const connectSocket = (): Socket | null => {
  const token = getSecureToken();

  if (!token) {
    console.warn('[Socket.io] No auth token available for connection');
    return null;
  }

  // Return existing socket if already connected
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket before creating new one
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to server');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.io] Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket.io] Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('[Socket.io] Reconnection attempt', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    console.error('[Socket.io] Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket.io] Reconnection failed');
  });

  return socket;
};

/**
 * Disconnect from Socket.io server
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.io] Manually disconnected');
  }
};

/**
 * Get current socket instance
 * @returns Socket instance or null
 */
export const getSocket = (): Socket | null => socket;

/**
 * Check if socket is connected
 * @returns boolean
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

/**
 * Join a project room for project-specific updates
 * @param joNumber - Project JO number
 */
export const joinProjectRoom = (joNumber: string): void => {
  if (socket?.connected && joNumber) {
    socket.emit('join:project', joNumber);
    console.log('[Socket.io] Joined project room:', joNumber);
  }
};

/**
 * Leave a project room
 * @param joNumber - Project JO number
 */
export const leaveProjectRoom = (joNumber: string): void => {
  if (socket?.connected && joNumber) {
    socket.emit('leave:project', joNumber);
    console.log('[Socket.io] Left project room:', joNumber);
  }
};

/**
 * Subscribe to real-time updates
 * @param callback - Function to call when update is received
 * @returns Cleanup function
 */
export const subscribeToUpdates = (callback: (event: RealtimeEvent) => void): (() => void) => {
  if (!socket) {
    console.warn('[Socket.io] Cannot subscribe: socket not connected');
    return () => {};
  }

  socket.on('realtime:update', callback);

  return () => {
    socket?.off('realtime:update', callback);
  };
};
