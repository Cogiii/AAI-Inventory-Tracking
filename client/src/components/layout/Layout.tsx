import { useState } from 'react';
import type { ReactNode, FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: ReactNode;
  showSidebar?: boolean;
}

const Layout: FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 sm:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isExpanded={sidebarExpanded}
        onClose={() => setSidebarExpanded(false)}
        onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto sm:ml-0">
        {!sidebarExpanded && (
          <div className="sm:hidden p-4 bg-white border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;