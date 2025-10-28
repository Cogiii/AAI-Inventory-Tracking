import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import { ToggleLeft, ToggleRight, Plus, Minus, Package } from 'lucide-react'

interface AddItemFormProps {
  isOpen: boolean
  availableItems: any[]
  projectDays: any[]
  selectedDay: number | 'all'
  applyToAllDays: boolean
  setApplyToAllDays: (value: boolean) => void
  onSave: (item: any) => void
  onCancel: () => void
}

interface ItemRow {
  id: string
  item_id: string
  allocated_quantity: number
  status: string
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  isOpen,
  availableItems,
  applyToAllDays,
  setApplyToAllDays,
  onSave,
  onCancel
}) => {
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    {
      id: '1',
      item_id: '',
      allocated_quantity: 0,
      status: 'allocated'
    }
  ])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any[]>([])

  const addNewRow = () => {
    const newRow: ItemRow = {
      id: Date.now().toString(),
      item_id: '',
      allocated_quantity: 0,
      status: 'allocated'
    }
    setItemRows(prev => [...prev, newRow])
  }

  const removeRow = (rowId: string) => {
    if (itemRows.length > 1) {
      setItemRows(prev => prev.filter(row => row.id !== rowId))
    }
  }

  const updateRow = (rowId: string, field: keyof ItemRow, value: any) => {
    setItemRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all rows
    const validRows = itemRows.filter(row => row.item_id && row.allocated_quantity > 0)
    
    if (validRows.length === 0) {
      return
    }

    // Convert to items data
    const itemsData = validRows.map(row => {
      const selectedItem = availableItems.find(item => item.id.toString() === row.item_id)
      if (!selectedItem) return null

      return {
        ...row,
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        item_type: selectedItem.type,
        brand_name: selectedItem.brand,
        warehouse_location: `Warehouse ${selectedItem.brand} - Section 1`,
        allocated_quantity: parseInt(row.allocated_quantity.toString()),
        damaged_quantity: 0,
        lost_quantity: 0,
        returned_quantity: 0
      }
    }).filter(Boolean)

    if (itemsData.length > 0) {
      setPendingData(itemsData)
      setShowConfirmation(true)
    }
  }

  const handleConfirmedAdd = () => {
    if (pendingData.length > 0) {
      // If multiple items, call onSave for each item
      pendingData.forEach(item => {
        onSave(item)
      })
      
      // Reset form
      setItemRows([{
        id: '1',
        item_id: '',
        allocated_quantity: 0,
        status: 'allocated'
      }])
      setPendingData([])
    }
  }

  const handleCancel = () => {
    // Reset form on cancel
    setItemRows([{
      id: '1',
      item_id: '',
      allocated_quantity: 0,
      status: 'allocated'
    }])
    onCancel()
  }

  const getItemName = (itemId: string) => {
    const item = availableItems.find(item => item.id.toString() === itemId)
    return item ? item.name : ''
  }

  const isFormValid = itemRows.some(row => row.item_id && row.allocated_quantity > 0)

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCancel} title="Add New Items" size="4xl">
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">
                  Add Items to Schedule
                </span>
              </div>
              <Button
                type="button"
                onClick={addNewRow}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
            </div>

            {/* Items Grid */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {itemRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  {/* Row Number */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>

                  {/* Item Selection - Wider column for better readability */}
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Item
                    </label>
                    <select
                      value={row.item_id}
                      onChange={(e) => updateRow(row.id, 'item_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="">Choose an item...</option>
                      {availableItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.brand} ({item.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={row.allocated_quantity || ''}
                      onChange={(e) => updateRow(row.id, 'allocated_quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="allocated">Allocated</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-end justify-center">
                    {itemRows.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="p-3 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 transform hover:scale-110 transition-all duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Apply to All Days Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Apply to all project days
                </span>
                <span className="text-xs text-gray-500">
                  Add these items to every day in the project schedule
                </span>
              </div>
              <button
                type="button"
                onClick={() => setApplyToAllDays(!applyToAllDays)}
                className="flex items-center transition-colors duration-200"
              >
                {applyToAllDays ? (
                  <ToggleRight className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>

            {/* Summary */}
            {itemRows.some(row => row.item_id && row.allocated_quantity > 0) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Items to Add ({itemRows.filter(row => row.item_id && row.allocated_quantity > 0).length})
                </h4>
                <div className="space-y-1">
                  {itemRows
                    .filter(row => row.item_id && row.allocated_quantity > 0)
                    .map((row, index) => (
                      <div key={row.id} className="text-xs text-green-700">
                        {index + 1}. {getItemName(row.item_id)} - {row.allocated_quantity} units ({row.status})
                      </div>
                    ))}
                </div>
              </div>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              {itemRows.filter(row => row.item_id && row.allocated_quantity > 0).length} item(s) ready to add
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`px-4 py-2 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Add {itemRows.filter(row => row.item_id && row.allocated_quantity > 0).length} Item(s)
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirm Add Items"
        message={`Are you sure you want to add ${pendingData.length} item(s) to the project${applyToAllDays ? ' for all days' : ''}?`}
        onConfirm={handleConfirmedAdd}
        onClose={() => {
          setShowConfirmation(false)
          setPendingData([])
        }}
      />
    </>
  )
}

export default AddItemForm