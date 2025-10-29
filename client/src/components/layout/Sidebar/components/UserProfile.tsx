import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { User } from '@/types';

interface UserProfileProps {
  user: User | null;
  onLogout: () => void;
  isExpanded?: boolean;
}

const UserProfile: FC<UserProfileProps> = ({ user, onLogout, isExpanded = true }) => {
  // Helper function to get user's full name
  const getFullName = (user: User | null | undefined): string => {
    if (!user) return 'Guest User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.name) {
      return user.name;
    }
    if (user.username) {
      return user.username;
    }
    
    return 'Unknown User';
  };

  // Helper function to get user initials
  const getInitials = (user: User | null | undefined): string => {
    if (!user) return 'GU';
    
    const fullName = getFullName(user);
    const names = fullName.split(' ');
    
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    
    return fullName.substring(0, 2).toUpperCase();
  };

  if (!isExpanded) {
    return (
      <div className="p-2 m-2 rounded-lg flex justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="p-2 hover:bg-gray-100"
          style={{ color: '#4C4C4C' }}
          title={`Logout ${getFullName(user)}`}
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
              {getInitials(user)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{ color: '#4C4C4C' }}>
              {getFullName(user)}
            </p>
            <p className="text-xs capitalize" style={{ color: '#4C4C4C' }}>
              {user?.role || 'Staff Member'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="p-2 hover:bg-red-100 hover:cursor-pointer"
          style={{ color: '#4C4C4C' }}
          title={`Logout ${getFullName(user)}`}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;