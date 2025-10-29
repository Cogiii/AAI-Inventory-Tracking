import { useState, useEffect } from 'react'
import type { FC, FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'

interface EditItemFormProps {
  isOpen: boolean
  item: any
  availableItems: any[]
  onSave: (item: any) => void
  onCancel: () => void
}

const EditItemForm: FC<EditItemFormProps> = ({ isOpen, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    allocated_quantity: item?.allocated_quantity || 0,
    damaged_quantity: item?.damaged_quantity || 0,
    lost_quantity: item?.lost_quantity || 0,
    returned_quantity: item?.returned_quantity || 0,
    status: item?.status || 'allocated'
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        allocated_quantity: item.allocated_quantity || 0,
        damaged_quantity: item.damaged_quantity || 0,
        lost_quantity: item.lost_quantity || 0,
        returned_quantity: item.returned_quantity || 0,
        status: item.status || 'allocated'
      })
    }
  }, [item])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const updatedItem = {
      ...item,
      ...formData,
      allocated_quantity: parseInt(formData.allocated_quantity.toString()),
      damaged_quantity: parseInt(formData.damaged_quantity.toString()),
      lost_quantity: parseInt(formData.lost_quantity.toString()),
      returned_quantity: parseInt(formData.returned_quantity.toString())
    }
    
    // Store pending data and show confirmation
    setPendingData(updatedItem)
    setShowConfirmation(true)
  }

  const handleConfirmedUpdate = () => {
    if (pendingData) {
      onSave(pendingData)
      setPendingData(null)
    }
  }

  if (!item) return null

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onCancel} 
        title={`Edit Item: ${item.item_name}`} 
        size="2xl"
      >
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Allocated Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.allocated_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, allocated_quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Returned Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.returned_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, returned_quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Damaged Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.damaged_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, damaged_quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lost Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lost_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, lost_quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="allocated">Allocated</option>
                <option value="in_use">In Use</option>
                <option value="partial_return">Partial Return</option>
                <option value="returned">Returned</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <ModalFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 hover:bg-blue-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Update Item
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false)
          setPendingData(null)
        }}
        onConfirm={handleConfirmedUpdate}
        type="update"
        title="Confirm Update Item"
        message={`Are you sure you want to update the quantities and status for "${item?.item_name}"? This action cannot be undone.`}
        confirmText="Update Item"
        cancelText="Cancel"
      />
    </>
  )
}

export default EditItemForm