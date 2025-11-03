import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';
import NavigationItem from './NavigationItem';

export interface NavigationItemConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[]; // Keep for backward compatibility
  requiredPermission?: string; // New permission-based access
}

interface NavigationSectionProps {
  title: string;
  items: NavigationItemConfig[];
  userRole?: string; // Keep for backward compatibility
  userPermissions?: Record<string, boolean>; // New permission-based access
  onItemClick?: () => void;
  isExpanded?: boolean;
}

const NavigationSection: FC<NavigationSectionProps> = ({ 
  title, 
  items, 
  userRole,
  userPermissions,
  onItemClick,
  isExpanded = true
}) => {
  const filteredItems = items.filter((item: NavigationItemConfig) => {
    // If item has a required permission, check that permission
    if (item.requiredPermission) {
      const hasPermission = userPermissions?.[item.requiredPermission] || false;
      return hasPermission;
    }
    
    // Fall back to role-based checking for backward compatibility
    return !item.roles || item.roles.includes(userRole || '');
  });

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div>
      {isExpanded && (
        <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#4C4C4C' }}>
          {title}
        </p>
      )}
      <div className="space-y-1">
        {filteredItems.map((item) => (
          <NavigationItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.icon}
            onClick={onItemClick}
            isExpanded={isExpanded}
          />
        ))}
      </div>
    </div>
  );
};

export default NavigationSection;