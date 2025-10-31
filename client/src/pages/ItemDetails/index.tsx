import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import Loader from '@/components/ui/Loader'
import { getInventoryItem, deleteInventoryItem, updateInventoryItem, getLocations } from '@/services/api/inventory'

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

// Mock activity history - this would come from API in future implementation
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
  const [item, setItem] = useState<ApiInventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // Quick Action Modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [updateQuantityModalOpen, setUpdateQuantityModalOpen] = useState(false)
  const [moveLocationModalOpen, setMoveLocationModalOpen] = useState(false)
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false)
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'product' as 'product' | 'material',
    brand_id: null as number | null,
    warehouse_location_id: null as number | null,
    status: ''
  })
  
  const [quantityForm, setQuantityForm] = useState({
    delivered_quantity: 0,
    available_quantity: 0,
    damaged_quantity: 0,
    lost_quantity: 0
  })
  
  const [locationForm, setLocationForm] = useState({
    warehouse_location_id: null as number | null
  })
  
  const [issueForm, setIssueForm] = useState({
    issue_type: 'damage' as 'damage' | 'loss',
    quantity: 1,
    description: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<any[]>([])

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await getInventoryItem(id)
        if (response.success) {
          setItem(response.data.item)
        } else {
          setItem(null)
        }
      } catch (error) {
        console.error('Error fetching item:', error)
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  // Populate forms when item loads
  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name,
        description: item.description || '',
        type: item.type,
        brand_id: item.brand_id,
        warehouse_location_id: item.warehouse_location_id,
        status: item.status || ''
      })
      
      setQuantityForm({
        delivered_quantity: item.delivered_quantity,
        available_quantity: item.available_quantity,
        damaged_quantity: item.damaged_quantity,
        lost_quantity: item.lost_quantity
      })
      
      setLocationForm({
        warehouse_location_id: item.warehouse_location_id
      })
    }
  }, [item])

  const handleEdit = () => {
    setEditModalOpen(true)
  }

  const handleUpdateQuantity = () => {
    setUpdateQuantityModalOpen(true)
  }

  const handleMoveLocation = async () => {
    try {
      const response = await getLocations()
      if (response.success) {
        setAvailableLocations(response.data.locations)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
    setMoveLocationModalOpen(true)
  }

  const handleReportIssue = () => {
    setReportIssueModalOpen(true)
  }

  const handleGenerateReport = () => {
    // Generate and download report for this specific item
    const reportData = {
      itemId: item?.id,
      itemName: item?.name,
      reportDate: new Date().toISOString(),
      data: item
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `item-${item?.id}-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleEditSubmit = async () => {
    if (!id || !item) return
    
    try {
      setSaving(true)
      const response = await updateInventoryItem(id, editForm)
      
      if (response.success) {
        setItem(response.data.item)
        setEditModalOpen(false)
        setErrorMessage('Item updated successfully!')
        setErrorModalOpen(true)
      } else {
        setErrorMessage(`Failed to update item: ${response.error || 'Unknown error'}`)
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      setErrorMessage(`Cannot update item: ${error.message || 'Unknown error'}`)
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleQuantitySubmit = async () => {
    if (!id || !item) return
    
    try {
      setSaving(true)
      const response = await updateInventoryItem(id, quantityForm)
      
      if (response.success) {
        setItem(response.data.item)
        setUpdateQuantityModalOpen(false)
        setErrorMessage('Quantities updated successfully!')
        setErrorModalOpen(true)
      } else {
        setErrorMessage(`Failed to update quantities: ${response.error || 'Unknown error'}`)
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      setErrorMessage(`Cannot update quantities: ${error.message || 'Unknown error'}`)
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleLocationSubmit = async () => {
    if (!id || !item) return
    
    try {
      setSaving(true)
      const response = await updateInventoryItem(id, locationForm)
      
      if (response.success) {
        setItem(response.data.item)
        setMoveLocationModalOpen(false)
        setErrorMessage('Location updated successfully!')
        setErrorModalOpen(true)
      } else {
        setErrorMessage(`Failed to update location: ${response.error || 'Unknown error'}`)
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      setErrorMessage(`Cannot update location: ${error.message || 'Unknown error'}`)
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleIssueSubmit = async () => {
    if (!id || !item) return
    
    try {
      setSaving(true)
      
      // Update quantities based on issue type
      const updates: any = {}
      if (issueForm.issue_type === 'damage') {
        updates.damaged_quantity = item.damaged_quantity + issueForm.quantity
        updates.available_quantity = Math.max(0, item.available_quantity - issueForm.quantity)
      } else if (issueForm.issue_type === 'loss') {
        updates.lost_quantity = item.lost_quantity + issueForm.quantity
        updates.available_quantity = Math.max(0, item.available_quantity - issueForm.quantity)
      }
      
      const response = await updateInventoryItem(id, updates)
      
      if (response.success) {
        setItem(response.data.item)
        setReportIssueModalOpen(false)
        setErrorMessage(`${issueForm.issue_type === 'damage' ? 'Damage' : 'Loss'} reported successfully!`)
        setErrorModalOpen(true)
        
        // Reset form
        setIssueForm({
          issue_type: 'damage',
          quantity: 1,
          description: ''
        })
      } else {
        setErrorMessage(`Failed to report issue: ${response.error || 'Unknown error'}`)
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      setErrorMessage(`Cannot report issue: ${error.message || 'Unknown error'}`)
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !item) return
    
    try {
      setDeleting(true)
      console.log('Attempting to delete item with ID:', id)
      const response = await deleteInventoryItem(id)
      console.log('Delete response:', response)
      
      if (response.success) {
        // Navigate back to inventory page after successful deletion
        navigate('/inventory', { 
          replace: true,
          state: { 
            message: `Item "${item.name}" has been deleted successfully.` 
          }
        })
      } else {
        console.error('Failed to delete item:', response.error || response)
        setErrorMessage(`Failed to delete item: ${response.error || 'Unknown error'}`)
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      console.error('Error deleting item:', error)
      
      // Handle specific error types
      let errorMessage = 'Unknown error occurred'
      
      if (error.code === '404') {
        errorMessage = 'Item not found. It may have already been deleted.'
      } else if (error.code === '401') {
        errorMessage = 'You are not authenticated. Please log in and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrorMessage(`Cannot delete item: ${errorMessage}`)
      setErrorModalOpen(true)
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
    }
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
        <Loader />
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
            className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
            <p className="text-sm text-gray-600 capitalize">{item.type} • ID: {item.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleEdit} 
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] px-6 py-2"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDeleteModalOpen(true)} 
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200 hover:shadow-md hover:scale-[1.02] px-6 py-2"
          >
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
                  <p className="text-lg text-gray-900">{item.brand_name || 'No Brand'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {item.type}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status || 'active')}`}>
                    {getStatusIcon(item.status || 'active')}
                    {(item.status || 'active').replace('_', ' ').toUpperCase()}
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
                  {item.warehouse_location_name || 'No Location Assigned'}
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
            <CardContent className="space-y-3">
              <Button 
                className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300" 
                variant="outline" 
                onClick={handleUpdateQuantity}
              >
                <Package className="h-4 w-4 mr-2" />
                Update Quantity
              </Button>
              <Button 
                className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300" 
                variant="outline" 
                onClick={handleMoveLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Move Location
              </Button>
              <Button 
                className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 hover:border-yellow-300" 
                variant="outline" 
                onClick={handleReportIssue}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button 
                className="w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300" 
                variant="outline" 
                onClick={handleGenerateReport}
              >
                <History className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        type="delete"
        title="Delete Item"
        message={`Are you sure you want to delete "${item?.name}"? This action cannot be undone and will permanently remove this item from the inventory.`}
        confirmText={deleting ? "Deleting..." : "Delete Item"}
        cancelText="Cancel"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onConfirm={() => setErrorModalOpen(false)}
        type="warning"
        title="Notification"
        message={errorMessage}
        confirmText="OK"
        cancelText=""
      />

      {/* Edit Item Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Item" size="lg">
        <ModalBody>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                placeholder="Enter item name..."
                disabled={saving}
              />
              {!editForm.name.trim() && (
                <p className="mt-1 text-sm text-red-600">Item name is required</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                placeholder="Enter item description..."
                disabled={saving}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as 'product' | 'material' }))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                  disabled={saving}
                >
                  <option value="product">Product</option>
                  <option value="material">Material</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                  disabled={saving}
                >
                  <option value="">Select status...</option>
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setEditModalOpen(false)}
            className="transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            disabled={saving || !editForm.name.trim()}
            className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
              saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Update Quantity Modal */}
      <Modal isOpen={updateQuantityModalOpen} onClose={() => setUpdateQuantityModalOpen(false)} title="Update Quantities" size="md">
        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-2">Delivered Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantityForm.delivered_quantity}
                  onChange={(e) => setQuantityForm(prev => ({ ...prev, delivered_quantity: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-lg border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 px-4 py-3 text-center font-semibold text-blue-900"
                  disabled={saving}
                />
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-700 mb-2">Available Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantityForm.available_quantity}
                  onChange={(e) => setQuantityForm(prev => ({ ...prev, available_quantity: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-all duration-200 px-4 py-3 text-center font-semibold text-green-900"
                  disabled={saving}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <label className="block text-sm font-medium text-red-700 mb-2">Damaged Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantityForm.damaged_quantity}
                  onChange={(e) => setQuantityForm(prev => ({ ...prev, damaged_quantity: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-lg border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 px-4 py-3 text-center font-semibold text-red-900"
                  disabled={saving}
                />
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label className="block text-sm font-medium text-yellow-700 mb-2">Lost Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantityForm.lost_quantity}
                  onChange={(e) => setQuantityForm(prev => ({ ...prev, lost_quantity: parseInt(e.target.value) || 0 }))}
                  className="block w-full rounded-lg border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-all duration-200 px-4 py-3 text-center font-semibold text-yellow-900"
                  disabled={saving}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Total Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{quantityForm.delivered_quantity}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Available: {quantityForm.available_quantity} | 
                  Issues: {quantityForm.damaged_quantity + quantityForm.lost_quantity}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setUpdateQuantityModalOpen(false)}
            className="transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleQuantitySubmit} 
            disabled={saving}
            className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
              saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Update Quantities
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Move Location Modal */}
      <Modal isOpen={moveLocationModalOpen} onClose={() => setMoveLocationModalOpen(false)} title="Move Location" size="md">
        <ModalBody>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Current Location</span>
              </div>
              <p className="text-blue-800 font-semibold">
                {item?.warehouse_location_name || 'No Location Assigned'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                New Location *
              </label>
              <select
                value={locationForm.warehouse_location_id || ''}
                onChange={(e) => setLocationForm(prev => ({ ...prev, warehouse_location_id: e.target.value ? parseInt(e.target.value) : null }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                disabled={saving}
              >
                <option value="">Select a new location...</option>
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    📍 {location.name} {location.city && `- ${location.city}`}
                  </option>
                ))}
              </select>
              {!locationForm.warehouse_location_id && (
                <p className="mt-1 text-sm text-gray-600">Please select a destination location</p>
              )}
            </div>
            
            {locationForm.warehouse_location_id && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">Ready to Move</span>
                </div>
                <p className="text-green-800 text-sm mt-1">
                  Item will be moved to the selected location
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setMoveLocationModalOpen(false)}
            className="transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLocationSubmit} 
            disabled={saving || !locationForm.warehouse_location_id}
            className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
              saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Moving...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Move Item
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Report Issue Modal */}
      <Modal isOpen={reportIssueModalOpen} onClose={() => setReportIssueModalOpen(false)} title="Report Issue" size="md">
        <ModalBody>
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-900">Report Item Issue</span>
              </div>
              <p className="text-yellow-800 text-sm">
                This will adjust the item quantities and create a record of the issue.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="issue_type"
                      value="damage"
                      checked={issueForm.issue_type === 'damage'}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, issue_type: e.target.value as 'damage' | 'loss' }))}
                      className="mr-3"
                      disabled={saving}
                    />
                    <div>
                      <div className="font-medium text-gray-900">Damage</div>
                      <div className="text-sm text-gray-600">Items are damaged but still present</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="issue_type"
                      value="loss"
                      checked={issueForm.issue_type === 'loss'}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, issue_type: e.target.value as 'damage' | 'loss' }))}
                      className="mr-3"
                      disabled={saving}
                    />
                    <div>
                      <div className="font-medium text-gray-900">Loss</div>
                      <div className="text-sm text-gray-600">Items are missing or lost</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Affected</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={item?.available_quantity || 0}
                    value={issueForm.quantity}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className={`block w-full rounded-lg border shadow-sm transition-all duration-200 px-4 py-3 text-center font-semibold ${
                      issueForm.quantity > (item?.available_quantity || 0) 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50' 
                        : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900'
                    }`}
                    disabled={saving}
                  />
                </div>
                <div className="mt-2 text-sm">
                  <div className={`flex justify-between ${
                    issueForm.quantity > (item?.available_quantity || 0) ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <span>Available: {item?.available_quantity || 0}</span>
                    <span>Reporting: {issueForm.quantity}</span>
                  </div>
                  {issueForm.quantity > (item?.available_quantity || 0) && (
                    <p className="text-red-600 font-medium mt-1">⚠️ Exceeds available quantity!</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={issueForm.description}
                onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
                placeholder="Describe what happened, when, and any other relevant details..."
                disabled={saving}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setReportIssueModalOpen(false)}
            className="transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleIssueSubmit} 
            disabled={saving || issueForm.quantity > (item?.available_quantity || 0) || issueForm.quantity < 1}
            className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
              saving ? 'bg-yellow-400 cursor-not-allowed' : 
              issueForm.quantity > (item?.available_quantity || 0) ? 'bg-red-400 cursor-not-allowed' :
              'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Reporting...
              </>
            ) : issueForm.quantity > (item?.available_quantity || 0) ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Exceeds Available
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report {issueForm.issue_type === 'damage' ? 'Damage' : 'Loss'}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ItemDetails