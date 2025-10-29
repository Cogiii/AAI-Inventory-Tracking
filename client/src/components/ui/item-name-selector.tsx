import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Package, Plus, Search, Check, X } from 'lucide-react'

interface ItemNameSelectorProps {
  value?: string
  onChange: (itemName: string) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
  type?: 'product' | 'material'
}

// Mock data for common item names - in real app this would come from an API
const getCommonItemNames = (type?: 'product' | 'material'): string[] => {
  const productNames = [
    'Cement Bags', 'Steel Rebar', 'Concrete Blocks', 'Plywood Sheets', 'PVC Pipes',
    'Electric Wire', 'Paint Buckets', 'Roofing Sheets', 'Door Frames', 'Windows',
    'Tiles', 'Gravel', 'Sand', 'Nails', 'Screws', 'Bolts', 'Washers', 'Hinges',
    'Faucets', 'Electrical Outlets', 'Light Switches', 'Circuit Breakers'
  ]
  
  const materialNames = [
    'Raw Steel', 'Aluminum Sheets', 'Copper Wire', 'Wooden Planks', 'Glass Panels',
    'Plastic Pellets', 'Rubber Sheets', 'Fabric Rolls', 'Leather Hides', 'Paper Rolls',
    'Cardboard', 'Foam Padding', 'Insulation Material', 'Adhesive', 'Sealant',
    'Primer', 'Varnish', 'Epoxy Resin', 'Fiberglass', 'Carbon Fiber'
  ]

  if (type === 'product') return productNames
  if (type === 'material') return materialNames
  return [...productNames, ...materialNames]
}

const ItemNameSelector: React.FC<ItemNameSelectorProps> = ({
  value = '',
  onChange,
  placeholder = "Search or enter item name...",
  allowCreate = true,
  className = "",
  type
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const commonItems = getCommonItemNames(type)

  // Filter items based on search query
  const filteredItems = commonItems.filter(item => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return item.toLowerCase().includes(query)
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
      const target = event.target as Node
      const isInsideInput = inputRef.current && inputRef.current.contains(target)
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target)
      
      if (!isInsideInput && !isInsideDropdown) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      
      // Update position on scroll and resize
      const handlePositionUpdate = () => updateDropdownPosition()
      window.addEventListener('scroll', handlePositionUpdate, true)
      window.addEventListener('resize', handlePositionUpdate)
      
      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, true)
        window.removeEventListener('resize', handlePositionUpdate)
      }
    }
  }, [isOpen])

  // Sync search query with value prop
  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  const handleItemSelect = (itemName: string) => {
    onChange(itemName)
    setSearchQuery(itemName)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleCreateCustom = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim())
      setIsOpen(false)
    }
  }

  // Check if current search query is an exact match
  const isExactMatch = commonItems.some(item => 
    item.toLowerCase() === searchQuery.toLowerCase()
  )

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setSearchQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Portal */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                >
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 truncate block">{item}</span>
                    </div>
                    <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No items found for "{searchQuery}"</p>
                {allowCreate && (
                  <p className="text-xs mt-1">Press Enter or click below to use custom name</p>
                )}
              </div>
            )}
          </div>

          {/* Custom Name Option */}
          {allowCreate && searchQuery.trim() && !isExactMatch && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleCreateCustom}
                className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Use "{searchQuery.trim()}"</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default ItemNameSelector