import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ChevronRight } from 'lucide-react'

// Mock data for stock details
const mockStockDetails = [
  {
    id: 1,
    client: 'Bluegre',
    project: 'Lorem Ipsum',
    batchNo: 'Lorem Ipsum',
    status: 'In Transit',
    statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 2,
    client: 'Bluegre',
    project: 'Lorem Ipsum',
    batchNo: 'Lorem Ipsum',
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 3,
    client: 'Bluegre',
    project: 'Lorem Ipsum',
    batchNo: 'Lorem Ipsum',
    status: 'Pending',
    statusColor: 'bg-red-100 text-red-800 border-red-200'
  }
]

const StockDetails = () => {
  const handleViewDetails = (id: number) => {
    console.log('View stock details:', id)
    alert(`View details for stock item ${id}`)
  }

  return (
    <Card className="bg-bg-gray">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-custom">
          <Package className="h-5 w-5" />
          Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-3 pb-2 mb-3 border-b border-gray-200 text-xs font-medium text-gray-600">
          <div>Client</div>
          <div>Project</div>
          <div>Batch ID no.</div>
          <div>Status</div>
          <div></div>
        </div>
        
        {/* Table Rows */}
        <div className="space-y-2">
          {mockStockDetails.map((item) => (
            <div 
              key={item.id} 
              className="grid grid-cols-5 gap-3 items-center py-2.5 px-3 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100"
            >
              <div className="text-xs font-medium text-gray-900">
                {item.client}
              </div>
              
              <div className="text-xs text-gray-700">
                {item.project}
              </div>
              
              <div className="text-xs text-gray-700 font-mono">
                {item.batchNo}
              </div>
              
              <div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleViewDetails(item.id)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {mockStockDetails.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No stock details found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StockDetails