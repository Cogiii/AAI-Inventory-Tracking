import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  History
} from 'lucide-react'

// Mock item data (this would come from your API)
const mockItemData = {
  id: 1,
  type: 'product',
  brand_id: 1,
  brand_name: 'DeWalt',
  name: 'Professional Power Drill DW234',
  description: 'High-performance cordless drill with 18V battery, variable speed trigger, and LED work light. Perfect for construction and maintenance work.',
  delivered_quantity: 50,
  damaged_quantity: 3,
  lost_quantity: 2,
  available_quantity: 45,
  warehouse_location_id: 1,
  warehouse_location: 'Warehouse A - Section 1',
  status: 'available',
  created_at: '2024-08-15T09:30:00Z',
  updated_at: '2024-10-24T14:22:00Z'
}

// Mock activity history
const mockActivityHistory = [
  {
    id: 1,
    action: 'quantity_updated',
    description: 'Available quantity updated from 47 to 45',
    user: 'John Doe',
    timestamp: '2024-10-24T14:22:00Z'
  },
  {
    id: 2,
    action: 'item_used',
    description: 'Used 2 units for Project JO-2024-001',
    user: 'Maria Santos',
    timestamp: '2024-10-20T10:15:00Z'
  },
  {
    id: 3,
    action: 'item_damaged',
    description: 'Reported 1 damaged unit',
    user: 'Carlos Rodriguez',
    timestamp: '2024-10-18T16:45:00Z'
  },
  {
    id: 4,
    action: 'item_received',
    description: 'Received 10 new units',
    user: 'Admin User',
    timestamp: '2024-10-15T08:30:00Z'
  }
]

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<typeof mockItemData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchItem = async () => {
      try {
        setLoading(true)
        // In real app, fetch item by ID
        // const response = await api.getItem(id)
        // setItem(response.data)
        
        // For now, use mock data
        setTimeout(() => {
          setItem(mockItemData)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error fetching item:', error)
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const handleEdit = () => {
    navigate(`/inventory/item/${id}/edit`)
  }

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Delete item:', id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateUtilizationRate = () => {
    if (!item) return 0
    const totalDelivered = item.delivered_quantity
    const totalUsed = item.delivered_quantity - item.available_quantity
    return totalDelivered > 0 ? ((totalUsed / totalDelivered) * 100).toFixed(1) : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-6 p-7">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Item not found</h3>
          <p className="text-gray-600 mb-4">The requested item could not be found.</p>
          <Button onClick={() => navigate('/inventory')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
            <p className="text-sm text-gray-600 capitalize">{item.type} • ID: {item.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
          <Button variant="outline" onClick={handleDelete} className="border-red-300 text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand</label>
                  <p className="text-lg text-gray-900">{item.brand_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {item.type}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{item.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quantity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">{item.delivered_quantity}</p>
                  <p className="text-sm text-blue-600">Delivered</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">{item.available_quantity}</p>
                  <p className="text-sm text-green-600">Available</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">{item.damaged_quantity}</p>
                  <p className="text-sm text-red-600">Damaged</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-900">{item.lost_quantity}</p>
                  <p className="text-sm text-yellow-600">Lost</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Utilization Rate</span>
                  <span className="text-lg font-semibold text-gray-900">{calculateUtilizationRate()}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${calculateUtilizationRate()}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityHistory.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        by {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Warehouse Location</label>
                <p className="text-gray-900 flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {item.warehouse_location}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(item.created_at)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900 flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(item.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Update Quantity
              </Button>
              <Button className="w-full" variant="outline">
                Move Location
              </Button>
              <Button className="w-full" variant="outline">
                Report Issue
              </Button>
              <Button className="w-full" variant="outline">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ItemDetails