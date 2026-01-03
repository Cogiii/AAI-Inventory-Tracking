import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface QuantityFormState {
  delivered_quantity: number
}

interface UpdateQuantityModalProps {
  isOpen: boolean
  onClose: () => void
  quantityForm: QuantityFormState
  setQuantityForm: React.Dispatch<React.SetStateAction<QuantityFormState>>
  onSubmit: () => void
  saving: boolean
}

const UpdateQuantityModal = ({
  isOpen,
  onClose,
  quantityForm,
  setQuantityForm,
  onSubmit,
  saving
}: UpdateQuantityModalProps) => {
  const handleNumberChange = (field: keyof QuantityFormState, value: string) => {
    const numValue = parseInt(value) || 0
    setQuantityForm(prev => ({ ...prev, [field]: Math.max(0, numValue) }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Delivered Quantity" size="sm">
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivered Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={quantityForm.delivered_quantity}
              onChange={(e) => handleNumberChange('delivered_quantity', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="0"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Available quantity will be updated automatically based on item usage and reported issues.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving}>
          {saving ? 'Updating...' : 'Update Quantity'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default UpdateQuantityModal