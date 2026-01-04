import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'
import type { Location } from '@/schemas'
import type { ItemLocation } from '@/services/api/inventory'

export interface AdjustmentFormState {
  location_id: number | null
  quantity: number
  reason: string
}

interface AdjustQuantityModalProps {
  isOpen: boolean
  onClose: () => void
  adjustmentForm: AdjustmentFormState
  setAdjustmentForm: React.Dispatch<React.SetStateAction<AdjustmentFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: Location[]
  itemLocations: ItemLocation[]
}

const AdjustQuantityModal = ({
  isOpen,
  onClose,
  adjustmentForm,
  setAdjustmentForm,
  onSubmit,
  saving,
  availableLocations,
  itemLocations
}: AdjustQuantityModalProps) => {
  const handleNumberChange = (value: string) => {
    // Allow negative numbers for adjustments
    const numValue = parseInt(value) || 0
    setAdjustmentForm(prev => ({ ...prev, quantity: numValue }))
  }

  const handleTextChange = (value: string) => {
    setAdjustmentForm(prev => ({ ...prev, reason: value }))
  }

  // Get current quantity at selected location
  const selectedLocation = itemLocations.find(loc => loc.location_id === adjustmentForm.location_id)
  const currentQuantity = selectedLocation?.available_quantity || 0
  const newQuantity = currentQuantity + adjustmentForm.quantity

  const isValid =
    adjustmentForm.location_id &&
    adjustmentForm.quantity !== 0 &&
    adjustmentForm.reason.trim().length >= 5 &&
    newQuantity >= 0

  const adjustmentType = adjustmentForm.quantity > 0 ? 'increase' : adjustmentForm.quantity < 0 ? 'decrease' : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock Quantity" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">Admin Action</p>
            <p className="text-sm text-amber-700 mt-1">
              Use this for inventory corrections, audits, or discrepancies. A reason is required for accountability.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <LocationSelector
              value={adjustmentForm.location_id}
              onChange={(locationId) => setAdjustmentForm(prev => ({
                ...prev,
                location_id: locationId
              }))}
              placeholder="Select location to adjust..."
              allowCreate={false}
              locations={availableLocations}
            />
            {selectedLocation && (
              <p className="mt-1 text-xs text-gray-500">
                Current available at this location: {selectedLocation.available_quantity} units
                {selectedLocation.reserved_quantity > 0 && (
                  <span className="text-amber-600"> ({selectedLocation.reserved_quantity} reserved)</span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Quantity *
            </label>
            <input
              type="number"
              value={adjustmentForm.quantity || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter positive or negative value"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use positive numbers to increase, negative to decrease
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={adjustmentForm.reason}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Explain why this adjustment is needed (min 5 characters)..."
            />
            {adjustmentForm.reason.length > 0 && adjustmentForm.reason.length < 5 && (
              <p className="mt-1 text-xs text-red-500">Reason must be at least 5 characters</p>
            )}
          </div>

          {adjustmentType && adjustmentForm.location_id && (
            <div className={`p-3 rounded-lg border ${
              adjustmentType === 'increase'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                adjustmentType === 'increase' ? 'text-green-800' : 'text-red-800'
              }`}>
                Preview
              </p>
              <p className={`text-sm mt-1 ${
                adjustmentType === 'increase' ? 'text-green-700' : 'text-red-700'
              }`}>
                {adjustmentType === 'increase' ? 'Increasing' : 'Decreasing'} by {Math.abs(adjustmentForm.quantity)} units
                <br />
                Available: {currentQuantity} → {newQuantity >= 0 ? newQuantity : <span className="text-red-600 font-medium">Invalid (negative)</span>}
              </p>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={saving || !isValid}
          variant={adjustmentType === 'decrease' ? 'danger' : 'default'}
        >
          {saving ? 'Adjusting...' : 'Apply Adjustment'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default AdjustQuantityModal
