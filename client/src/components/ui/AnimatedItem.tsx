import { type ReactNode } from 'react';
import { useItemAnimation } from '@/hooks/useRealtimeUpdates';

interface AnimatedItemProps {
  /** Entity type (e.g., 'inventory', 'project', 'user') */
  entity: string;
  /** Item ID */
  id: string | number;
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Wrapper component that applies animation classes based on real-time events
 *
 * Animation states:
 * - 'new': slide-in + green highlight glow (3s)
 * - 'updated': yellow pulse highlight (2s)
 * - 'removing': fade-out + shrink (0.3s)
 */
export const AnimatedItem = ({ entity, id, children, className = '' }: AnimatedItemProps) => {
  const { isAnimating, className: animationClass } = useItemAnimation(entity, id);

  return (
    <div
      className={`${className} ${isAnimating ? animationClass : ''} transition-all duration-300`}
    >
      {children}
    </div>
  );
};

export default AnimatedItem;
