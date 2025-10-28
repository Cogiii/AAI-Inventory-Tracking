import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity,
  Clock,
  CheckCircle,
  Edit3
} from 'lucide-react'

// Mock data for activity logs
const mockActivityLogs = [
  {
    id: 1,
    user: 'Laurence Devera',
    userInitials: 'LD',
    action: 'approved',
    entity: 'Stock Batch',
    description: 'approved Stock Batch ID #18576',
    timestamp: '2024-10-25T09:30:00Z',
    type: 'approval'
  },
  {
    id: 2,
    user: 'Laurence Devera',
    userInitials: 'LD',
    action: 'confirmed',
    entity: 'delivery for Stock Batch',
    description: 'confirmed delivery for Stock Batch ID #18570',
    timestamp: '2024-10-25T08:54:00Z',
    type: 'confirmation'
  },
  {
    id: 3,
    user: 'Karsten Cabico',
    userInitials: 'KC',
    action: 'moved',
    entity: 'blah blah blah blah bla',
    description: 'moved blah blah blah blah bla',
    timestamp: '2024-10-25T08:34:00Z',
    type: 'update'
  },
  {
    id: 4,
    user: 'Laurence Khael',
    userInitials: 'LK',
    action: 'moved',
    entity: 'blah blah blah blah bla',
    description: 'moved blah blah blah blah bla',
    timestamp: '2024-10-25T08:34:00Z',
    type: 'update'
  },
  {
    id: 5,
    user: 'Anna Beatriz',
    userInitials: 'AB',
    action: 'moved',
    entity: 'blah blah blah blah bla',
    description: 'moved blah blah blah blah bla',
    timestamp: '2024-10-25T08:34:00Z',
    type: 'update'
  },
  {
    id: 6,
    user: 'Kevin Cruz',
    userInitials: 'KC',
    action: 'moved',
    entity: 'blah blah blah blah bla',
    description: 'moved blah blah blah blah bla',
    timestamp: '2024-10-25T08:34:00Z',
    type: 'update'
  }
]

const ActivityLogs = () => {
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
        {mockActivityLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100">
            <div className={`w-10 h-10 rounded-full bg-blue flex items-center justify-center text-white text-lg font-medium flex-shrink-0`}>
              {log.userInitials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.user}</span>{' '}
                    <span className="text-gray-600">{log.description}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getActivityIcon(log.type)}
                </div>
              </div>
              
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(log.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {mockActivityLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityLogs