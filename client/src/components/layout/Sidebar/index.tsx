import type { FC } from 'react';
import {
  Users,
  Home,
  Calendar,
  Package,
  FolderOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo, NavigationSection, UserProfile } from './components';
import type { NavigationItemConfig } from './components';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isExpanded?: boolean;
  onClose: () => void;
  onToggleExpand?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isExpanded = true, onClose, onToggleExpand }) => {
  const { logout, user } = useAuth();

  const generalNavigation: NavigationItemConfig[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
  ];

  const recordsNavigation: NavigationItemConfig[] = [
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Inventory', href: '/inventory', icon: Package },
  ];

  const administrationNavigation: NavigationItemConfig[] = [
    { name: 'User Management', href: '/users', icon: Users, roles: ['Administrator', 'Marketing Manager'] },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out sm:static sm:inset-0 bg-gray ${isExpanded ? 'translate-x-0 w-55' : '-translate-x-full sm:translate-x-0 sm:w-16'}`}
    >
      <div className="flex flex-col h-full">
        <Logo
          isExpanded={isExpanded}
        />

        <nav className={`flex-1 space-y-4 ${isExpanded ? 'px-4' : 'px-2'}`}>
          <NavigationSection
            title="General"
            items={generalNavigation}
            userRole={user?.role}
            onItemClick={() => {
              // Only close sidebar on mobile screens
              if (window.innerWidth < 640) {
                onClose();
              }
            }}
            isExpanded={isExpanded}
          />

          <NavigationSection
            title="Records"
            items={recordsNavigation}
            userRole={user?.role}
            onItemClick={() => {
              // Only close sidebar on mobile screens
              if (window.innerWidth < 640) {
                onClose();
              }
            }}
            isExpanded={isExpanded}
          />

          <NavigationSection
            title="Administration"
            items={administrationNavigation}
            userRole={user?.role}
            onItemClick={() => {
              // Only close sidebar on mobile screens
              if (window.innerWidth < 640) {
                onClose();
              }
            }}
            isExpanded={isExpanded}
          />
        </nav>

        <UserProfile
          user={user}
          onLogout={handleLogout}
          isExpanded={isExpanded}
        />

        {onToggleExpand && (
          <div className={`p-2 ${isExpanded ? 'px-4' : 'px-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className={`w-full hover:bg-gray-200 hover:cursor-pointer transition-colors text-gray-custom ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
              {isExpanded ? (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Collapse
                </>
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;