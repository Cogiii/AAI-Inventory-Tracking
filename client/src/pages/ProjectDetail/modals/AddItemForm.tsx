import { useState, useEffect } from 'react'
import type { FC, FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal, ItemSelector } from '@/components/ui'
import { Package, Loader2, AlertTriangle, Calendar, Check, X, Edit2, PackageCheck, CalendarPlus, MapPin } from 'lucide-react'
import { useAddProjectItems } from '@/hooks/useInventory'
import { getItemLocations, type ItemLocation } from '@/services/api/inventory'

interface AddItemFormProps {
  isOpen: boolean
  joNumber: string
  projectDays: any[]
  selectedDay: number | 'all'
  applyToAllDays: boolean
  setApplyToAllDays: (value: boolean) => void
  onCancel: () => void
  onOpenAddDay?: () => void
}

interface AddedItem {
  id: string
  item_id: number
  allocated_quantity: number
  item_name: string
  item_type: string
  brand_name: string
  available_quantity: number
  isEditing: boolean
  quantityError: string
  source_location_id: number | null
  source_location_name: string | null
  locations: ItemLocation[]
}

const AddItemForm: FC<AddItemFormProps> = ({
  isOpen,
  joNumber,
  projectDays,
  selectedDay,
  applyToAllDays,
  setApplyToAllDays,
  onCancel,
  onOpenAddDay
}) => {
  const addProjectItemsMutation = useAddProjectItems()
  
  // State for added items list
  const [addedItems, setAddedItems] = useState<AddedItem[]>([])
  
  // State for current input selection
  const [currentItemId, setCurrentItemId] = useState<number | null>(null)
  const [currentItemData, setCurrentItemData] = useState<any>(null)
  const [currentQuantity, setCurrentQuantity] = useState<number>(0)
  const [currentQuantityError, setCurrentQuantityError] = useState<string>('')
  const [currentItemLocations, setCurrentItemLocations] = useState<ItemLocation[]>([])
  const [currentLocationId, setCurrentLocationId] = useState<number | null>(null)
  const [loadingLocations, setLoadingLocations] = useState(false)
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any[]>([])
  
  // State for selected project days
  const [selectedProjectDays, setSelectedProjectDays] = useState<Set<number>>(new Set())
  const [applyToAll, setApplyToAll] = useState(false)

  // Initialize selected days when modal opens
  useEffect(() => {
    if (isOpen && projectDays.length > 0) {
      if (applyToAllDays) {
        // If coming from "apply to all days", select all
        setSelectedProjectDays(new Set(projectDays.map(day => day.id)))
        setApplyToAll(true)
      } else if (selectedDay !== 'all' && typeof selectedDay === 'number') {
        // If a specific day was selected, only select that one
        setSelectedProjectDays(new Set([selectedDay]))
        setApplyToAll(false)
      } else {
        // Default: select all days
        setSelectedProjectDays(new Set(projectDays.map(day => day.id)))
        setApplyToAll(true)
      }
    }
  }, [isOpen, projectDays, selectedDay, applyToAllDays])

  // Toggle individual day selection
  const toggleDaySelection = (dayId: number) => {
    setSelectedProjectDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dayId)) {
        newSet.delete(dayId)
      } else {
        newSet.add(dayId)
      }
      
      // Update "apply to all" based on selection
      setApplyToAll(newSet.size === projectDays.length)
      
      return newSet
    })
  }

  // Toggle apply to all days
  const toggleApplyToAll = () => {
    if (applyToAll) {
      // Uncheck all
      setSelectedProjectDays(new Set())
      setApplyToAll(false)
    } else {
      // Check all
      setSelectedProjectDays(new Set(projectDays.map(day => day.id)))
      setApplyToAll(true)
    }
  }

  // Fetch item locations when item is selected
  const fetchItemLocations = async (itemId: number) => {
    try {
      setLoadingLocations(true)
      const response = await getItemLocations(itemId)
      if (response.success) {
        setCurrentItemLocations(response.data.locations)
        // Auto-select the location with the most available quantity
        if (response.data.locations.length > 0) {
          const bestLocation = response.data.locations.reduce((prev, current) =>
            (current.available_quantity > prev.available_quantity) ? current : prev
          )
          setCurrentLocationId(bestLocation.location_id)
        } else {
          setCurrentLocationId(null)
        }
      }
    } catch (error) {
      console.error('Error fetching item locations:', error)
      setCurrentItemLocations([])
    } finally {
      setLoadingLocations(false)
    }
  }

  // Get current available quantity based on selected location
  const getCurrentAvailableQuantity = () => {
    if (currentLocationId) {
      const location = currentItemLocations.find(loc => loc.location_id === currentLocationId)
      return location?.available_quantity || 0
    }
    return currentItemData?.available_quantity || 0
  }

  // Validate quantity for a single day
  const validateQuantity = (quantity: number, availableQty: number) => {
    if (quantity <= 0) {
      return 'Quantity must be greater than 0'
    } else if (quantity > availableQty) {
      return `Exceeds available quantity (${availableQty})`
    }
    return ''
  }

  // Validate total quantity across all selected days
  const validateTotalQuantity = (quantity: number, availableQty: number, numDays: number) => {
    const totalNeeded = quantity * numDays
    if (totalNeeded > availableQty) {
      return {
        isValid: false,
        message: `Total quantity needed (${quantity} × ${numDays} days = ${totalNeeded}) exceeds available quantity (${availableQty})`,
        totalNeeded,
        available: availableQty
      }
    }
    return { isValid: true, message: '', totalNeeded, available: availableQty }
  }

  // Check if all added items have valid total quantities for selected days
  const getTotalQuantityWarnings = () => {
    if (selectedProjectDays.size <= 1) return []

    return addedItems
      .map(item => {
        const validation = validateTotalQuantity(
          item.allocated_quantity,
          item.available_quantity,
          selectedProjectDays.size
        )
        if (!validation.isValid) {
          return {
            itemName: item.item_name,
            ...validation
          }
        }
        return null
      })
      .filter(Boolean)
  }

  const totalQuantityWarnings = getTotalQuantityWarnings()

  // Add item to the list
  const handleAddItem = () => {
    if (!currentItemId || !currentItemData || currentQuantity <= 0) {
      return
    }

    const availableQty = getCurrentAvailableQuantity()
    const error = validateQuantity(currentQuantity, availableQty)
    if (error) {
      setCurrentQuantityError(error)
      return
    }

    const selectedLocation = currentItemLocations.find(loc => loc.location_id === currentLocationId)

    const newItem: AddedItem = {
      id: Date.now().toString(),
      item_id: currentItemId,
      allocated_quantity: currentQuantity,
      item_name: currentItemData.name,
      item_type: currentItemData.type,
      brand_name: currentItemData.brand_name || 'N/A',
      available_quantity: availableQty,
      isEditing: false,
      quantityError: '',
      source_location_id: currentLocationId,
      source_location_name: selectedLocation?.location_name || null,
      locations: currentItemLocations
    }

    setAddedItems(prev => [...prev, newItem])

    // Clear current selection
    setCurrentItemId(null)
    setCurrentItemData(null)
    setCurrentQuantity(0)
    setCurrentQuantityError('')
    setCurrentItemLocations([])
    setCurrentLocationId(null)
  }

  // Remove item from the list
  const handleRemoveItem = (id: string) => {
    setAddedItems(prev => prev.filter(item => item.id !== id))
  }

  // Toggle edit mode for an item
  const handleToggleEdit = (id: string) => {
    setAddedItems(prev => prev.map(item => 
      item.id === id ? { ...item, isEditing: !item.isEditing } : item
    ))
  }

  // Update quantity for an item
  const handleUpdateQuantity = (id: string, quantity: number) => {
    const item = addedItems.find(i => i.id === id)
    if (!item) return

    const error = validateQuantity(quantity, item.available_quantity)
    
    setAddedItems(prev => prev.map(i => 
      i.id === id ? { 
        ...i, 
        allocated_quantity: quantity, 
        quantityError: error,
        isEditing: error ? true : false
      } : i
    ))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (addedItems.length === 0) {
      return
    }

    // Check for any quantity errors
    const hasErrors = addedItems.some(item => item.quantityError)
    if (hasErrors) {
      return
    }

    // Convert to items data with source_location_id
    const itemsData = addedItems.map(item => ({
      item_id: item.item_id,
      allocated_quantity: item.allocated_quantity,
      status: 'allocated',
      source_location_id: item.source_location_id
    }))

    setPendingData(itemsData)
    setShowConfirmation(true)
  }

  const handleConfirmedAdd = async () => {
    if (pendingData.length === 0 || selectedProjectDays.size === 0) return

    try {
      await addProjectItemsMutation.mutateAsync({
        joNumber,
        project_day_ids: Array.from(selectedProjectDays),
        item_assignments: pendingData
      })
      
      // Reset form
      setAddedItems([])
      setCurrentItemId(null)
      setCurrentItemData(null)
      setCurrentQuantity(0)
      setCurrentQuantityError('')
      setSelectedProjectDays(new Set())
      setApplyToAll(false)
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
    setAddedItems([])
    setCurrentItemId(null)
    setCurrentItemData(null)
    setCurrentQuantity(0)
    setCurrentQuantityError('')
    setCurrentItemLocations([])
    setCurrentLocationId(null)
    onCancel()
  }

  const hasQuantityErrors = addedItems.some(item => item.quantityError)
  const hasTotalQuantityWarnings = totalQuantityWarnings.length > 0
  const isFormValid = addedItems.length > 0 && selectedProjectDays.size > 0 && !hasQuantityErrors && !hasTotalQuantityWarnings

  // Require location selection if item has locations in warehouse
  const locationRequired = currentItemLocations.length > 0
  const canAddCurrent = currentItemId && currentItemData && currentQuantity > 0 && !currentQuantityError &&
    (!locationRequired || currentLocationId !== null)

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCancel} title="Add Items" size="5xl">
        <ModalBody className='overflow-y-auto max-h-[70vh] modal-scrollbar'>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">
                Add Items to Schedule
              </span>
            </div>

            {/* Empty State - No Project Days */}
            {projectDays.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-300">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Project Days Scheduled
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                  Items need to be assigned to project days. Please add at least one project day before adding items to this project.
                </p>
                {onOpenAddDay && (
                  <Button
                    type="button"
                    onClick={() => {
                      onCancel()
                      onOpenAddDay()
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <CalendarPlus className="h-5 w-5" />
                    Add Project Day
                  </Button>
                )}
              </div>
            )}

            {/* Main Content - Only show when project days exist */}
            {projectDays.length > 0 && (
              <>
            {/* Added Items List */}
            {addedItems.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Items to Add ({addedItems.length})
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {addedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* Number Badge */}
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {item.item_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  {item.item_type}
                                </span>
                                <span>{item.brand_name}</span>
                                {item.source_location_name && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    <MapPin className="h-3 w-3" />
                                    {item.source_location_name}
                                  </span>
                                )}
                              </div>
                              
                              {/* Quantity Section */}
                              <div className="flex items-center gap-2">
                                {item.isEditing ? (
                                  <div className="flex-1 max-w-xs">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        max={item.available_quantity}
                                        value={item.allocated_quantity}
                                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                        className={`w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 ${
                                          item.quantityError
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                      />
                                      <span className="text-xs text-gray-500">
                                        / {item.available_quantity} available
                                      </span>
                                    </div>
                                    {item.quantityError && (
                                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {item.quantityError}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                    Quantity: {item.allocated_quantity} / {item.available_quantity}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleEdit(item.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                title={item.isEditing ? "Save changes" : "Edit quantity"}
                              >
                                {item.isEditing ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Edit2 className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Remove item"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Section */}
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Add New Item
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Item Selection */}
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item
                  </label>
                  <ItemSelector
                    value={currentItemId}
                    joNumber={joNumber}
                    onChange={(itemId, itemData) => {
                      setCurrentItemId(itemId)
                      setCurrentItemData(itemData)
                      setCurrentQuantityError('')
                      setCurrentItemLocations([])
                      setCurrentLocationId(null)

                      // Fetch locations for this item
                      if (itemId) {
                        fetchItemLocations(itemId)
                      }

                      // Validate current quantity against new item
                      if (currentQuantity > 0 && itemData) {
                        const error = validateQuantity(currentQuantity, itemData.available_quantity)
                        setCurrentQuantityError(error)
                      }
                    }}
                    placeholder="Search and select item..."
                    className="min-w-0"
                  />
                </div>

                {/* Source Location Selection */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Location
                  </label>
                  {loadingLocations ? (
                    <div className="flex items-center justify-center h-10 bg-gray-50 border border-gray-300 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  ) : currentItemLocations.length > 0 ? (
                    <div className="space-y-1">
                      <select
                        value={currentLocationId || ''}
                        onChange={(e) => {
                          const locId = e.target.value ? parseInt(e.target.value) : null
                          setCurrentLocationId(locId)
                          // Re-validate quantity with new location's availability
                          if (currentQuantity > 0 && locId) {
                            const location = currentItemLocations.find(loc => loc.location_id === locId)
                            if (location) {
                              const error = validateQuantity(currentQuantity, location.available_quantity)
                              setCurrentQuantityError(error)
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!currentItemData}
                      >
                        <option value="">Select location...</option>
                        {currentItemLocations.map(loc => (
                          <option key={loc.location_id} value={loc.location_id}>
                            {loc.location_name} ({loc.available_quantity} available)
                          </option>
                        ))}
                      </select>
                      {currentLocationId && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <MapPin className="h-3 w-3" />
                          {currentItemLocations.find(l => l.location_id === currentLocationId)?.location_name}
                        </div>
                      )}
                    </div>
                  ) : currentItemData ? (
                    <div className="flex items-center h-10 px-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                      No stock at any location
                    </div>
                  ) : (
                    <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-500">
                      Select an item first
                    </div>
                  )}
                </div>

                {/* Quantity Input */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="space-y-1">
                    <input
                      type="number"
                      min="1"
                      max={getCurrentAvailableQuantity() || 999999}
                      value={currentQuantity || ''}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0
                        setCurrentQuantity(quantity)
                        const availableQty = getCurrentAvailableQuantity()
                        const error = validateQuantity(quantity, availableQty)
                        setCurrentQuantityError(error)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                        currentQuantityError
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="0"
                      disabled={!currentItemData || (currentItemLocations.length > 0 && !currentLocationId)}
                    />
                    {currentLocationId && currentItemLocations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Available: {getCurrentAvailableQuantity()}
                      </div>
                    )}
                    {currentQuantityError && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {currentQuantityError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">
                    Action
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!canAddCurrent}
                    className={`w-full py-2.5 flex items-center justify-center gap-2 transition-all duration-200 ${
                      canAddCurrent
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <PackageCheck className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Helper Text */}
              {canAddCurrent && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span>
                    Ready to add <span className="font-semibold">{currentItemData?.name}</span> with{' '}
                    <span className="font-semibold">{currentQuantity} units</span>
                    {currentLocationId && currentItemLocations.find(l => l.location_id === currentLocationId) && (
                      <> from <span className="font-semibold">{currentItemLocations.find(l => l.location_id === currentLocationId)?.location_name}</span></>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Project Days Selection */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                {/* Header with "Apply to All" checkbox */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 block">
                        Select Project Days
                      </span>
                      <span className="text-xs text-gray-600">
                        Choose which days to add these items to
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Apply to all days
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={applyToAll}
                        onChange={toggleApplyToAll}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                </div>

                {/* Individual Day Checkboxes */}
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {projectDays.map((day, index) => {
                    const dayDate = new Date(day.project_date)
                    const isSelected = selectedProjectDays.has(day.id)
                    const isPastDate = dayDate < new Date(new Date().setHours(0, 0, 0, 0))
                    
                    return (
                      <label
                        key={day.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${isPastDate ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDaySelection(day.id)}
                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                Day {index + 1}
                              </span>
                              {isPastDate && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                  Past
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-600">
                              {dayDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {day.location_name && (
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {day.location_name}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-600 ml-2 flex-shrink-0" />
                        )}
                      </label>
                    )
                  })}
                </div>

                {/* Selection Summary */}
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-gray-600">
                    {selectedProjectDays.size === 0 
                      ? 'No days selected'
                      : `${selectedProjectDays.size} of ${projectDays.length} days selected`
                    }
                  </span>
                  {selectedProjectDays.size > 0 && selectedProjectDays.size < projectDays.length && (
                    <button
                      type="button"
                      onClick={toggleApplyToAll}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Select all
                    </button>
                  )}
                  {selectedProjectDays.size === projectDays.length && projectDays.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleApplyToAll}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      Deselect all
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Total Quantity Warning - Shows when items exceed available quantity across selected days */}
            {hasTotalQuantityWarnings && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                      Insufficient Inventory for Selected Days
                    </h4>
                    <p className="text-xs text-red-700 mb-3">
                      The following items don't have enough available quantity to allocate across all {selectedProjectDays.size} selected days:
                    </p>
                    <div className="space-y-2">
                      {totalQuantityWarnings.map((warning: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white border border-red-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {warning.itemName}
                            </span>
                            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                              Need {warning.totalNeeded} / Have {warning.available}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {warning.message}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mt-3 font-medium">
                      Please reduce the quantity or select fewer days to proceed.
                    </p>
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* Summary removed - no longer needed with new design */}
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              {projectDays.length === 0 ? (
                <span className="text-sm text-amber-600">
                  Add project days to continue
                </span>
              ) : hasTotalQuantityWarnings ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    Insufficient quantity for {selectedProjectDays.size} days
                  </span>
                </>
              ) : addedItems.length > 0 ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {addedItems.length} item(s) ready to add to {selectedProjectDays.size} day(s)
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  Add items to continue
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
              {projectDays.length > 0 && (
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
                    <>Add {addedItems.length} Item(s)</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirm Add Items"
        message={`Are you sure you want to add ${pendingData.length} item(s) to ${selectedProjectDays.size} project day(s)?`}
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
