import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'
import type { Location } from '@/schemas'
import type { ItemLocation } from '@/services/api/inventory'

export interface TransferFormState {
  from_location_id: number | null
  to_location_id: number | null
  quantity: number
  notes: string
}

interface TransferStockModalProps {
  isOpen: boolean
  onClose: () => void
  transferForm: TransferFormState
  setTransferForm: React.Dispatch<React.SetStateAction<TransferFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: Location[]
  itemLocations: ItemLocation[]
}

const TransferStockModal = ({
  isOpen,
  onClose,
  transferForm,
  setTransferForm,
  onSubmit,
  saving,
  availableLocations,
  itemLocations
}: TransferStockModalProps) => {
  const handleNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setTransferForm(prev => ({ ...prev, quantity: Math.max(0, numValue) }))
  }

  // Get current quantity at source location
  const sourceLocation = itemLocations.find(loc => loc.location_id === transferForm.from_location_id)
  const availableAtSource = sourceLocation?.available_quantity || 0

  // Filter locations that have stock for source dropdown
  const locationsWithStock = availableLocations.filter(loc =>
    itemLocations.some(il => il.location_id === loc.id && il.available_quantity > 0)
  )

  // Filter out source location from destination options
  const destinationLocations = availableLocations.filter(
    loc => loc.id !== transferForm.from_location_id
  )

  const isValid =
    transferForm.from_location_id &&
    transferForm.to_location_id &&
    transferForm.quantity > 0 &&
    transferForm.quantity <= availableAtSource

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Stock" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Location *
            </label>
            <LocationSelector
              value={transferForm.from_location_id}
              onChange={(locationId) => setTransferForm(prev => ({
                ...prev,
                from_location_id: locationId,
                // Reset destination if same as new source
                to_location_id: prev.to_location_id === locationId ? null : prev.to_location_id
              }))}
              placeholder="Select source location..."
              allowCreate={false}
              locations={locationsWithStock}
            />
            {sourceLocation && (
              <p className="mt-1 text-xs text-gray-500">
                Available to transfer: {sourceLocation.available_quantity} units
                {sourceLocation.reserved_quantity > 0 && (
                  <span className="text-amber-600"> ({sourceLocation.reserved_quantity} reserved, cannot transfer)</span>
                )}
              </p>
            )}
            {locationsWithStock.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No locations have available stock to transfer
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Location *
            </label>
            <LocationSelector
              value={transferForm.to_location_id}
              onChange={(locationId) => setTransferForm(prev => ({
                ...prev,
                to_location_id: locationId
              }))}
              placeholder="Select destination location..."
              allowCreate={true}
              locations={destinationLocations}
              disabled={!transferForm.from_location_id}
            />
            {!transferForm.from_location_id && (
              <p className="mt-1 text-xs text-gray-500">
                Select a source location first
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
              max={availableAtSource}
              value={transferForm.quantity || ''}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter quantity to transfer"
              disabled={!transferForm.from_location_id}
            />
            {transferForm.from_location_id && transferForm.quantity > availableAtSource && (
              <p className="mt-1 text-xs text-red-500">
                Cannot transfer more than {availableAtSource} available units
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={transferForm.notes}
              onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Optional notes about this transfer..."
            />
          </div>

          {isValid && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Transfer Summary:</strong>
                <br />
                Moving {transferForm.quantity} unit(s) from{' '}
                <span className="font-medium">{sourceLocation?.location_name}</span> to{' '}
                <span className="font-medium">
                  {destinationLocations.find(l => l.id === transferForm.to_location_id)?.name}
                </span>
              </p>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving || !isValid}>
          {saving ? 'Transferring...' : 'Transfer Stock'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default TransferStockModal
