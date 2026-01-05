import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import Loader from '@/components/ui/Loader'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/utils/permissions'
import {
  getInventoryItem,
  getLocations,
  updateInventoryItem,
  updateItemQuantity,
  moveItemLocation,
  reportItemIssue,
  deleteInventoryItem,
  getItemActivity,
  getItemLocations,
  addDelivery,
  outStock,
  adjustQuantity,
  transferStock,
  type ItemLocation
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
  ActivityHistoryCard,
  ReservationsCard,
  AddStockModal,
  OutStockModal,
  AdjustQuantityModal,
  TransferStockModal,
  LocationQuantitiesCard
} from './components'
import type { StockFormState } from './components/AddStockModal'
import type { OutStockFormState } from './components/OutStockModal'
import type { AdjustmentFormState } from './components/AdjustQuantityModal'
import type { TransferFormState } from './components/TransferStockModal'

// Status type matching the database ENUM
type ItemStatus = 'in stock' | 'out of stock' | 'low stock' | 'inactive'

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
  reserved_quantity: number;
  warehouse_location_id: number | null;
  warehouse_location_name: string | null;
  status: ItemStatus | null;
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
  const { user } = useAuth()
  const [item, setItem] = useState<ApiInventoryItem | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [itemLocations, setItemLocations] = useState<ItemLocation[]>([])
  const [totalDelivered, setTotalDelivered] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Check if user is admin or has inventory edit permission
  const isAdmin = user?.positionName === 'Administrator'
  const canEditInventory = hasPermission(user?.permissions, 'inventory', 'edit')
  const canDeleteInventory = hasPermission(user?.permissions, 'inventory', 'delete')

  // Quick Action Modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [updateQuantityModalOpen, setUpdateQuantityModalOpen] = useState(false)
  const [moveLocationModalOpen, setMoveLocationModalOpen] = useState(false)
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false)

  // Multi-warehouse modals
  const [addStockModalOpen, setAddStockModalOpen] = useState(false)
  const [outStockModalOpen, setOutStockModalOpen] = useState(false)
  const [adjustQuantityModalOpen, setAdjustQuantityModalOpen] = useState(false)
  const [transferStockModalOpen, setTransferStockModalOpen] = useState(false)

  // Form states
  const [editForm, setEditForm] = useState<{
    name: string
    description: string
    type: 'product' | 'material'
    brand_id: number | null
    warehouse_location_id: number | null
    isInactive: boolean
  }>({
    name: '',
    description: '',
    type: 'product',
    brand_id: null,
    warehouse_location_id: null,
    isInactive: false
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

  // Multi-warehouse form states
  const [stockForm, setStockForm] = useState<StockFormState>({
    location_id: null,
    quantity: 0,
    reference_number: '',
    notes: ''
  })

  const [outStockForm, setOutStockForm] = useState<OutStockFormState>({
    location_id: null,
    quantity: 0,
    reference_number: '',
    notes: ''
  })

  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentFormState>({
    location_id: null,
    quantity: 0,
    reason: ''
  })

  const [transferForm, setTransferForm] = useState<TransferFormState>({
    from_location_id: null,
    to_location_id: null,
    quantity: 0,
    notes: ''
  })

  const [saving, setSaving] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<any[]>([])

  // Discard changes confirmation modal
  const [discardModalOpen, setDiscardModalOpen] = useState(false)
  const [pendingCloseModal, setPendingCloseModal] = useState<'edit' | 'quantity' | 'location' | 'issue' | 'stock' | 'outstock' | 'adjustment' | 'transfer' | null>(null)

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

  const fetchItemLocations = async () => {
    if (!id) return

    try {
      setLocationsLoading(true)
      const response = await getItemLocations(id)
      if (response.success) {
        setItemLocations(response.data.locations)
        setTotalDelivered(response.data.item.total_delivered || 0)
      }
    } catch (error) {
      console.error('Error fetching item locations:', error)
    } finally {
      setLocationsLoading(false)
    }
  }

  const fetchAvailableLocations = async () => {
    try {
      const response = await getLocations()
      if (response.success) {
        setAvailableLocations(response.data.locations)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  useEffect(() => {
    fetchItem()
    fetchActivities()
    fetchItemLocations()
    fetchAvailableLocations()
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
        isInactive: item.status === 'inactive'
      })
      
      setQuantityForm({
        delivered_quantity: item.delivered_quantity
      })
      
      setLocationForm({
        warehouse_location_id: item.warehouse_location_id
      })
    }
  }, [item])

  // Check if edit form has unsaved changes
  const hasEditChanges = () => {
    if (!item) return false
    return (
      editForm.name !== item.name ||
      editForm.description !== (item.description || '') ||
      editForm.type !== item.type ||
      editForm.isInactive !== (item.status === 'inactive')
    )
  }

  // Check if quantity form has unsaved changes
  const hasQuantityChanges = () => {
    if (!item) return false
    return quantityForm.delivered_quantity !== item.delivered_quantity
  }

  // Check if location form has unsaved changes
  const hasLocationChanges = () => {
    if (!item) return false
    return locationForm.warehouse_location_id !== item.warehouse_location_id
  }

  // Check if issue form has unsaved changes
  const hasIssueChanges = () => {
    return issueForm.description.trim() !== '' || issueForm.quantity !== 1
  }

  // Reset forms to original values
  const resetEditForm = () => {
    if (item) {
      setEditForm({
        name: item.name,
        description: item.description || '',
        type: item.type,
        brand_id: item.brand_id,
        warehouse_location_id: item.warehouse_location_id,
        isInactive: item.status === 'inactive'
      })
    }
  }

  const resetQuantityForm = () => {
    if (item) {
      setQuantityForm({ delivered_quantity: item.delivered_quantity })
    }
  }

  const resetLocationForm = () => {
    if (item) {
      setLocationForm({ warehouse_location_id: item.warehouse_location_id })
    }
  }

  const resetIssueForm = () => {
    setIssueForm({ issue_type: 'damage', quantity: 1, description: '' })
  }

  const resetStockForm = () => {
    setStockForm({ location_id: null, quantity: 0, reference_number: '', notes: '' })
  }

  const resetOutStockForm = () => {
    setOutStockForm({ location_id: null, quantity: 0, reference_number: '', notes: '' })
  }

  const resetAdjustmentForm = () => {
    setAdjustmentForm({ location_id: null, quantity: 0, reason: '' })
  }

  const resetTransferForm = () => {
    setTransferForm({ from_location_id: null, to_location_id: null, quantity: 0, notes: '' })
  }

  // Check if multi-warehouse forms have unsaved changes
  const hasStockChanges = () => {
    return stockForm.location_id !== null || stockForm.quantity > 0 || stockForm.reference_number !== '' || stockForm.notes !== ''
  }

  const hasOutStockChanges = () => {
    return outStockForm.location_id !== null || outStockForm.quantity > 0 || outStockForm.reference_number !== '' || outStockForm.notes !== ''
  }

  const hasAdjustmentChanges = () => {
    return adjustmentForm.location_id !== null || adjustmentForm.quantity !== 0 || adjustmentForm.reason !== ''
  }

  const hasTransferChanges = () => {
    return transferForm.from_location_id !== null || transferForm.to_location_id !== null || transferForm.quantity > 0
  }

  // Handle modal close with unsaved changes check
  const handleCloseEditModal = () => {
    if (hasEditChanges()) {
      setPendingCloseModal('edit')
      setDiscardModalOpen(true)
    } else {
      setEditModalOpen(false)
    }
  }

  const handleCloseQuantityModal = () => {
    if (hasQuantityChanges()) {
      setPendingCloseModal('quantity')
      setDiscardModalOpen(true)
    } else {
      setUpdateQuantityModalOpen(false)
    }
  }

  const handleCloseLocationModal = () => {
    if (hasLocationChanges()) {
      setPendingCloseModal('location')
      setDiscardModalOpen(true)
    } else {
      setMoveLocationModalOpen(false)
    }
  }

  const handleCloseIssueModal = () => {
    if (hasIssueChanges()) {
      setPendingCloseModal('issue')
      setDiscardModalOpen(true)
    } else {
      setReportIssueModalOpen(false)
    }
  }

  const handleCloseStockModal = () => {
    if (hasStockChanges()) {
      setPendingCloseModal('stock')
      setDiscardModalOpen(true)
    } else {
      setAddStockModalOpen(false)
    }
  }

  const handleCloseOutStockModal = () => {
    if (hasOutStockChanges()) {
      setPendingCloseModal('outstock')
      setDiscardModalOpen(true)
    } else {
      setOutStockModalOpen(false)
    }
  }

  const handleCloseAdjustmentModal = () => {
    if (hasAdjustmentChanges()) {
      setPendingCloseModal('adjustment')
      setDiscardModalOpen(true)
    } else {
      setAdjustQuantityModalOpen(false)
    }
  }

  const handleCloseTransferModal = () => {
    if (hasTransferChanges()) {
      setPendingCloseModal('transfer')
      setDiscardModalOpen(true)
    } else {
      setTransferStockModalOpen(false)
    }
  }

  // Confirm discard changes
  const handleDiscardChanges = () => {
    switch (pendingCloseModal) {
      case 'edit':
        resetEditForm()
        setEditModalOpen(false)
        break
      case 'quantity':
        resetQuantityForm()
        setUpdateQuantityModalOpen(false)
        break
      case 'location':
        resetLocationForm()
        setMoveLocationModalOpen(false)
        break
      case 'issue':
        resetIssueForm()
        setReportIssueModalOpen(false)
        break
      case 'stock':
        resetStockForm()
        setAddStockModalOpen(false)
        break
      case 'outstock':
        resetOutStockForm()
        setOutStockModalOpen(false)
        break
      case 'adjustment':
        resetAdjustmentForm()
        setAdjustQuantityModalOpen(false)
        break
      case 'transfer':
        resetTransferForm()
        setTransferStockModalOpen(false)
        break
    }
    setDiscardModalOpen(false)
    setPendingCloseModal(null)
  }

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

  const handleAddStock = () => {
    resetStockForm()
    setAddStockModalOpen(true)
  }

  const handleOutStock = () => {
    resetOutStockForm()
    setOutStockModalOpen(true)
  }

  const handleAdjustQuantity = () => {
    resetAdjustmentForm()
    setAdjustQuantityModalOpen(true)
  }

  const handleTransferStock = () => {
    resetTransferForm()
    setTransferStockModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!id) return

    // Check if there are actual changes
    if (!hasEditChanges()) {
      setEditModalOpen(false)
      return
    }

    try {
      setSaving(true)
      // Transform editForm: convert isInactive boolean to status value
      // If inactive, set status to 'inactive'. Otherwise, set to null to let DB trigger recalculate
      const { isInactive, ...formData } = editForm
      const submitData = {
        ...formData,
        status: isInactive ? 'inactive' : null
      }
      const response = await updateInventoryItem(id, submitData as any)
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

    // Check if quantity actually changed
    if (!hasQuantityChanges()) {
      setUpdateQuantityModalOpen(false)
      return
    }

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

    // Check if location actually changed (prevent moving to same location)
    if (!hasLocationChanges()) {
      setMoveLocationModalOpen(false)
      return
    }

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

  const handleStockSubmit = async () => {
    if (!id || !stockForm.location_id || stockForm.quantity <= 0) return

    try {
      setSaving(true)
      const response = await addDelivery(id, {
        location_id: stockForm.location_id,
        quantity: stockForm.quantity,
        reference_number: stockForm.reference_number || undefined,
        notes: stockForm.notes || undefined
      })
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        await fetchItemLocations()
        setAddStockModalOpen(false)
        resetStockForm()
      } else {
        setErrorMessage(response.error || 'Failed to add stock')
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      console.error('Error adding stock:', error)
      setErrorMessage(error?.response?.data?.error || 'Failed to add stock')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleOutStockSubmit = async () => {
    if (!id || !outStockForm.location_id || outStockForm.quantity <= 0) return

    try {
      setSaving(true)
      const response = await outStock(id, {
        location_id: outStockForm.location_id,
        quantity: outStockForm.quantity,
        reference_number: outStockForm.reference_number || undefined,
        notes: outStockForm.notes || undefined
      })
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        await fetchItemLocations()
        setOutStockModalOpen(false)
        resetOutStockForm()
      } else {
        setErrorMessage(response.error || 'Failed to remove stock')
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      console.error('Error removing stock:', error)
      setErrorMessage(error?.response?.data?.error || 'Failed to remove stock')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleAdjustmentSubmit = async () => {
    if (!id || !adjustmentForm.location_id || adjustmentForm.quantity === 0 || adjustmentForm.reason.length < 5) return

    try {
      setSaving(true)
      const response = await adjustQuantity(id, {
        location_id: adjustmentForm.location_id,
        quantity: adjustmentForm.quantity,
        reason: adjustmentForm.reason
      })
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        await fetchItemLocations()
        setAdjustQuantityModalOpen(false)
        resetAdjustmentForm()
      } else {
        setErrorMessage(response.error || 'Failed to adjust quantity')
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      console.error('Error adjusting quantity:', error)
      setErrorMessage(error?.response?.data?.error || 'Failed to adjust quantity')
      setErrorModalOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleTransferSubmit = async () => {
    if (!id || !transferForm.from_location_id || !transferForm.to_location_id || transferForm.quantity <= 0) return

    try {
      setSaving(true)
      const response = await transferStock(id, {
        from_location_id: transferForm.from_location_id,
        to_location_id: transferForm.to_location_id,
        quantity: transferForm.quantity,
        notes: transferForm.notes || undefined
      })
      if (response.success) {
        await fetchItem()
        await fetchActivities()
        await fetchItemLocations()
        setTransferStockModalOpen(false)
        resetTransferForm()
      } else {
        setErrorMessage(response.error || 'Failed to transfer stock')
        setErrorModalOpen(true)
      }
    } catch (error: any) {
      console.error('Error transferring stock:', error)
      setErrorMessage(error?.response?.data?.error || 'Failed to transfer stock')
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

        {/* Stock by Location Card */}
        <div className="mt-6">
          <LocationQuantitiesCard
            locations={itemLocations}
            loading={locationsLoading}
            totalDelivered={totalDelivered}
          />
        </div>

        {/* Reservations Card - only shown if there are reservations */}
        <ReservationsCard
          itemId={item.id}
          reservedQuantity={item.reserved_quantity || 0}
        />

        {/* Action Buttons */}
        <ActionButtons
          onEdit={handleEdit}
          onMoveLocation={handleMoveLocation}
          onReportIssue={handleReportIssue}
          onDelete={() => setDeleteModalOpen(true)}
          onAddStock={handleAddStock}
          onOutStock={handleOutStock}
          onAdjustQuantity={handleAdjustQuantity}
          onTransferStock={handleTransferStock}
          isAdmin={isAdmin || false}
          canEditInventory={canEditInventory}
          canDeleteInventory={canDeleteInventory}
        />

        {/* Activity History */}
        <ActivityHistoryCard activities={activities} />
      {/* Modals */}
      <EditItemModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        editForm={editForm}
        setEditForm={setEditForm}
        onSubmit={handleEditSubmit}
        saving={saving}
        currentStatus={item?.status || null}
      />

      <UpdateQuantityModal
        isOpen={updateQuantityModalOpen}
        onClose={handleCloseQuantityModal}
        quantityForm={quantityForm}
        setQuantityForm={setQuantityForm}
        onSubmit={handleQuantitySubmit}
        saving={saving}
      />

      <MoveLocationModal
        isOpen={moveLocationModalOpen}
        onClose={handleCloseLocationModal}
        locationForm={locationForm}
        setLocationForm={setLocationForm}
        onSubmit={handleLocationSubmit}
        saving={saving}
        availableLocations={availableLocations}
      />

      <ReportIssueModal
        isOpen={reportIssueModalOpen}
        onClose={handleCloseIssueModal}
        issueForm={issueForm}
        setIssueForm={setIssueForm}
        onSubmit={handleIssueSubmit}
        saving={saving}
        maxQuantity={item?.available_quantity || 0}
      />

      {/* Multi-warehouse Modals */}
      <AddStockModal
        isOpen={addStockModalOpen}
        onClose={handleCloseStockModal}
        stockForm={stockForm}
        setStockForm={setStockForm}
        onSubmit={handleStockSubmit}
        saving={saving}
        availableLocations={availableLocations}
      />

      <OutStockModal
        isOpen={outStockModalOpen}
        onClose={handleCloseOutStockModal}
        outStockForm={outStockForm}
        setOutStockForm={setOutStockForm}
        onSubmit={handleOutStockSubmit}
        saving={saving}
        availableLocations={availableLocations}
        itemLocations={itemLocations}
      />

      <AdjustQuantityModal
        isOpen={adjustQuantityModalOpen}
        onClose={handleCloseAdjustmentModal}
        adjustmentForm={adjustmentForm}
        setAdjustmentForm={setAdjustmentForm}
        onSubmit={handleAdjustmentSubmit}
        saving={saving}
        availableLocations={availableLocations}
        itemLocations={itemLocations}
      />

      <TransferStockModal
        isOpen={transferStockModalOpen}
        onClose={handleCloseTransferModal}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        onSubmit={handleTransferSubmit}
        saving={saving}
        availableLocations={availableLocations}
        itemLocations={itemLocations}
      />

      {/* Discard Changes Confirmation Modal */}
      <ConfirmationModal
        isOpen={discardModalOpen}
        onClose={() => {
          setDiscardModalOpen(false)
          setPendingCloseModal(null)
        }}
        onConfirm={handleDiscardChanges}
        type="warning"
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Keep Editing"
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