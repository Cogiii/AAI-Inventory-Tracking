import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Eye, FileText, MapPin, User, Building, Filter, ArrowUpDown, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { useProjectsStore } from '@/stores/useProjectsStore'
import type { Project } from '@/types'
import FilterPanel from './FilterPanel'
import ActiveFiltersChips from './ActiveFiltersChips'

const ProjectTable = () => {
  const navigate = useNavigate()
  const {
    filters,
    setFilters,
    resetFilters
  } = useProjectsStore()

  const { data: projectsData, isLoading, error, isFetching } = useProjects(filters)

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [statusFilter, setStatusFilter] = useState(filters.status || 'upcoming')
  const [isSearching, setIsSearching] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    setIsSearching(true)

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      setFilters({ search: value, page: 1 })
      setIsSearching(false)
    }, 500)

    setDebounceTimeout(newTimeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [debounceTimeout])

  // Reset searching state when fetching completes
  useEffect(() => {
    if (!isFetching) {
      setIsSearching(false)
    }
  }, [isFetching])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setStatusFilter(value)
    setFilters({ status: value, page: 1 })
  }

  const handleSortChange = (sortBy: string) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'DESC' ? 'ASC' : 'DESC'
    setFilters({ sortBy, sortOrder: newOrder })
  }

  const handleViewProject = (project: Project) => {
    navigate(`/project/${project.jo_number}`)
  }



  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      upcoming: 'bg-blue-100 text-blue-800 border border-blue-200',
      ongoing: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-gray-100 text-gray-800 border border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    }

    const statusLabels = {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.upcoming}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (error) {
    return (
      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading projects. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Projects Management
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(isSearching || isFetching) && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button 
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 relative"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.dateFrom || filters.dateTo || filters.location || filters.createdBy || filters.hasItems !== undefined) && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {[
                    filters.dateFrom,
                    filters.dateTo,
                    filters.location,
                    filters.createdBy,
                    filters.hasItems !== undefined
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {(filters.dateFrom || filters.dateTo || filters.location || filters.createdBy || filters.hasItems !== undefined || filters.search || filters.status !== 'upcoming') && (
              <button
                onClick={() => {
                  resetFilters()
                  setSearchInput('')
                  setStatusFilter('upcoming')
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Chips */}
        <ActiveFiltersChips />
      </CardHeader>

      <CardContent className="relative">
        <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div
              className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-gray-900"
              onClick={() => handleSortChange('jo_number')}
            >
              JO Number
              <ArrowUpDown className="h-3 w-3" />
            </div>
            <div
              className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-gray-900"
              onClick={() => handleSortChange('project_name')}
            >
              Project Name
              <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created By</div>
            <div
              className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-gray-900"
              onClick={() => handleSortChange('created_at')}
            >
              Created Date
              <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Loading Indicator */}
          {isFetching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-gray-600">
                  {isLoading ? 'Loading projects...' : 'Updating results...'}
                </span>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="space-y-4 mt-4">
            {projectsData?.projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No projects found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              projectsData?.projects.map((project) => (
                <div key={project.project_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{project.project_name}</h3>
                        <p className="text-sm text-blue-600">{project.jo_number}</p>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.created_by_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.created_at)}
                      </div>
                    </div>

                    {project.project_locations && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {project.project_locations}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Project
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="font-mono text-sm text-blue-600">{project.jo_number}</span>
                    </div>

                    <div className="col-span-3">
                      <h3 className="font-medium text-gray-900 truncate">{project.project_name}</h3>
                      <p className="text-sm text-gray-600 truncate">{project.description}</p>
                    </div>

                    <div className="col-span-2">
                      {getStatusBadge(project.status)}
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        {project.created_by_name}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.created_at)}
                      </div>
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="View Project"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {projectsData && projectsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((projectsData.pagination.currentPage - 1) * projectsData.pagination.limit) + 1} to{' '}
                {Math.min(projectsData.pagination.currentPage * projectsData.pagination.limit, projectsData.pagination.totalProjects)} of{' '}
                {projectsData.pagination.totalProjects} projects
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(projectsData.pagination.currentPage - 1)}
                  disabled={projectsData.pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, projectsData.pagination.totalPages) }, (_, i) => {
                  const page = i + Math.max(1, projectsData.pagination.currentPage - 2)
                  if (page <= projectsData.pagination.totalPages) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded ${page === projectsData.pagination.currentPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(projectsData.pagination.currentPage + 1)}
                  disabled={projectsData.pagination.currentPage === projectsData.pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </div>
      </CardContent>

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)} 
      />
    </Card>
  )
}

export default ProjectTable