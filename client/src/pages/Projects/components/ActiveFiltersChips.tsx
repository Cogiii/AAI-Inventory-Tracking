import { X } from 'lucide-react'
import { useProjectsStore } from '@/stores/useProjectsStore'
import { useLocations } from '@/hooks/useProjectDetail'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

const ActiveFiltersChips = () => {
  const { filters, setFilters } = useProjectsStore()
  const { data: locations } = useLocations()
  
  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data
    },
  })

  const getLocationName = (locationId: string) => {
    const location = locations?.find((loc: any) => loc.id === parseInt(locationId))
    return location?.name || locationId
  }

  const getUserName = (userId: string) => {
    const user = usersData?.users?.find((u: any) => u.id === parseInt(userId))
    return user ? `${user.first_name} ${user.last_name}` : userId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const clearFilter = (filterKey: keyof typeof filters) => {
    setFilters({ [filterKey]: undefined, page: 1 })
  }

  const activeFilters: Array<{ key: keyof typeof filters; label: string; value: string }> = []

  if (filters.dateFrom) {
    activeFilters.push({
      key: 'dateFrom',
      label: 'From',
      value: formatDate(filters.dateFrom)
    })
  }

  if (filters.dateTo) {
    activeFilters.push({
      key: 'dateTo',
      label: 'To',
      value: formatDate(filters.dateTo)
    })
  }

  if (filters.location) {
    activeFilters.push({
      key: 'location',
      label: 'Location',
      value: getLocationName(filters.location)
    })
  }

  if (filters.createdBy) {
    activeFilters.push({
      key: 'createdBy',
      label: 'Created By',
      value: getUserName(filters.createdBy)
    })
  }

  if (filters.hasItems !== undefined) {
    activeFilters.push({
      key: 'hasItems',
      label: 'Items',
      value: filters.hasItems ? 'Has Items' : 'No Items'
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
      <span className="text-sm text-gray-600 font-medium self-center">Active Filters:</span>
      {activeFilters.map((filter) => (
        <div
          key={filter.key}
          className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
        >
          <span className="text-blue-900">
            <span className="font-medium">{filter.label}:</span> {filter.value}
          </span>
          <button
            onClick={() => clearFilter(filter.key)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ActiveFiltersChips
