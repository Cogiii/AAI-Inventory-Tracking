import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Package, Search, Check, X, Box, AlertTriangle } from 'lucide-react'
import { useAvailableItemsForProject } from '@/hooks/useInventory'

interface ItemSelectorProps {
  value?: number | null // item_id
  onChange: (itemId: number | null, itemData?: any) => void
  placeholder?: string
  className?: string
  joNumber?: string // Add joNumber prop
  onQuantityValidation?: (isValid: boolean, availableQuantity: number) => void
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select item...",
  className = "",
  joNumber,
  onQuantityValidation
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Get available items for project
  const { data: itemsResponse, isLoading } = useAvailableItemsForProject(joNumber)
  const items = itemsResponse?.data || []
    
  const selectedItem = value ? items.find((item: any) => item.id === value) : null

  // Filter items based on search query
  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      (item.brand_name && item.brand_name.toLowerCase().includes(query)) ||
      item.type.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  })

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      updateDropdownPosition()
      
      const handleResize = () => updateDropdownPosition()
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize)
      }
    }
  }, [isOpen])

  const handleItemSelect = (item: any) => {
    onChange(item.id, item)
    setIsOpen(false)
    setSearchQuery('')
    
    // Notify parent about quantity validation
    if (onQuantityValidation) {
      onQuantityValidation(item.available_quantity > 0, item.available_quantity || 0)
    }
  }

  // Get item display info
  const getItemDisplayInfo = (item: any) => {
    const availableQty = item.available_quantity || 0
    const isLowStock = availableQty < 10
    const isOutOfStock = availableQty === 0
    
    return {
      availableQty,
      isLowStock,
      isOutOfStock,
      statusColor: isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600',
      statusBg: isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : 'bg-green-50'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedItem ? selectedItem.name : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
            if (selectedItem) {
              onChange(null) // Clear selection when typing
              if (onQuantityValidation) {
                onQuantityValidation(false, 0)
              }
            }
          }}
          onFocus={() => {
            setIsOpen(true)
            updateDropdownPosition()
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedItem && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setSearchQuery('')
              inputRef.current?.focus()
              if (onQuantityValidation) {
                onQuantityValidation(false, 0)
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected Item Info */}
      {selectedItem && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedItem.name}
                </span>
              </div>
              {selectedItem.brand_name && (
                <span className="text-sm text-gray-600">
                  • {selectedItem.brand_name}
                </span>
              )}
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {selectedItem.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Available:</span>
              <span className={`text-sm font-medium ${getItemDisplayInfo(selectedItem).statusColor}`}>
                {selectedItem.available_quantity || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownPosition.top + 4,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 1000,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No items found matching your search' : 'No items available'}
            </div>
          ) : (
            <div className="py-2">
              {filteredItems.map((item: any) => {
                const { availableQty, isOutOfStock, statusColor, statusBg } = getItemDisplayInfo(item)
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-50 last:border-b-0 ${
                      value === item.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Box className={`h-4 w-4 ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`} />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              {item.brand_name && (
                                <>
                                  <span>{item.brand_name}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span className="capitalize">{item.type}</span>
                              {item.description && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-32">{item.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {value === item.id && (
                          <Check className="h-4 w-4 text-blue-600 ml-auto flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-2 ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                        {isOutOfStock && <AlertTriangle className="h-3 w-3" />}
                        <span>
                          {availableQty} available
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default ItemSelector