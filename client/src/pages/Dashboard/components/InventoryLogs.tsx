import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Package,
  Clock
} from 'lucide-react'

// Mock data for inventory logs
const mockInventoryLogs = [
  {
    id: 1,
    type: 'in',
    itemName: 'Steel Rebar 12mm',
    quantity: 500,
    fromLocation: 'Supplier Warehouse',
    toLocation: 'Main Warehouse',
    referenceNo: 'IN-2024-001',
    handledBy: 'John Doe',
    timestamp: '2024-10-25T09:30:00Z',
    remarks: 'Delivery from supplier ABC Steel'
  },
  {
    id: 2,
    type: 'out',
    itemName: 'Cement Portland',
    quantity: 200,
    fromLocation: 'Main Warehouse',
    toLocation: 'Metro Manila Site',
    referenceNo: 'OUT-2024-015',
    handledBy: 'Maria Santos',
    timestamp: '2024-10-25T08:15:00Z',
    remarks: 'Project allocation for JO-2024-001'
  },
  {
    id: 3,
    type: 'transfer',
    itemName: 'Concrete Mixer',
    quantity: 2,
    fromLocation: 'Main Warehouse',
    toLocation: 'Cebu Warehouse',
    referenceNo: 'TRF-2024-008',
    handledBy: 'Carlos Rivera',
    timestamp: '2024-10-25T07:45:00Z',
    remarks: 'Equipment transfer for upcoming project'
  },
  {
    id: 4,
    type: 'in',
    itemName: 'Safety Helmets',
    quantity: 100,
    fromLocation: 'Safety Supplies Inc',
    toLocation: 'Main Warehouse',
    referenceNo: 'IN-2024-002',
    handledBy: 'Lisa Garcia',
    timestamp: '2024-10-24T16:20:00Z',
    remarks: 'Monthly safety equipment replenishment'
  },
  {
    id: 5,
    type: 'out',
    itemName: 'Welding Rods',
    quantity: 50,
    fromLocation: 'Main Warehouse',
    toLocation: 'Davao Site',
    referenceNo: 'OUT-2024-016',
    handledBy: 'Robert Kim',
    timestamp: '2024-10-24T14:30:00Z',
    remarks: 'Weekly material allocation'
  }
]

const InventoryLogs = () => {
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
        {mockInventoryLogs.map((log) => (
          <Card key={log.id} className={`bg-white hover:shadow-sm transition-all duration-200`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getLogIcon(log.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg text-gray-900">
                        {log.itemName}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLogBadge(log.type)}`}>
                        {log.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Qty: {log.quantity}</span>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          {log.referenceNo}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>From: <span className="font-medium">{log.fromLocation}</span></span>
                        <ArrowLeftRight className="h-3 w-3 text-gray-400" />
                        <span>To: <span className="font-medium">{log.toLocation}</span></span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span>By: {log.handledBy}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.timestamp)}
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
        ))}
        
        {mockInventoryLogs.length === 0 && (
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