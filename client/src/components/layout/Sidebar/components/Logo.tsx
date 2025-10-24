import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface LogoProps {
  isExpanded?: boolean;
}

const Logo: FC<LogoProps> = ({ isExpanded = true }) => {
  return (
    <div className="flex items-center justify-between m-auto p-4">
      <img
        src="/AAI_logo_circle.png"
        alt="AAI LOGO"
        className={`object-contain ${isExpanded ? 'w-30' : 'w-8 h-8'} transition-all duration-300 ease-in-out`}
      />
    </div>
  );
};

export default Logo;