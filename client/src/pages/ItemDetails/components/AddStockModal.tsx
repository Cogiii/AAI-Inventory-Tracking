import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'
import type { Location } from '@/schemas'

export interface StockFormState {
  location_id: number | null
  quantity: number
  reference_number: string
  notes: string
}

interface AddStockModalProps {
  isOpen: boolean
  onClose: () => void
  stockForm: StockFormState
  setStockForm: React.Dispatch<React.SetStateAction<StockFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: Location[]
}

const AddStockModal = ({
  isOpen,
  onClose,
  stockForm,
  setStockForm,
  onSubmit,
  saving,
  availableLocations
}: AddStockModalProps) => {
  const handleNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setStockForm(prev => ({ ...prev, quantity: Math.max(0, numValue) }))
  }

  const handleTextChange = (field: 'reference_number' | 'notes', value: string) => {
    setStockForm(prev => ({ ...prev, [field]: value }))
  }

  const isValid = stockForm.location_id && stockForm.quantity > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Location *
            </label>
            <LocationSelector
              value={stockForm.location_id}
              onChange={(locationId) => setStockForm(prev => ({
                ...prev,
                location_id: locationId
              }))}
              placeholder="Select warehouse or office..."
              allowCreate={false}
              locations={availableLocations}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select the warehouse or office where stock will be added
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={stockForm.quantity || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter quantity to add"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={stockForm.reference_number}
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
              value={stockForm.notes}
              onChange={(e) => handleTextChange('notes', e.target.value)}
              rows={2}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Additional notes about this stock addition..."
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              This will increase the item's available quantity at the selected location.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving || !isValid}>
          {saving ? 'Adding...' : 'Add Stock'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default AddStockModal
