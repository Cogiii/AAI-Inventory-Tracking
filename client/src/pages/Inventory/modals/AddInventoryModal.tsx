import { useState } from 'react'
import type { FC } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import BrandSelector from '@/components/ui/brand-selector'
import LocationSelector from '@/components/ui/location-selector'
import { Package, Loader2 } from 'lucide-react'
import { useCreateInventoryItem, useLocations } from '@/hooks/useInventory'
import { inventoryItemFormSchema, type InventoryItemFormData, type InventoryItemFormInput } from '@/schemas'

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddInventoryModal: FC<AddInventoryModalProps> = ({ isOpen, onClose }) => {
  const createItemMutation = useCreateInventoryItem()
  const { data: locationsResponse } = useLocations()

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<InventoryItemFormData | null>(null)

  // Get locations for the LocationSelector
  const locations = Array.isArray(locationsResponse?.data?.locations) ? locationsResponse.data.locations : []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm<InventoryItemFormInput, unknown, InventoryItemFormData>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      type: 'product',
      name: '',
      description: '',
      brand_id: '',
      warehouse_location_id: '',
      delivered_quantity: '',
      damaged_quantity: '',
      lost_quantity: '',
      available_quantity: ''
      // Note: status is NOT included - it will be auto-set by database trigger
    }
  })

  const watchedValues = watch()

  const handleFormSubmit = handleSubmit((data) => {
    setPendingData(data)
    setShowConfirmation(true)
  })

  const handleConfirmedAdd = async () => {
    if (!pendingData) return

    try {
      await createItemMutation.mutateAsync(pendingData)
      handleReset()
      onClose()
    } catch (error) {
      console.error('Error creating inventory item:', error)
      // Close confirmation modal on error so user can retry
      setShowConfirmation(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardConfirmation(true)
    } else {
      handleReset()
      onClose()
    }
  }

  const handleConfirmDiscard = () => {
    setShowDiscardConfirmation(false)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    reset()
    setShowConfirmation(false)
    setPendingData(null)
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !showConfirmation}
        onClose={handleCancel}
        title="Add Inventory Item"
        size="lg"
      >
        <form onSubmit={handleFormSubmit}>
          <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto modal-scrollbar">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="product">Product</option>
                <option value="material">Material</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Enter item name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Enter item description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Brand - Using BrandSelector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <Controller
                name="brand_id"
                control={control}
                render={({ field }) => (
                  <BrandSelector
                    value={field.value ? Number(field.value) : null}
                    onChange={(brandId) => {
                      // Convert to string for the form, or empty string if null
                      setValue('brand_id', brandId ? String(brandId) : '', { shouldDirty: true })
                    }}
                    placeholder="Search or select brand..."
                    allowCreate={true}
                  />
                )}
              />
              {errors.brand_id && (
                <p className="text-red-500 text-sm mt-1">{errors.brand_id.message}</p>
              )}
            </div>

            {/* Initial Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Quantity
              </label>
              <input
                type="number"
                {...register('delivered_quantity')}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Quantity received from delivery or purchase order
              </p>
              {errors.delivered_quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.delivered_quantity.message}</p>
              )}
            </div>

            {/* Warehouse Location - Using LocationSelector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location {Number(watchedValues.delivered_quantity) > 0 && <span className="text-red-500">*</span>}
              </label>
              <Controller
                name="warehouse_location_id"
                control={control}
                render={({ field }) => (
                  <LocationSelector
                    value={field.value ? Number(field.value) : null}
                    onChange={(locationId) => {
                      // Convert to string for the form, or empty string if null
                      setValue('warehouse_location_id', locationId ? String(locationId) : '', { shouldDirty: true })
                    }}
                    placeholder="Search or select location..."
                    allowCreate={true}
                    locations={locations}
                  />
                )}
              />
              {Number(watchedValues.delivered_quantity) > 0 && !watchedValues.warehouse_location_id && (
                <p className="text-amber-600 text-xs mt-1">
                  Location is required when adding initial quantity
                </p>
              )}
              {errors.warehouse_location_id && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse_location_id.message}</p>
              )}
            </div>

            {/* Status Info - Read Only */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Item status will be automatically calculated based on quantity (In Stock, Low Stock, or Out of Stock).
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createItemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createItemMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createItemMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="update"
        title="Add Inventory Item"
        message={`Are you sure you want to add "${watchedValues.name || 'this item'}" to the inventory?`}
        onConfirm={handleConfirmedAdd}
        onClose={() => setShowConfirmation(false)}
        confirmText={createItemMutation.isPending ? 'Adding...' : 'Add Item'}
        cancelText="Cancel"
      />

      {/* Discard Changes Confirmation */}
      <ConfirmationModal
        isOpen={showDiscardConfirmation}
        type="warning"
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={handleConfirmDiscard}
        onClose={() => setShowDiscardConfirmation(false)}
        confirmText="Discard"
        cancelText="Keep Editing"
      />
    </>
  )
}

export default AddInventoryModal
