import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { useProjectsStore } from '@/stores/useProjectsStore'
import { useLocations } from '@/hooks/useProjectDetail'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
}

const FilterPanel = ({ isOpen, onClose }: FilterPanelProps) => {
  const { filters, setFilters, resetFilters } = useProjectsStore()
  const { data: locations } = useLocations()
  
  // Fetch users for Created By filter
  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data
    },
    enabled: isOpen,
  })

  const [localFilters, setLocalFilters] = useState({
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    location: filters.location || '',
    createdBy: filters.createdBy || '',
    hasItems: filters.hasItems,
  })

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        location: filters.location || '',
        createdBy: filters.createdBy || '',
        hasItems: filters.hasItems,
      })
    }
  }, [isOpen, filters])

  const handleApply = () => {
    setFilters({
      dateFrom: localFilters.dateFrom || undefined,
      dateTo: localFilters.dateTo || undefined,
      location: localFilters.location || undefined,
      createdBy: localFilters.createdBy || undefined,
      hasItems: localFilters.hasItems,
      page: 1,
    })
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({
      dateFrom: '',
      dateTo: '',
      location: '',
      createdBy: '',
      hasItems: undefined,
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black opacity-30 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Advanced Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="inline h-4 w-4 mr-1" />
                Created Date Range
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={localFilters.location}
                onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations?.map((location: any) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Created By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By
              </label>
              <select
                value={localFilters.createdBy}
                onChange={(e) => setLocalFilters({ ...localFilters, createdBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Users</option>
                {usersData?.users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Has Items Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Items
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasItems"
                    checked={localFilters.hasItems === undefined}
                    onChange={() => setLocalFilters({ ...localFilters, hasItems: undefined })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All Projects</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasItems"
                    checked={localFilters.hasItems === true}
                    onChange={() => setLocalFilters({ ...localFilters, hasItems: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Has Allocated Items</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasItems"
                    checked={localFilters.hasItems === false}
                    onChange={() => setLocalFilters({ ...localFilters, hasItems: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">No Items Allocated</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FilterPanel
