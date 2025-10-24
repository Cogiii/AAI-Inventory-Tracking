import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface User {
  name?: string;
  role?: string;
}

interface UserProfileProps {
  user?: User | null;
  onLogout: () => void;
  isExpanded?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, isExpanded = true }) => {
  if (!isExpanded) {
    return (
      <div className="p-2 m-2 rounded-lg flex justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="p-2 hover:bg-gray-100"
          style={{ color: '#4C4C4C' }}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 m-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium" style={{ color: '#4C4C4C' }}>
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{ color: '#4C4C4C' }}>{user?.name || 'Angelo R.'}</p>
            <p className="text-xs capitalize" style={{ color: '#4C4C4C' }}>{user?.role || 'Admin'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="p-2 hover:bg-red-100 hover:cursor-pointer"
          style={{ color: '#4C4C4C' }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;