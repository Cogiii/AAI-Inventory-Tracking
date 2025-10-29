import type { FC } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Position {
  id: number;
  name: string;
}

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterPosition: string;
  onPositionFilterChange: (value: string) => void;
  filterStatus: string;
  onStatusFilterChange: (value: string) => void;
  positions: Position[];
}

const UserFilters: FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterPosition,
  onPositionFilterChange,
  filterStatus,
  onStatusFilterChange,
  positions
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Position Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterPosition}
              onChange={(e) => onPositionFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Positions</option>
              {positions.map(position => (
                <option key={position.id} value={position.id.toString()}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default UserFilters;