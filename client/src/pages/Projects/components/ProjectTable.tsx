import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Eye, FileText, MapPin, User, Building, Filter, ArrowUpDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Mock data based on database schema
const mockProjectsData = [
  {
    id: 1,
    jo_number: 'JO-2024-001',
    name: 'Metro Manila Infrastructure Development',
    description: 'Major highway and bridge construction project covering multiple districts in Metro Manila',
    status: 'ongoing',
    created_by: 'John Smith',
    created_at: '2024-09-15',
    project_days: [
      { date: '2024-10-01', location: 'EDSA Makati' },
      { date: '2024-10-02', location: 'EDSA Ortigas' }
    ]
  },
  {
    id: 2,
    jo_number: 'JO-2024-002',
    name: 'Cebu Commercial Complex',
    description: 'Shopping mall and office building construction in Cebu Business Park',
    status: 'upcoming',
    created_by: 'Maria Garcia',
    created_at: '2024-10-20',
    project_days: []
  },
  {
    id: 3,
    jo_number: 'JO-2024-003',
    name: 'Davao Residential Village',
    description: 'Residential subdivision development with 150 housing units',
    status: 'ongoing',
    created_by: 'Robert Chen',
    created_at: '2024-08-10',
    project_days: [
      { date: '2024-09-01', location: 'Phase 1 Area A' },
      { date: '2024-09-15', location: 'Phase 1 Area B' }
    ]
  },
  {
    id: 4,
    jo_number: 'JO-2024-004',
    name: 'Baguio Tourism Center',
    description: 'Multi-purpose tourism facility with hotel and convention center',
    status: 'completed',
    created_by: 'Sarah Lim',
    created_at: '2024-06-01',
    project_days: [
      { date: '2024-06-15', location: 'Session Road Area' },
      { date: '2024-07-01', location: 'Main Building Site' }
    ]
  },
  {
    id: 5,
    jo_number: 'JO-2024-005',
    name: 'Iloilo Port Expansion',
    description: 'Port facility expansion including new berths and cargo handling equipment',
    status: 'upcoming',
    created_by: 'Michael Torres',
    created_at: '2024-10-25',
    project_days: []
  },
  {
    id: 6,
    jo_number: 'JO-2024-006',
    name: 'Palawan Resort Development',
    description: 'Eco-friendly resort construction with sustainable building materials',
    status: 'cancelled',
    created_by: 'Lisa Rodriguez',
    created_at: '2024-09-05',
    project_days: []
  }
]

const ProjectTable = () => {
  const navigate = useNavigate()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'created' | 'started' | 'ended'>('created')
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper functions to get project dates
  const getProjectStartDate = (project: any) => {
    if (project.project_days.length === 0) return null
    return project.project_days.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date
  }

  const getProjectEndDate = (project: any) => {
    if (project.project_days.length === 0) return null
    return project.project_days.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
  }

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = mockProjectsData

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Sort projects
    const sorted = [...filtered].sort((a, b) => {
      let dateA: Date | null = null
      let dateB: Date | null = null

      switch (sortBy) {
        case 'created':
          dateA = new Date(a.created_at)
          dateB = new Date(b.created_at)
          break
        case 'started':
          const startA = getProjectStartDate(a)
          const startB = getProjectStartDate(b)
          dateA = startA ? new Date(startA) : new Date(0) // Use epoch for projects without start date
          dateB = startB ? new Date(startB) : new Date(0)
          break
        case 'ended':
          const endA = getProjectEndDate(a)
          const endB = getProjectEndDate(b)
          dateA = endA ? new Date(endA) : new Date(0) // Use epoch for projects without end date
          dateB = endB ? new Date(endB) : new Date(0)
          break
      }

      if (!dateA || !dateB) return 0
      
      const comparison = dateA.getTime() - dateB.getTime()
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [statusFilter, sortOrder, sortBy])

  const handleViewProject = (joNumber: string) => {
    navigate(`/project/${joNumber}`)
  }

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-custom">
              <FileText className="h-5 w-5" />
              All Projects ({filteredAndSortedProjects.length})
            </CardTitle>
            {(statusFilter !== 'all' || sortBy !== 'created' || sortOrder !== 'desc') && (
              <p className="text-xs text-gray-500 mt-1">
                Showing {statusFilter === 'all' ? 'all' : statusFilter} projects, sorted by{' '}
                {sortBy === 'created' ? 'date created' : sortBy === 'started' ? 'date started' : 'date ended'}{' '}
                ({sortOrder === 'asc' ? 'oldest first' : 'newest first'})
              </p>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'started' | 'ended')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="created">Date Created</option>
                <option value="started">Date Started</option>
                <option value="ended">Date Ended</option>
              </select>
            </div>

            {/* Sort Order Filter */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {/* Reset Filters Button */}
            {(statusFilter !== 'all' || sortBy !== 'created' || sortOrder !== 'desc') && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setSortBy('created')
                  setSortOrder('desc')
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredAndSortedProjects.map((project) => (
          <Card key={project.id} className="bg-white hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-medium text-base text-gray-900">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">JO Number:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {project.jo_number}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Created:</span>
                      <span className="text-xs">{formatDate(project.created_at)}</span>
                    </div>
                    
                    {getProjectStartDate(project) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Started:</span>
                        <span className="text-xs">{formatDate(getProjectStartDate(project)!)}</span>
                      </div>
                    )}
                    
                    {getProjectEndDate(project) && project.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Ended:</span>
                        <span className="text-xs">{formatDate(getProjectEndDate(project)!)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Created by:</span>
                      <span className="text-xs">{project.created_by}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">Project Days:</span>
                      <span className="text-xs">{project.project_days.length} scheduled</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">
                    {project.description}
                  </p>
                  
                  {project.project_days.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Recent Locations:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.project_days.slice(0, 2).map((day, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {day.location} ({formatDate(day.date)})
                          </span>
                        ))}
                        {project.project_days.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{project.project_days.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleViewProject(project.jo_number)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 ml-4"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>
              {statusFilter === 'all' 
                ? 'No projects found' 
                : `No ${statusFilter} projects found`
              }
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Show all projects
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectTable