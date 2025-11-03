import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import Loader from '@/components/ui/Loader'
import { 
  getInventoryItem, 
  getLocations, 
  updateInventoryItem,
  updateItemQuantity,
  moveItemLocation,
  reportItemIssue,
  deleteInventoryItem,
  getItemActivity
} from '@/services/api/inventory'

// Import separated components
import {
  ItemHeader,
  ItemInfoCards,
  ActionButtons,
  EditItemModal,
  UpdateQuantityModal,
  MoveLocationModal,
  ReportIssueModal,
  ActivityHistoryCard
} from './components'

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
import { ArrowLeft } from 'lucide-react'

interface ActivityItem {
  id: number
  action: string
  description: string
  user_name: string
  created_at: string
}

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ApiInventoryItem | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
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
    delivered_quantity: 0
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
      setErrorMessage('Failed to load item details')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivities = async () => {
    if (!id) return
    
    try {
      const response = await getItemActivity(id)
      if (response.success) {
        setActivities(response.data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  useEffect(() => {
    fetchItem()
    fetchActivities()
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
        delivered_quantity: item.delivered_quantity
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

  const handleEditSubmit = async () => {
    if (!id) return
    
    try {
      setSaving(true)
      const response = await updateInventoryItem(id, editForm)
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        setEditModalOpen(false)
      } else {
        setErrorMessage('Failed to update item')
        setErrorModalOpen(true)
      }
    } catch (error) {
      console.error('Error updating item:', error)
      setErrorMessage('Failed to update item')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleQuantitySubmit = async () => {
    if (!id) return
    
    try {
      setSaving(true)
      const response = await updateItemQuantity(id, quantityForm)
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        setUpdateQuantityModalOpen(false)
      } else {
        setErrorMessage('Failed to update quantity')
        setErrorModalOpen(true)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      setErrorMessage('Failed to update quantity')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleLocationSubmit = async () => {
    if (!id || !locationForm.warehouse_location_id) return
    
    try {
      setSaving(true)
      const response = await moveItemLocation(id, { warehouse_location_id: locationForm.warehouse_location_id })
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        setMoveLocationModalOpen(false)
      } else {
        setErrorMessage('Failed to move item location')
        setErrorModalOpen(true)
      }
    } catch (error) {
      console.error('Error moving location:', error)
      setErrorMessage('Failed to move item location')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleIssueSubmit = async () => {
    if (!id) return
    
    try {
      setSaving(true)
      const response = await reportItemIssue(id, issueForm)
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        setReportIssueModalOpen(false)
        // Reset issue form
        setIssueForm({
          issue_type: 'damage',
          quantity: 1,
          description: ''
        })
      } else {
        setErrorMessage('Failed to report issue')
        setErrorModalOpen(true)
      }
    } catch (error) {
      console.error('Error reporting issue:', error)
      setErrorMessage('Failed to report issue')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!id) return
    
    try {
      setSaving(true)
      const response = await deleteInventoryItem(id)
      if (response.success) {
        navigate('/inventory')
      } else {
        setErrorMessage('Failed to delete item')
        setErrorModalOpen(true)
        setDeleteModalOpen(false)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      setErrorMessage('Failed to delete item')
      setErrorModalOpen(true)
      setDeleteModalOpen(false)
    } finally {
      setSaving(false)
    }
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
          <div className="h-12 w-12 mx-auto text-gray-300 mb-4 flex items-center justify-center">
            📦
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Item not found</h3>
          <p className="text-gray-600 mb-4">The requested item could not be found.</p>
          <button 
            onClick={() => navigate('/inventory')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className="space-y-6 p-7">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ItemHeader 
          itemName={item.name}
          onBack={() => navigate('/inventory')}
        />

        {/* Item Information Cards */}
        <ItemInfoCards item={item} />

        {/* Action Buttons */}
        <ActionButtons
          onEdit={handleEdit}
          onUpdateQuantity={handleUpdateQuantity}
          onMoveLocation={handleMoveLocation}
          onReportIssue={handleReportIssue}
          onDelete={() => setDeleteModalOpen(true)}
        />

        {/* Activity History */}
        <ActivityHistoryCard activities={activities} />
      {/* Modals */}
      <EditItemModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSubmit={handleEditSubmit}
        saving={saving}
      />

      <UpdateQuantityModal
        isOpen={updateQuantityModalOpen}
        onClose={() => setUpdateQuantityModalOpen(false)}
        quantityForm={quantityForm}
        setQuantityForm={setQuantityForm}
        onSubmit={handleQuantitySubmit}
        saving={saving}
      />

      <MoveLocationModal
        isOpen={moveLocationModalOpen}
        onClose={() => setMoveLocationModalOpen(false)}
        locationForm={locationForm}
        setLocationForm={setLocationForm}
        onSubmit={handleLocationSubmit}
        saving={saving}
        availableLocations={availableLocations}
      />

      <ReportIssueModal
        isOpen={reportIssueModalOpen}
        onClose={() => setReportIssueModalOpen(false)}
        issueForm={issueForm}
        setIssueForm={setIssueForm}
        onSubmit={handleIssueSubmit}
        saving={saving}
        maxQuantity={item?.available_quantity || 0}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
        type="delete"
        title="Delete Item"
        message={`Are you sure you want to delete "${item?.name}"? This action cannot be undone and will permanently remove this item from the inventory.`}
        confirmText="Delete Item"
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
      </div>
    </div>
  )
}

export default ItemDetails