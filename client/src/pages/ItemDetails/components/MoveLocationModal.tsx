import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/ui/location-selector'

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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Location *</label>
            <LocationSelector
              value={locationForm.warehouse_location_id}
              onChange={(locationId) => setLocationForm(prev => ({
                ...prev,
                warehouse_location_id: locationId
              }))}
              placeholder="Search or select location..."
              allowCreate={true}
              locations={availableLocations}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
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