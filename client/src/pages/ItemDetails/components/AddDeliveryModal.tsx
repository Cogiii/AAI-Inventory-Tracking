import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'
import type { Location } from '@/schemas'

export interface DeliveryFormState {
  location_id: number | null
  quantity: number
  reference_number: string
  notes: string
}

interface AddDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  deliveryForm: DeliveryFormState
  setDeliveryForm: React.Dispatch<React.SetStateAction<DeliveryFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: Location[]
}

const AddDeliveryModal = ({
  isOpen,
  onClose,
  deliveryForm,
  setDeliveryForm,
  onSubmit,
  saving,
  availableLocations
}: AddDeliveryModalProps) => {
  const handleNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setDeliveryForm(prev => ({ ...prev, quantity: Math.max(0, numValue) }))
  }

  const handleTextChange = (field: 'reference_number' | 'notes', value: string) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }))
  }

  const isValid = deliveryForm.location_id && deliveryForm.quantity > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Delivery" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Location *
            </label>
            <LocationSelector
              value={deliveryForm.location_id}
              onChange={(locationId) => setDeliveryForm(prev => ({
                ...prev,
                location_id: locationId
              }))}
              placeholder="Select warehouse or office..."
              allowCreate={false}
              locations={availableLocations}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select the warehouse or office where items were delivered
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={deliveryForm.quantity || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter quantity received"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={deliveryForm.reference_number}
              onChange={(e) => handleTextChange('reference_number', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="PO number, delivery receipt, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={deliveryForm.notes}
              onChange={(e) => handleTextChange('notes', e.target.value)}
              rows={2}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Additional notes about this delivery..."
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              This delivery will increase the item's available quantity at the selected location.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving || !isValid}>
          {saving ? 'Adding...' : 'Add Delivery'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default AddDeliveryModal
