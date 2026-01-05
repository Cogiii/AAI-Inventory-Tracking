import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'
import type { Location } from '@/schemas'
import type { ItemLocation } from '@/services/api/inventory'

export interface OutStockFormState {
  location_id: number | null
  quantity: number
  reference_number: string
  notes: string
}

interface OutStockModalProps {
  isOpen: boolean
  onClose: () => void
  outStockForm: OutStockFormState
  setOutStockForm: React.Dispatch<React.SetStateAction<OutStockFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: Location[]
  itemLocations: ItemLocation[]
}

const OutStockModal = ({
  isOpen,
  onClose,
  outStockForm,
  setOutStockForm,
  onSubmit,
  saving,
  availableLocations,
  itemLocations
}: OutStockModalProps) => {
  const handleNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setOutStockForm(prev => ({ ...prev, quantity: Math.max(0, numValue) }))
  }

  const handleTextChange = (field: 'reference_number' | 'notes', value: string) => {
    setOutStockForm(prev => ({ ...prev, [field]: value }))
  }

  // Get current quantity at selected location
  const selectedLocation = itemLocations.find(loc => loc.location_id === outStockForm.location_id)
  const availableAtLocation = selectedLocation?.available_quantity || 0
  const newQuantity = availableAtLocation - outStockForm.quantity

  // Filter locations to only show those with stock
  const locationsWithStock = availableLocations.filter(loc => {
    const itemLoc = itemLocations.find(il => il.location_id === loc.id)
    return itemLoc && itemLoc.available_quantity > 0
  })

  const isValid =
    outStockForm.location_id &&
    outStockForm.quantity > 0 &&
    outStockForm.quantity <= availableAtLocation

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Out Stock" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">Return Stock to Client</p>
            <p className="text-sm text-orange-700 mt-1">
              Use this to record excess products being returned to the client.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Location *
            </label>
            <LocationSelector
              value={outStockForm.location_id}
              onChange={(locationId) => setOutStockForm(prev => ({
                ...prev,
                location_id: locationId
              }))}
              placeholder="Select location to remove stock from..."
              allowCreate={false}
              locations={locationsWithStock.length > 0 ? locationsWithStock : availableLocations}
            />
            {selectedLocation && (
              <p className="mt-1 text-xs text-gray-500">
                Available at this location: <span className="font-medium">{selectedLocation.available_quantity}</span> units
                {selectedLocation.reserved_quantity > 0 && (
                  <span className="text-amber-600"> ({selectedLocation.reserved_quantity} reserved)</span>
                )}
              </p>
            )}
            {locationsWithStock.length === 0 && (
              <p className="mt-1 text-xs text-red-500">
                No locations have available stock to remove
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={availableAtLocation}
              value={outStockForm.quantity || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter quantity to remove"
            />
            {outStockForm.quantity > availableAtLocation && selectedLocation && (
              <p className="mt-1 text-xs text-red-500">
                Cannot exceed available quantity ({availableAtLocation} units)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={outStockForm.reference_number}
              onChange={(e) => handleTextChange('reference_number', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Return receipt, document number, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={outStockForm.notes}
              onChange={(e) => handleTextChange('notes', e.target.value)}
              rows={2}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Reason for return or additional notes..."
            />
          </div>

          {outStockForm.location_id && outStockForm.quantity > 0 && outStockForm.quantity <= availableAtLocation && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">Preview</p>
              <p className="text-sm text-red-700 mt-1">
                Removing {outStockForm.quantity} units from stock
                <br />
                Available: {availableAtLocation} → {newQuantity}
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
          variant="danger"
        >
          {saving ? 'Processing...' : 'Remove Stock'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default OutStockModal
