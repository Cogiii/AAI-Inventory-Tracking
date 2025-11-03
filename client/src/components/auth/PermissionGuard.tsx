import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const PermissionGuard: FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
  showAccessDenied = false
}) => {
  const { user } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission
  const hasPermission = user.permissions?.[requiredPermission as keyof typeof user.permissions];

  if (!hasPermission) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p><strong>Required Permission:</strong> {requiredPermission}</p>
                <p><strong>Your Position:</strong> {user.positionName || 'Unknown'}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default PermissionGuard;