import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity,
  Clock,
  CheckCircle,
  Edit3
} from 'lucide-react'
import { useActivityLogs } from '@/hooks/useDashboard'
  
const ActivityLogs = () => {
  const { data: logs, isLoading, error } = useActivityLogs();
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-blue-custom" />
      case 'confirmation':
        return <CheckCircle className="h-4 w-4 text-blue-custom" />
      case 'update':
        return <Edit3 className="h-4 w-4 text-blue-custom" />
      default:
        return <Activity className="h-4 w-4 text-blue-custom" />
    }
  }

  const formatRelativeTime = (_dateString: string) => {
    return 'Fri Sep 12 8:34 PM'
  }

  return (
    <Card className="bg-gray">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-custom">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200">
            VIEW ALL
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex-1 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-red-300" />
            <p>Error loading activity logs</p>
          </div>
        ) : logs && logs.length > 0 ? (
          logs.map((log) => {
            const userName = log.user_first_name && log.user_last_name 
              ? `${log.user_first_name} ${log.user_last_name}`
              : 'Unknown User';
            const userInitials = log.user_first_name && log.user_last_name 
              ? `${log.user_first_name[0]}${log.user_last_name[0]}` 
              : 'UN';
            
            return (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100">
                <div className={`w-10 h-10 rounded-full bg-blue flex items-center justify-center text-white text-lg font-medium flex-shrink-0`}>
                  {userInitials}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{userName}</span>{' '}
                        <span className="text-gray-600">{log.description || `${log.action} ${log.entity}`}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getActivityIcon(log.action)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(log.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityLogs;