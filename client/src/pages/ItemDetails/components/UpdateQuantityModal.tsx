import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

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
    <Modal isOpen={isOpen} onClose={onClose} title="Update Delivered Quantity" size="md">
      <ModalBody>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-blue-900">Update Delivered Quantity</h3>
            </div>
            
            <p className="text-blue-700 text-sm mb-4">
              Update the total number of items delivered to your facility. Other quantities (available, damaged, lost) 
              are managed through separate actions like "Report Issue".
            </p>

            <label className="block text-sm font-medium text-blue-700 mb-2">
              Delivered Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={quantityForm.delivered_quantity}
              onChange={(e) => handleNumberChange('delivered_quantity', e.target.value)}
              className="block w-full rounded-lg border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 px-4 py-4 text-center text-2xl font-bold text-blue-900 bg-white"
              placeholder="0"
            />
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">📋 Note</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Delivered Quantity:</strong> Total items received at your facility</p>
              <p>• <strong>Available Quantity:</strong> Updated automatically when items are used/issued</p>
              <p>• <strong>Damaged/Lost:</strong> Use "Report Issue" button to record problems</p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Package className="h-4 w-4 mr-2" />
          {saving ? 'Updating...' : 'Update Delivered Quantity'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default UpdateQuantityModal