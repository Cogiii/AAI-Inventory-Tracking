import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface LocationFormState {
  warehouse_location_id: number | null
}

interface MoveLocationModalProps {
  isOpen: boolean
  onClose: () => void
  locationForm: LocationFormState
  setLocationForm: React.Dispatch<React.SetStateAction<LocationFormState>>
  onSubmit: () => void
  saving: boolean
  availableLocations: any[]
}

const MoveLocationModal = ({
  isOpen,
  onClose,
  locationForm,
  setLocationForm,
  onSubmit,
  saving,
  availableLocations
}: MoveLocationModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Item Location" size="md">
      <ModalBody>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Location *</label>
            <select
              value={locationForm.warehouse_location_id || ''}
              onChange={(e) => setLocationForm(prev => ({ 
                ...prev, 
                warehouse_location_id: e.target.value ? parseInt(e.target.value) : null 
              }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
            >
              <option value="">Select a location...</option>
              {availableLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.city}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Moving this item will update its warehouse location. 
              This action will be logged in the item's activity history.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={saving || !locationForm.warehouse_location_id}
        >
          {saving ? 'Moving...' : 'Move Item'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default MoveLocationModal