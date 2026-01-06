import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinProjectRoom,
  leaveProjectRoom,
  type RealtimeEvent,
} from '@/services/socket';

// ============================================
// REALTIME STORE (for pending updates & animations)
// ============================================

interface AnimationState {
  id: string | number;
  type: 'new' | 'updated' | 'removing';
  expiresAt: number;
}

interface RealtimeStore {
  // Pending new items (shown in banner)
  pendingUpdates: Map<string, RealtimeEvent[]>;
  // Items currently animating
  animatingItems: Map<string, AnimationState[]>;
  // Connection status
  isConnected: boolean;

  // Actions
  addPendingUpdate: (entity: string, event: RealtimeEvent) => void;
  clearPendingUpdates: (entity: string) => RealtimeEvent[];
  getPendingCount: (entity: string) => number;

  addAnimatingItem: (entity: string, id: string | number, type: 'new' | 'updated' | 'removing') => void;
  removeAnimatingItem: (entity: string, id: string | number) => void;
  getAnimationState: (entity: string, id: string | number) => AnimationState | undefined;

  setConnected: (connected: boolean) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  pendingUpdates: new Map(),
  animatingItems: new Map(),
  isConnected: false,

  addPendingUpdate: (entity, event) => {
    set((state) => {
      const newMap = new Map(state.pendingUpdates);
      const existing = newMap.get(entity) || [];
      newMap.set(entity, [...existing, event]);
      return { pendingUpdates: newMap };
    });
  },

  clearPendingUpdates: (entity) => {
    const events = get().pendingUpdates.get(entity) || [];
    set((state) => {
      const newMap = new Map(state.pendingUpdates);
      newMap.delete(entity);
      return { pendingUpdates: newMap };
    });
    return events;
  },

  getPendingCount: (entity) => {
    return get().pendingUpdates.get(entity)?.length || 0;
  },

  addAnimatingItem: (entity, id, type) => {
    const duration = type === 'new' ? 3000 : type === 'updated' ? 2000 : 300;
    const expiresAt = Date.now() + duration;

    set((state) => {
      const newMap = new Map(state.animatingItems);
      const existing = newMap.get(entity) || [];
      // Remove any existing animation for this item
      const filtered = existing.filter((item) => item.id !== id);
      newMap.set(entity, [...filtered, { id, type, expiresAt }]);
      return { animatingItems: newMap };
    });

    // Auto-remove animation after duration
    setTimeout(() => {
      get().removeAnimatingItem(entity, id);
    }, duration);
  },

  removeAnimatingItem: (entity, id) => {
    set((state) => {
      const newMap = new Map(state.animatingItems);
      const existing = newMap.get(entity) || [];
      newMap.set(entity, existing.filter((item) => item.id !== id));
      return { animatingItems: newMap };
    });
  },

  getAnimationState: (entity, id) => {
    const items = get().animatingItems.get(entity) || [];
    return items.find((item) => item.id === id);
  },

  setConnected: (connected) => set({ isConnected: connected }),
}));

// ============================================
// QUERY KEY MAPPING
// ============================================

/**
 * Map entity types to React Query keys
 * Note: Using base keys that will match all nested queries with exact: false
 */
const entityToQueryKeys: Record<string, string[][]> = {
  'inventory': [['inventory']],
  'project': [['projects']],
  'project-detail': [['project-detail']],
  'user': [['users']],
  'dashboard': [['dashboard']], // Matches all: dashboard/stats, dashboard/recent-projects, etc.
  'calendar': [['calendar']],
  'location': [['inventory', 'locations'], ['project-detail', 'locations']],
  'brand': [['inventory', 'brands']],
};

// ============================================
// MAIN HOOK
// ============================================

/**
 * Hook to manage real-time updates across the application
 * Uses hybrid approach:
 * - Created items: Add to pending (shown in banner)
 * - Updated items: Auto-merge with animation
 * - Deleted items: Auto-remove with animation
 */
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const { addPendingUpdate, addAnimatingItem, setConnected } = useRealtimeStore();

  // Use ref to store the handler so it doesn't trigger re-registration
  const handlerRef = useRef<(event: RealtimeEvent) => void>();

  // Update the handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = (event: RealtimeEvent) => {
      console.log('[Realtime] Event received:', event.type, event.entity, event.id);

      const queryKeys = entityToQueryKeys[event.entity] || [[event.entity]];
      console.log('[Realtime] Will invalidate query keys:', queryKeys);

      switch (event.type) {
        case 'created':
          // For created items, add to pending (user clicks banner to load)
          // Exception: dashboard and calendar don't have items, just invalidate
          if (event.entity === 'dashboard' || event.entity === 'calendar') {
            queryKeys.forEach((queryKey) => {
              console.log('[Realtime] Invalidating (created):', queryKey);
              queryClient.invalidateQueries({ queryKey, exact: false });
            });
          } else {
            addPendingUpdate(event.entity, event);
          }
          break;

        case 'updated':
          // For updated items, invalidate queries and trigger animation
          queryKeys.forEach((queryKey) => {
            console.log('[Realtime] Invalidating (updated):', queryKey);
            queryClient.invalidateQueries({ queryKey, exact: false });
          });

          // Add animation state for the updated item
          if (event.id) {
            addAnimatingItem(event.entity, event.id, 'updated');
          }
          break;

        case 'deleted':
          // For deleted items, add removing animation then invalidate
          if (event.id) {
            addAnimatingItem(event.entity, event.id, 'removing');

            // Delay invalidation to allow animation to play
            setTimeout(() => {
              queryKeys.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey, exact: false });
              });
            }, 300);
          } else {
            queryKeys.forEach((queryKey) => {
              queryClient.invalidateQueries({ queryKey, exact: false });
            });
          }
          break;
      }
    };
  }, [queryClient, addPendingUpdate, addAnimatingItem]);

  // Socket setup - uses ref for handler to avoid re-registration
  useEffect(() => {
    let socket = getSocket();
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout;

    const setupListeners = () => {
      socket = getSocket();

      if (!socket) {
        // Retry a few times to get socket
        if (retryCount < 5) {
          retryCount++;
          console.log(`[Realtime] Socket not ready, retrying... (${retryCount}/5)`);
          retryTimeout = setTimeout(setupListeners, 500);
        }
        return;
      }

      console.log('[Realtime] Setting up event listeners, socket connected:', socket.connected);
      setConnected(socket.connected);

      // Set up event listeners
      const onConnect = () => {
        console.log('[Realtime] Socket connected');
        setConnected(true);
      };
      const onDisconnect = () => {
        console.log('[Realtime] Socket disconnected');
        setConnected(false);
      };
      // Wrapper function that calls the ref - this stays stable
      const onRealtimeUpdate = (event: RealtimeEvent) => {
        console.log('[Realtime] Received event via listener:', event.type, event.entity);
        handlerRef.current?.(event);
      };

      // Remove any existing listeners first to prevent duplicates
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('realtime:update', onRealtimeUpdate);

      // Add listeners
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('realtime:update', onRealtimeUpdate);

      console.log('[Realtime] Event listeners attached successfully');
    };

    setupListeners();

    return () => {
      console.log('[Realtime] Cleaning up event listeners');
      clearTimeout(retryTimeout);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('realtime:update');
      }
    };
  }, [setConnected]); // Only setConnected - handler is accessed via ref

  return {
    joinProject: joinProjectRoom,
    leaveProject: leaveProjectRoom,
  };
};

/**
 * Hook for project-specific real-time updates
 * Automatically joins/leaves project room
 */
export const useProjectRealtimeUpdates = (joNumber: string | undefined) => {
  const { joinProject, leaveProject } = useRealtimeUpdates();

  useEffect(() => {
    if (joNumber) {
      joinProject(joNumber);
      return () => leaveProject(joNumber);
    }
  }, [joNumber, joinProject, leaveProject]);
};

/**
 * Hook to get pending updates count for an entity
 */
export const usePendingUpdates = (entity: string) => {
  const { pendingUpdates, clearPendingUpdates, addAnimatingItem } = useRealtimeStore();
  const queryClient = useQueryClient();

  const count = pendingUpdates.get(entity)?.length || 0;

  const loadPendingUpdates = useCallback(() => {
    const events = clearPendingUpdates(entity);

    // Add 'new' animation to each item
    events.forEach((event) => {
      if (event.id) {
        addAnimatingItem(entity, event.id, 'new');
      }
    });

    // Invalidate queries to refetch with new items
    const queryKeys = entityToQueryKeys[entity] || [[entity]];
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey, exact: false });
    });
  }, [entity, clearPendingUpdates, addAnimatingItem, queryClient]);

  return {
    count,
    loadPendingUpdates,
    hasPending: count > 0,
  };
};

/**
 * Hook to get animation state for an item
 */
export const useItemAnimation = (entity: string, id: string | number) => {
  const { animatingItems } = useRealtimeStore();
  const items = animatingItems.get(entity) || [];
  const state = items.find((item) => item.id === id);

  return {
    isAnimating: !!state,
    animationType: state?.type,
    className: state
      ? state.type === 'new'
        ? 'animate-highlight-new animate-slide-in'
        : state.type === 'updated'
        ? 'animate-highlight-updated'
        : 'animate-fade-out'
      : '',
  };
};

/**
 * Hook to disconnect socket (call on logout)
 */
export const useDisconnectSocket = () => {
  return useCallback(() => {
    disconnectSocket();
    useRealtimeStore.getState().setConnected(false);
  }, []);
};
