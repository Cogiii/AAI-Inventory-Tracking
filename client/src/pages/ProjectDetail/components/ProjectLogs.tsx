import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Activity, AlertCircle, CheckCircle, Info, Clock, Loader2 } from 'lucide-react'
import { useProjectDetail } from '@/hooks/useProjectDetail'



interface ProjectLogsProps {
  joNumber?: string
}

const ProjectLogs: FC<ProjectLogsProps> = ({ joNumber }) => {
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber)
  
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
          Project Activity Logs ({projectLogs.length})
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
                  {projectLogs.filter(log => log.log_type === 'status_change').length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="font-medium text-gray-700">Activities</p>
                <p className="text-lg font-bold text-blue-600">
                  {projectLogs.filter(log => log.log_type === 'activity').length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <AlertCircle className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                <p className="font-medium text-gray-700">Incidents</p>
                <p className="text-lg font-bold text-orange-600">
                  {projectLogs.filter(log => log.log_type === 'incident').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectLogs