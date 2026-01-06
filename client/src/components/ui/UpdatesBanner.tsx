import { RefreshCw, X } from 'lucide-react';
import { usePendingUpdates } from '@/hooks/useRealtimeUpdates';

interface UpdatesBannerProps {
  /** Entity type to show updates for (e.g., 'inventory', 'project', 'user') */
  entity: string;
  /** Optional custom message */
  message?: string;
}

/**
 * Floating banner that shows when new items are available
 * User clicks to load new items with animation
 */
export const UpdatesBanner = ({ entity, message }: UpdatesBannerProps) => {
  const { count, loadPendingUpdates, hasPending } = usePendingUpdates(entity);

  if (!hasPending) return null;

  const defaultMessage = count === 1 ? '1 new update available' : `${count} new updates available`;

  return (
    <div className="sticky top-0 z-10 mb-4 animate-slide-in">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <span className="text-xs font-semibold text-blue-700">{count}</span>
          </div>
          <span className="text-sm font-medium text-blue-800">{message || defaultMessage}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPendingUpdates}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Updates
          </button>
          <button
            onClick={() => {
              // Clear without loading - just dismiss the banner
              // We need to call loadPendingUpdates but not trigger the refetch
              // For now, just load them
              loadPendingUpdates();
            }}
            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatesBanner;
