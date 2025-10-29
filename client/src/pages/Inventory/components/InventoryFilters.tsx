import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, Search, Download, Plus } from 'lucide-react'

interface InventoryFiltersProps {
  onTypeFilter?: (type: string) => void
  onStatusFilter?: (status: string) => void
  onBrandFilter?: (brand: string) => void
  onSearchChange?: (search: string) => void
}

const InventoryFilters: FC<InventoryFiltersProps> = ({
  onTypeFilter,
  onStatusFilter,
  onBrandFilter,
  onSearchChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    onTypeFilter?.(value)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    onStatusFilter?.(value)
  }

  const handleBrandChange = (value: string) => {
    setBrandFilter(value)
    onBrandFilter?.(value)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setStatusFilter('all')
    setBrandFilter('all')
    onSearchChange?.('')
    onTypeFilter?.('all')
    onStatusFilter?.('all')
    onBrandFilter?.('all')
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name, description, or location..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
              >
                <option value="all">All Types</option>
                <option value="product">Products</option>
                <option value="material">Materials</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
            >
              <option value="all">All Brands</option>
              <option value="INGCO">INGCO</option>
              <option value="Makita">Makita</option>
              <option value="Stanley">Stanley</option>
              <option value="Black+Decker">Black+Decker</option>
              <option value="Bosch">Bosch</option>
              <option value="DeWalt">DeWalt</option>
              <option value="Milwaukee">Milwaukee</option>
              <option value="Ryobi">Ryobi</option>
              <option value="Craftsman">Craftsman</option>
              <option value="Hilti">Hilti</option>
              <option value="no_brand">No Brand</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || brandFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InventoryFilters