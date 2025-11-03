import { Card, CardContent } from '@/components/ui/card'
import { Package, MapPin, AlertTriangle, CheckCircle, XCircle, TrendingUp, Minus } from 'lucide-react'

// API response type - matches what the backend returns
interface ApiInventoryItem {
  id: number;
  type: 'product' | 'material';
  brand_id: number | null;
  brand_name: string | null;
  name: string;
  description: string | null;
  delivered_quantity: number;
  damaged_quantity: number;
  lost_quantity: number;
  available_quantity: number;
  warehouse_location_id: number | null;
  warehouse_location_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface ItemInfoCardsProps {
  item: ApiInventoryItem
}

const ItemInfoCards = ({ item }: ItemInfoCardsProps) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return { 
        color: 'text-green-700', 
        bg: 'bg-green-100', 
        border: 'border-green-300',
        icon: <CheckCircle className="h-5 w-5" />
      }
      case 'low_stock': return { 
        color: 'text-yellow-700', 
        bg: 'bg-yellow-100', 
        border: 'border-yellow-300',
        icon: <AlertTriangle className="h-5 w-5" />
      }
      case 'out_of_stock': return { 
        color: 'text-red-700', 
        bg: 'bg-red-100', 
        border: 'border-red-300',
        icon: <XCircle className="h-5 w-5" />
      }
      default: return { 
        color: 'text-gray-700', 
        bg: 'bg-gray-100', 
        border: 'border-gray-300',
        icon: <Minus className="h-5 w-5" />
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateUtilizationRate = () => {
    if (item.delivered_quantity === 0) return 0
    return parseFloat(((item.delivered_quantity - item.available_quantity) / item.delivered_quantity * 100).toFixed(1))
  }

  const utilizationRate = calculateUtilizationRate()
  const statusConfig = getStatusConfig(item.status || '')

  return (
    <div className="mb-8">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Delivered Quantity */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Package className="h-6 w-6 text-gray-custom" />
              <div>
                <p className="text-md font-bold text-gray-700">Total Delivered</p>
                <p className="text-sm font-medium text-gray-500">{item.delivered_quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Quantity */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-6 w-6 text-gray-custom" />
              <div>
                <p className="text-md font-bold text-gray-700">Available</p>
                <p className="text-sm font-medium text-gray-500">{item.available_quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Damaged Quantity */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-6 w-6 text-gray-custom" />
              <div>
                <p className="text-md font-bold text-gray-700">Damaged</p>
                <p className="text-sm font-medium text-gray-500">{item.damaged_quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lost Quantity */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <XCircle className="h-6 w-6 text-gray-custom" />
              <div>
                <p className="text-md font-bold text-gray-700">Lost</p>
                <p className="text-sm font-medium text-gray-500">{item.lost_quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Details */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-gray-custom mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Item Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">ID</span>
                <span className="text-sm font-bold text-gray-900">#{item.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Type</span>
                <span className="text-sm font-bold text-gray-900 capitalize">{item.type}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Brand</span>
                <span className="text-sm font-bold text-gray-900">{item.brand_name || 'No Brand'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                  {statusConfig.icon}
                  {item.status || 'Active'}
                </span>
              </div>
            </div>

            {item.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-gray-custom mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Location & Timeline</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Current Location</span>
                <span className="text-sm font-bold text-gray-700">{item.warehouse_location_name || 'Not Assigned'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Created</span>
                <span className="text-sm font-bold text-gray-700">{formatDate(item.created_at)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
                <span className="text-sm font-bold text-gray-700">{formatDate(item.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Metrics */}
        <Card className="hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-gray-custom mr-3" />
              <h3 className="text-lg font-semibold text-gray-700">Analytics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Utilization Rate</span>
                <span className="text-sm font-bold text-gray-700">{utilizationRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Used Items</span>
                <span className="text-sm font-bold text-gray-700">{item.delivered_quantity - item.available_quantity}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Issues (Damaged + Lost)</span>
                <span className="text-sm font-bold text-gray-700">{item.damaged_quantity + item.lost_quantity}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ItemInfoCards