import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal, ItemSelector } from '@/components/ui'
import { ToggleLeft, ToggleRight, Plus, Minus, Package, Loader2, AlertTriangle } from 'lucide-react'
import { useAddProjectItems } from '@/hooks/useInventory'

interface AddItemFormProps {
  isOpen: boolean
  joNumber: string
  projectDays: any[]
  selectedDay: number | 'all'
  applyToAllDays: boolean
  setApplyToAllDays: (value: boolean) => void
  onCancel: () => void
}

interface ItemRow {
  id: string
  item_id: number | null
  allocated_quantity: number
  selectedItem: any
  availableQuantity: number
  quantityError: string
}

const AddItemForm: FC<AddItemFormProps> = ({
  isOpen,
  joNumber,
  projectDays,
  selectedDay,
  applyToAllDays,
  setApplyToAllDays,
  onCancel
}) => {
  const addProjectItemsMutation = useAddProjectItems()
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    {
      id: '1',
      item_id: null,
      allocated_quantity: 0,
      selectedItem: null,
      availableQuantity: 0,
      quantityError: ''
    }
  ])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any[]>([])

  const addNewRow = () => {
    const newRow: ItemRow = {
      id: Date.now().toString(),
      item_id: null,
      allocated_quantity: 0,
      selectedItem: null,
      availableQuantity: 0,
      quantityError: ''
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

  const validateQuantity = (rowId: string, allocatedQty: number, availableQty: number) => {
    let error = ''
    
    if (allocatedQty <= 0) {
      error = 'Quantity must be greater than 0'
    } else if (allocatedQty > availableQty) {
      error = `Exceeds available quantity (${availableQty})`
    }
    
    updateRow(rowId, 'quantityError', error)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Validate all rows
    const validRows = itemRows.filter(row => 
      row.item_id && 
      row.allocated_quantity > 0 && 
      !row.quantityError &&
      row.selectedItem
    )
    
    if (validRows.length === 0) {
      return
    }

    // Convert to items data
    const itemsData = validRows.map(row => ({
      item_id: row.item_id!,
      allocated_quantity: row.allocated_quantity,
      status: 'allocated' // Default status
    }))

    setPendingData(itemsData)
    setShowConfirmation(true)
  }

  const handleConfirmedAdd = async () => {
    if (pendingData.length === 0) return

    try {
      // Determine target project day IDs
      const targetProjectDayIds = applyToAllDays 
        ? projectDays.map(day => day.id)
        : selectedDay === 'all' 
          ? projectDays.map(day => day.id)
          : [selectedDay as number]

      await addProjectItemsMutation.mutateAsync({
        joNumber,
        project_day_ids: targetProjectDayIds,
        item_assignments: pendingData
      })
      
      // Reset form
      setItemRows([{
        id: '1',
        item_id: null,
        allocated_quantity: 0,
        selectedItem: null,
        availableQuantity: 0,
        quantityError: ''
      }])
      setPendingData([])
      setShowConfirmation(false)
      onCancel()
    } catch (error) {
      console.error('Error adding items:', error)
      // Keep confirmation modal open to allow retry
    }
  }

  const handleCancel = () => {
    // Reset form on cancel
    setItemRows([{
      id: '1',
      item_id: null,
      allocated_quantity: 0,
      selectedItem: null,
      availableQuantity: 0,
      quantityError: ''
    }])
    onCancel()
  }

  const getItemName = (item: any) => {
    return item ? item.name : ''
  }

  const isFormValid = itemRows.some(row => 
    row.item_id && 
    row.allocated_quantity > 0 && 
    !row.quantityError &&
    row.selectedItem
  )

  return (
    <>
      <Modal isOpen={isOpen && !showConfirmation} onClose={handleCancel} title="Add New Items" size="4xl">
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
                    <ItemSelector
                      value={row.item_id}
                      joNumber={joNumber}
                      onChange={(itemId, itemData) => {
                        updateRow(row.id, 'item_id', itemId)
                        updateRow(row.id, 'selectedItem', itemData)
                        updateRow(row.id, 'availableQuantity', itemData?.available_quantity || 0)
                        updateRow(row.id, 'quantityError', '')
                        
                        // Validate current allocated quantity against new item
                        if (row.allocated_quantity > 0) {
                          setTimeout(() => validateQuantity(row.id, row.allocated_quantity, itemData?.available_quantity || 0), 0)
                        }
                      }}
                      placeholder="Search and select an item..."
                      className="w-full"
                    />
                  </div>

                  {/* Allocated Quantity */}
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allocated Quantity
                    </label>
                    <div className="space-y-1">
                      <input
                        type="number"
                        min="1"
                        max={row.availableQuantity}
                        value={row.allocated_quantity || ''}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0
                          updateRow(row.id, 'allocated_quantity', quantity)
                          validateQuantity(row.id, quantity, row.availableQuantity)
                        }}
                        className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
                          row.quantityError
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="0"
                        disabled={!row.selectedItem}
                      />
                      {row.selectedItem && (
                        <div className="text-xs text-gray-500">
                          Available: {row.availableQuantity}
                        </div>
                      )}
                      {row.quantityError && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {row.quantityError}
                        </div>
                      )}
                    </div>
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
            {itemRows.some(row => row.item_id && row.allocated_quantity > 0 && !row.quantityError) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Items to Add ({itemRows.filter(row => row.item_id && row.allocated_quantity > 0 && !row.quantityError).length})
                </h4>
                <div className="space-y-1">
                  {itemRows
                    .filter(row => row.item_id && row.allocated_quantity > 0 && !row.quantityError)
                    .map((row, index) => (
                      <div key={row.id} className="text-xs text-green-700">
                        {index + 1}. {getItemName(row.selectedItem)} - {row.allocated_quantity} units (allocated)
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
              {itemRows.filter(row => row.item_id && row.allocated_quantity > 0 && !row.quantityError).length} item(s) ready to add
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel}
                disabled={addProjectItemsMutation.isPending}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || addProjectItemsMutation.isPending}
                className={`px-4 py-2 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
                  isFormValid && !addProjectItemsMutation.isPending
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {addProjectItemsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  `Add ${itemRows.filter(row => row.item_id && row.allocated_quantity > 0 && !row.quantityError).length} Item(s)`
                )}
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
