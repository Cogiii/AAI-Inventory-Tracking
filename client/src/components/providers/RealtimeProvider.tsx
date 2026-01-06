import { useEffect, useState, type ReactNode } from 'react';
import { hasValidToken } from '@/utils/tokenSecurity';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { useRealtimeUpdates, useRealtimeStore } from '@/hooks/useRealtimeUpdates';

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages Socket.io connection lifecycle
 * - Connects when user is authenticated
 * - Disconnects on logout or token expiry
 * - Initializes real-time update listeners
 */
export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const [socketReady, setSocketReady] = useState(false);
  const { setConnected } = useRealtimeStore();

  // First, establish the socket connection
  useEffect(() => {
    if (hasValidToken()) {
      console.log('[RealtimeProvider] Token valid, connecting socket...');
      const socket = connectSocket();

      if (socket) {
        // Wait for connection to be established
        if (socket.connected) {
          console.log('[RealtimeProvider] Socket already connected');
          setConnected(true);
          setSocketReady(true);
        } else {
          const onConnect = () => {
            console.log('[RealtimeProvider] Socket connected');
            setConnected(true);
            setSocketReady(true);
          };
          socket.once('connect', onConnect);

          // Also set ready after a short delay in case already connecting
          setTimeout(() => {
            if (getSocket()?.connected) {
              setConnected(true);
              setSocketReady(true);
            } else {
              // Set ready anyway so hook can attempt to set up listeners
              setSocketReady(true);
            }
          }, 500);
        }
      }
    }

    return () => {
      console.log('[RealtimeProvider] Cleaning up socket connection');
      disconnectSocket();
      setConnected(false);
      setSocketReady(false);
    };
  }, [setConnected]);

  // Initialize real-time updates hook (sets up event listeners) - only after socket is ready
  useRealtimeUpdates();

  // Re-connect when token changes (e.g., after login from another tab)
  useEffect(() => {
    const checkAndConnect = () => {
      if (hasValidToken()) {
        const socket = connectSocket();
        if (socket?.connected) {
          setConnected(true);
        }
      } else {
        disconnectSocket();
        setConnected(false);
      }
    };

    window.addEventListener('storage', checkAndConnect);
    return () => window.removeEventListener('storage', checkAndConnect);
  }, [setConnected]);

  return <>{children}</>;
};

export default RealtimeProvider;
