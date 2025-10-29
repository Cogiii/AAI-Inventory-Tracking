import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, Search, Download } from 'lucide-react'
import { useBrands, useLocations, useExportInventory } from '@/hooks/useInventory'
import type { FilterState } from '@/types'

interface InventoryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const InventoryFilters: FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  // Fetch dynamic data for dropdowns
  const { data: brandsResponse, error: brandsError, isLoading: brandsLoading, isError: brandsIsError } = useBrands()
  const { data: locationsResponse, error: locationsError, isLoading: locationsLoading, isError: locationsIsError } = useLocations()
  const exportMutation = useExportInventory()

  // Ensure we always have arrays to map over
  // API returns { success: true, data: { brands: [...] } }
  const brands = Array.isArray(brandsResponse?.data?.brands) ? brandsResponse.data.brands : []
  const locations = Array.isArray(locationsResponse?.data?.locations) ? locationsResponse.data.locations : []

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== INVENTORY FILTERS DEBUG ===')
    console.log('Brands Loading:', brandsLoading)
    console.log('Brands Response:', brandsResponse)
    console.log('Brands Array Length:', brands.length)
    console.log('Brands Array:', brands)
    console.log('Locations Loading:', locationsLoading)
    console.log('Locations Response:', locationsResponse)
    console.log('Locations Array Length:', locations.length)
    console.log('Locations Array:', locations)
    if (brandsError) console.error('Brands Error:', brandsError)
    if (locationsError) console.error('Locations Error:', locationsError)
    console.log('===============================')
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value as FilterState['type'] })
  }

  // Check if there are active filters
  const hasActiveFilters = filters.search || 
    filters.type !== 'all' || 
    filters.status !== 'all' || 
    filters.brand !== 'all' || 
    filters.location !== 'all';

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as FilterState['status'] })
  }

  const handleBrandChange = (value: string) => {
    onFiltersChange({ ...filters, brand: value })
  }

  const handleLocationChange = (value: string) => {
    onFiltersChange({ ...filters, location: value })
  }

  const handleExport = () => {
    const exportParams = {
      ...(filters.search && { search: filters.search }),
      ...(filters.type !== 'all' && { type: filters.type }),
      ...(filters.brand !== 'all' && { brand: filters.brand }),
      ...(filters.location !== 'all' && { location: filters.location }),
      ...(filters.status !== 'all' && { status: filters.status })
    }
    exportMutation.mutate(exportParams)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      brand: 'all',
      location: 'all',
      status: 'all'
    })
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
                value={filters.search}
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
                value={filters.type}
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
              value={filters.status}
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
              value={filters.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              disabled={brandsLoading}
              className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 bg-white min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed ${
                brandsIsError 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="all">
                {brandsLoading 
                  ? 'Loading brands...' 
                  : brandsIsError 
                  ? 'Error loading brands' 
                  : `All Brands (${brands.length})`
                }
              </option>
              {brands.map((brand: any) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
              {!brandsLoading && brands.length > 0 && <option value="no_brand">No Brand</option>}
              {!brandsLoading && brands.length === 0 && !brandsIsError && (
                <option disabled>No brands available</option>
              )}
            </select>

            {/* Location Filter */}
            <select
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              disabled={locationsLoading}
              className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 bg-white min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed ${
                locationsIsError 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="all">
                {locationsLoading 
                  ? 'Loading locations...' 
                  : locationsIsError 
                  ? 'Error loading locations' 
                  : `All Locations (${locations.length})`
                }
              </option>
              {locations.map((location: any) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                  {location.type && ` (${location.type})`}
                  {location.city && ` - ${location.city}`}
                </option>
              ))}
              {!locationsLoading && locations.length === 0 && !locationsIsError && (
                <option disabled>No locations available</option>
              )}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
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
            <button 
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {exportMutation.isPending ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InventoryFilters