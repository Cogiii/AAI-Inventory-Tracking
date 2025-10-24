import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavigationItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  isExpanded?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  name, 
  href, 
  icon: Icon, 
  isActive,
  onClick,
  isExpanded = true
}) => {
  const location = useLocation();
  
  const active = isActive ?? (
    location.pathname === href ||
    (href !== '/dashboard' && location.pathname.startsWith(href))
  );

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center ${isExpanded ? 'px-3 justify-start' : 'px-2 justify-center'} py-3 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'text-white rounded-lg'
          : 'hover:rounded-lg'
      }`}
      style={{
        backgroundColor: active ? '#CDDEFF' : 'transparent',
        color: active ? '#101D6B' : '#4C4C4C'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#CDDEFF';
          e.currentTarget.style.color = '#101D6B';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#4C4C4C';
        }
      }}
      title={!isExpanded ? name : undefined}
    >
      <Icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
      {isExpanded && name}
    </Link>
  );
};

export default NavigationItem;