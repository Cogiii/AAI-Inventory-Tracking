import type { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface SuperAdminRouteProps {
  children: ReactNode;
}

/**
 * Super Admin Route Component
 * Restricts access to super administrators only
 */
const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  return (
    <ProtectedRoute requiredRoles={['Administrator']}>
      {children}
    </ProtectedRoute>
  );
};

export default SuperAdminRoute;