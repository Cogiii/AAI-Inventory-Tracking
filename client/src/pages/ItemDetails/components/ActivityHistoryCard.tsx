import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, User, Calendar, FileText, Activity } from 'lucide-react'

interface ActivityItem {
  id: number
  action: string
  description: string
  user_name: string
  created_at: string
}

interface ActivityHistoryCardProps {
  activities: ActivityItem[]
}

const ActivityHistoryCard = ({ activities }: ActivityHistoryCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = () => {
    return <FileText className="h-4 w-4 text-gray-custom" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow bg-white mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold text-gray-700">
          <Activity className="h-6 w-6 text-gray-custom mr-3" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <History className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No activity history available</p>
              <p className="text-sm text-gray-400 mt-1">Activities will appear here when actions are performed</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="relative p-4 rounded-lg bg-white"
              >
                {index !== activities.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-px bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-50 rounded-full p-2">
                    {getActionIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {activity.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center bg-white px-2 py-1 rounded-full">
                          <User className="h-3 w-3 mr-1" />
                          {activity.user_name || 'System'}
                        </span>
                      </div>
                      <span className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityHistoryCard