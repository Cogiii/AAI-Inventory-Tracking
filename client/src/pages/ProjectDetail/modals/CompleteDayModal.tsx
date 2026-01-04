import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  Loader2,
  Lock,
  ArrowRight,
  RotateCcw,
  AlertTriangle
} from 'lucide-react'
import { useCompleteProjectDay, useGetItemsForReconciliation } from '@/hooks/useProjectDetail'
import { useAuthContext } from '@/contexts/AuthContext'
import type { ReconciliationItem, ItemReconciliation } from '@/services/api/project-detail'

interface CompleteDayModalProps {
  isOpen: boolean
  day: any
  onClose: () => void
}

interface ReconciliationFormItem extends ReconciliationItem {
  returned_quantity_input: number
  damaged_quantity_input: number
  lost_quantity_input: number
}

const CompleteDayModal: FC<CompleteDayModalProps> = ({
  isOpen,
  day,
  onClose
}) => {
  const { user } = useAuthContext()
  const completeProjectDayMutation = useCompleteProjectDay()
  const getItemsForReconciliationMutation = useGetItemsForReconciliation()

  const [items, setItems] = useState<ReconciliationFormItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load items when modal opens
  useEffect(() => {
    if (isOpen && day?.id) {
      loadItems()
    }
  }, [isOpen, day?.id])

  const loadItems = async () => {
    if (!day?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const reconciliationItems = await getItemsForReconciliationMutation.mutateAsync(day.id)

      // Transform items to include input fields with default values
      const formItems: ReconciliationFormItem[] = reconciliationItems.map(item => ({
        ...item,
        // Default: return all allocated items (assuming none damaged/lost)
        returned_quantity_input: item.allocated_quantity - item.damaged_quantity - item.lost_quantity,
        damaged_quantity_input: item.damaged_quantity,
        lost_quantity_input: item.lost_quantity
      }))

      setItems(formItems)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load items for reconciliation')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'the selected date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const handleQuantityChange = (
    index: number,
    field: 'returned_quantity_input' | 'damaged_quantity_input' | 'lost_quantity_input',
    value: number
  ) => {
    setItems(prevItems => {
      const newItems = [...prevItems]
      newItems[index] = {
        ...newItems[index],
        [field]: Math.max(0, value)
      }
      return newItems
    })
  }

  // Validate that returned + damaged + lost = allocated for each item
  const validateReconciliation = (item: ReconciliationFormItem): { isValid: boolean; message?: string } => {
    const total = item.returned_quantity_input + item.damaged_quantity_input + item.lost_quantity_input
    if (total !== item.allocated_quantity) {
      return {
        isValid: false,
        message: `Total (${total}) must equal allocated (${item.allocated_quantity})`
      }
    }
    return { isValid: true }
  }

  const allItemsValid = items.every(item => validateReconciliation(item).isValid)

  const handleComplete = async () => {
    if (!allItemsValid || !day?.id) return

    const reconciliation: ItemReconciliation[] = items.map(item => ({
      project_item_id: item.project_item_id,
      returned_quantity: item.returned_quantity_input,
      damaged_quantity: item.damaged_quantity_input,
      lost_quantity: item.lost_quantity_input
    }))

    try {
      await completeProjectDayMutation.mutateAsync({
        projectDayId: day.id,
        reconciliation,
        recorded_by: user?.id
      })
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete project day')
    }
  }

  const handleClose = () => {
    setItems([])
    setError(null)
    onClose()
  }

  // Calculate summary
  const summary = {
    totalAllocated: items.reduce((sum, item) => sum + item.allocated_quantity, 0),
    totalReturned: items.reduce((sum, item) => sum + item.returned_quantity_input, 0),
    totalDamaged: items.reduce((sum, item) => sum + item.damaged_quantity_input, 0),
    totalLost: items.reduce((sum, item) => sum + item.lost_quantity_input, 0)
  }

  const hasNoItems = items.length === 0 && !isLoading

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Project Day"
      size="lg"
    >
      <ModalBody className="space-y-4">
        {/* Info Header */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm font-medium text-blue-900">
            Complete this day and reconcile all allocated items
          </p>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {formatDate(day?.project_date)}
            </p>
            {day?.location_name && (
              <p className="text-xs text-gray-600 mt-0.5">
                at {day.location_name}
              </p>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              This action cannot be undone
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Once completed, this project day will be locked. Items and personnel cannot be modified.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-600">Loading items for reconciliation...</p>
          </div>
        )}

        {/* No Items State */}
        {hasNoItems && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No items allocated to this day</p>
            <p className="text-sm mt-1">You can complete this day without item reconciliation.</p>
          </div>
        )}

        {/* Items Reconciliation Form */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Item Reconciliation</h3>
              <span className="text-xs text-gray-500">({items.length} items)</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto compact-scrollbar pr-1">
              {items.map((item, index) => {
                const validation = validateReconciliation(item)
                return (
                  <div
                    key={item.project_item_id}
                    className={`p-3 rounded-lg border ${
                      validation.isValid
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {item.item_name}
                          {item.brand_name && (
                            <span className="text-gray-500 ml-1">({item.brand_name})</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{item.item_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          Allocated: {item.allocated_quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Inputs */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Returned */}
                      <div>
                        <label className="block text-xs font-medium text-green-700 mb-1">
                          <RotateCcw className="h-3 w-3 inline mr-1" />
                          Returned
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.allocated_quantity}
                          value={item.returned_quantity_input}
                          onChange={(e) => handleQuantityChange(index, 'returned_quantity_input', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      {/* Damaged */}
                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Damaged
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.allocated_quantity}
                          value={item.damaged_quantity_input}
                          onChange={(e) => handleQuantityChange(index, 'damaged_quantity_input', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>

                      {/* Lost */}
                      <div>
                        <label className="block text-xs font-medium text-red-700 mb-1">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Lost
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.allocated_quantity}
                          value={item.lost_quantity_input}
                          onChange={(e) => handleQuantityChange(index, 'lost_quantity_input', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Validation Error */}
                    {!validation.isValid && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validation.message}
                      </p>
                    )}

                    {/* Item Total */}
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                      <span>Total accounted:</span>
                      <span className={`font-medium ${
                        validation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.returned_quantity_input + item.damaged_quantity_input + item.lost_quantity_input}
                        <ArrowRight className="h-3 w-3 inline mx-1" />
                        {item.allocated_quantity}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Reconciliation Summary</h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">Allocated</p>
                  <p className="text-lg font-semibold text-blue-600">{summary.totalAllocated}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-xs text-green-600">Returned</p>
                  <p className="text-lg font-semibold text-green-600">{summary.totalReturned}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-xs text-orange-600">Damaged</p>
                  <p className="text-lg font-semibold text-orange-600">{summary.totalDamaged}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-xs text-red-600">Lost</p>
                  <p className="text-lg font-semibold text-red-600">{summary.totalLost}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={completeProjectDayMutation.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleComplete}
          disabled={completeProjectDayMutation.isPending || (items.length > 0 && !allItemsValid) || isLoading}
          className={`flex-1 ${
            items.length > 0 && !allItemsValid
              ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {completeProjectDayMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Day
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default CompleteDayModal
