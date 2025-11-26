import { useState, type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Activity, AlertCircle, CheckCircle, Info, Clock, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useProjectDetail } from '@/hooks/useProjectDetail'

// Configurable limit - can be easily changed
const LOGS_PER_PAGE = 10

interface ProjectLogsProps {
  joNumber?: string
}

const ProjectLogs: FC<ProjectLogsProps> = ({ joNumber }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber, currentPage, LOGS_PER_PAGE)
  
  if (!joNumber) return null

  if (isLoading) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading project logs...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !projectData) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Error loading project logs</p>
        </CardContent>
      </Card>
    )
  }

  const projectLogs = projectData.logs || []
  const logsPagination = projectData.logsPagination || { currentPage: 1, totalPages: 1, totalLogs: 0, limit: LOGS_PER_PAGE }
  const logsCounts = projectData.logsCounts || { statusChanges: 0, activities: 0, incidents: 0 }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setPageInput('')
    // Scroll to top of logs section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty string or only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value)
      
      // Only navigate if it's a valid page number
      if (value !== '') {
        const page = parseInt(value)
        if (page >= 1 && page <= logsPagination.totalPages) {
          handlePageChange(page)
        }
      }
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput)
      if (page >= 1 && page <= logsPagination.totalPages) {
        handlePageChange(page)
      }
    }
  }

  const getLogIcon = (logType: string) => {
    switch (logType) {
      case 'status_change':
        return CheckCircle
      case 'activity':
        return Activity
      case 'incident':
        return AlertCircle
      default:
        return Info
    }
  }

  const getLogColor = (logType: string) => {
    switch (logType) {
      case 'status_change':
        return 'text-green-600'
      case 'activity':
        return 'text-blue-600'
      case 'incident':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getLogBg = (logType: string) => {
    switch (logType) {
      case 'status_change':
        return 'bg-green-50'
      case 'activity':
        return 'bg-blue-50'
      case 'incident':
        return 'bg-orange-50'
      default:
        return 'bg-gray-50'
    }
  }

  const getBorderColor = (logType: string) => {
    switch (logType) {
      case 'status_change':
        return 'border-l-green-500'
      case 'activity':
        return 'border-l-blue-500'
      case 'incident':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const formatLogType = (logType: string) => {
    return logType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-custom">
          <FileText className="h-5 w-5" />
          Project Activity Logs ({logsPagination.totalLogs})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projectLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activity logs found for this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectLogs.map((log) => {
              const Icon = getLogIcon(log.log_type)
              const datetime = formatDateTime(log.created_at)
              
              return (
                <Card key={log.id} className={`bg-white border-l-4 hover:shadow-sm transition-shadow ${getBorderColor(log.log_type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getLogBg(log.log_type)}`}>
                        <Icon className={`h-4 w-4 ${getLogColor(log.log_type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            log.log_type === 'status_change' ? 'bg-green-100 text-green-800' :
                            log.log_type === 'activity' ? 'bg-blue-100 text-blue-800' :
                            log.log_type === 'incident' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatLogType(log.log_type)}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{datetime.date} at {datetime.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {log.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">
                              <span className="font-medium">Recorded by:</span> {log.recorded_by_name || 'Unknown'}
                            </span>
                            {log.project_day_id && (
                              <span className="text-gray-500">
                                <span className="font-medium">Project Day:</span> #{log.project_day_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Summary */}
        {projectLogs.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg text-center">
                <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="font-medium text-gray-700">Status Changes</p>
                <p className="text-lg font-bold text-green-600">
                  {logsCounts.statusChanges}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="font-medium text-gray-700">Activities</p>
                <p className="text-lg font-bold text-blue-600">
                  {logsCounts.activities}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <AlertCircle className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                <p className="font-medium text-gray-700">Incidents</p>
                <p className="text-lg font-bold text-orange-600">
                  {logsCounts.incidents}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {logsPagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {((logsPagination.currentPage - 1) * logsPagination.limit) + 1} to{' '}
              {Math.min(logsPagination.currentPage * logsPagination.limit, logsPagination.totalLogs)} of{' '}
              {logsPagination.totalLogs} logs
            </div>

            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={logsPagination.currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(logsPagination.currentPage - 1)}
                disabled={logsPagination.currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page</span>
                <input
                  type="text"
                  value={pageInput || logsPagination.currentPage}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={() => setPageInput('')}
                  onFocus={(e) => {
                    setPageInput(logsPagination.currentPage.toString())
                    e.target.select()
                  }}
                  placeholder={logsPagination.currentPage.toString()}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">of {logsPagination.totalPages}</span>
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(logsPagination.currentPage + 1)}
                disabled={logsPagination.currentPage === logsPagination.totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(logsPagination.totalPages)}
                disabled={logsPagination.currentPage === logsPagination.totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectLogs