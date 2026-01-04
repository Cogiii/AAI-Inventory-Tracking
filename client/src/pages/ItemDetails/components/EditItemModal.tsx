import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

type ItemStatus = 'in stock' | 'out of stock' | 'low stock' | 'inactive'

interface EditFormState {
  name: string
  description: string
  type: 'product' | 'material'
  brand_id: number | null
  warehouse_location_id: number | null
  isInactive: boolean
}

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  editForm: EditFormState
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>
  onSubmit: () => void
  saving: boolean
  currentStatus: ItemStatus | null  // The actual current status from the database
}

// Helper functions for status display
const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'out of stock':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'low stock':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'in stock':
    default:
      return 'bg-green-100 text-green-800 border-green-200'
  }
}

const getStatusText = (status: string | null) => {
  switch (status) {
    case 'out of stock':
      return 'Out of Stock'
    case 'low stock':
      return 'Low Stock'
    case 'inactive':
      return 'Inactive'
    case 'in stock':
    default:
      return 'In Stock'
  }
}

const EditItemModal = ({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  onSubmit,
  saving,
  currentStatus
}: EditItemModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
      <ModalBody>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter item name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as 'product' | 'material' }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
            >
              <option value="product">Product</option>
              <option value="material">Material</option>
            </select>
          </div>

          {/* Status Display (Read-only) + Inactive Toggle Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              {/* Current Status Display */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(editForm.isInactive ? 'inactive' : currentStatus)}`}>
                  {currentStatus === 'low stock' && !editForm.isInactive && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {getStatusText(editForm.isInactive ? 'inactive' : currentStatus)}
                </span>
                {!editForm.isInactive && (
                  <span className="text-sm text-gray-500">
                    (auto-calculated from quantity)
                  </span>
                )}
              </div>

              {/* Inactive Toggle Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-700">Mark as Inactive</span>
                  <p className="text-xs text-gray-500">Inactive items are hidden from normal inventory views</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editForm.isInactive}
                  onClick={() => setEditForm(prev => ({ ...prev, isInactive: !prev.isInactive }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    editForm.isInactive ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      editForm.isInactive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving || !editForm.name.trim()}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default EditItemModal