import { useState, type FC } from 'react'
import { FileText, Activity, AlertCircle, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProjectDetail } from '@/hooks/useProjectDetail'

const LOGS_PER_PAGE = 10

interface ProjectLogsProps {
  joNumber?: string
}

const ProjectLogs: FC<ProjectLogsProps> = ({ joNumber }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber, currentPage, LOGS_PER_PAGE)

  if (!joNumber) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading logs...</p>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">Error loading logs</p>
      </div>
    )
  }

  const projectLogs = projectData.logs || []
  const logsPagination = projectData.logsPagination || { currentPage: 1, totalPages: 1, totalLogs: 0, limit: LOGS_PER_PAGE }
  const logsCounts = projectData.logsCounts || { statusChanges: 0, activities: 0, incidents: 0 }

  const getLogStyle = (logType: string) => {
    switch (logType) {
      case 'status_change': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
      case 'incident': return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
      default: return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Activity</h2>
          <span className="text-sm text-gray-500">({logsPagination.totalLogs})</span>
        </div>
        {/* Summary counts */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600 cursor-help" title="Status Changes">
            <CheckCircle className="h-3.5 w-3.5" /> {logsCounts.statusChanges}
          </span>
          <span className="flex items-center gap-1 text-blue-600 cursor-help" title="Activities">
            <Activity className="h-3.5 w-3.5" /> {logsCounts.activities}
          </span>
          <span className="flex items-center gap-1 text-amber-600 cursor-help" title="Incidents">
            <AlertCircle className="h-3.5 w-3.5" /> {logsCounts.incidents}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {projectLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectLogs.map((log) => {
              const style = getLogStyle(log.log_type)
              const Icon = style.icon

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${style.bg} ${style.border}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 ${style.color} flex-shrink-0 mt-0.5`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{log.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDateTime(log.created_at)}</span>
                        <span>{log.recorded_by_name || 'System'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {logsPagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <span className="text-gray-500">
            Page {logsPagination.currentPage} of {logsPagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={logsPagination.currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={logsPagination.currentPage === logsPagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectLogs
