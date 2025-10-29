import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Package,
  Clock
} from 'lucide-react'
import { useInventoryLogs } from '@/hooks/useDashboard'
const InventoryLogs = () => {
  const { data: logs, isLoading, error } = useInventoryLogs();
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case 'out':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'out':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'transfer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-gray">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-custom">
          <Package className="h-5 w-5" />
          Inventory Flow/Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-red-300" />
            <p>Error loading inventory logs</p>
          </div>
        ) : logs && logs.length > 0 ? (
          logs.map((log) => (
            <Card key={log.id} className={`bg-white hover:shadow-sm transition-all duration-200`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getLogIcon(log.log_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-lg text-gray-900">
                          {log.item_name}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLogBadge(log.log_type)}`}>
                          {log.log_type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Qty: {log.quantity}</span>
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            {log.reference_no}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>From: <span className="font-medium">{log.from_location_name || 'External'}</span></span>
                        <ArrowLeftRight className="h-3 w-3 text-gray-400" />
                        <span>To: <span className="font-medium">{log.to_location_name || 'External'}</span></span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span>By: {log.handler_first_name} {log.handler_last_name}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.created_at)}
                        </div>
                      </div>
                      
                      {log.remarks && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          {log.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No inventory logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InventoryLogs