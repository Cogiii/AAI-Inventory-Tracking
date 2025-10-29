import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Tag, Plus, Search, Check, X } from 'lucide-react'
import { useBrands } from '@/hooks/useInventory'
import type { Brand } from '@/schemas'

interface BrandSelectorProps {
  value?: number | null // brand_id
  onChange: (brandId: number | null, brandData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
}

const BrandSelector: React.FC<BrandSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select brand...",
  allowCreate = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: ''
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: brandsData, isLoading } = useBrands()
  const brands = brandsData?.data?.brands || []
  const selectedBrand = value ? brands.find((b: Brand) => b.id === value) : null

  // Filter brands based on search query
  const filteredBrands = brands.filter((brand: Brand) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return brand.name.toLowerCase().includes(query)
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
        setShowCreateForm(false)
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

  const handleBrandSelect = (brand: any) => {
    onChange(brand.id, brand)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateBrand = () => {
    // In real app, this would call an API to create the brand
    const tempId = Math.max(...brands.map((b: Brand) => b.id)) + 1
    const createdBrand = {
      id: tempId,
      ...newBrand
    }
    
    handleBrandSelect(createdBrand)
    setShowCreateForm(false)
    setNewBrand({
      name: '',
      description: ''
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedBrand ? selectedBrand.name : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
            if (selectedBrand) {
              onChange(null) // Clear selection when typing
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedBrand && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setSearchQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected Brand Display */}
      {selectedBrand && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{selectedBrand.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading brands...
            </div>
          ) : (
            <>
              {showCreateForm ? (
                // Create Form
                <div className="p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Brand</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={newBrand.name}
                        onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter brand name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newBrand.description}
                        onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Brand description (optional)"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewBrand({ name: '', description: '' })
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 hover:shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateBrand}
                        disabled={!newBrand.name}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        Add Brand
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Search Results and Create Button
                <>
                  {/* Search Results */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand: Brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => handleBrandSelect(brand)}
                          className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                        >
                          <div className="flex items-start gap-2">
                            <Tag className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 truncate">{brand.name}</span>
                              </div>
                            </div>
                            <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-gray-500">
                        <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No brands found for "{searchQuery}"</p>
                        {allowCreate && (
                          <p className="text-xs mt-1">You can add a new brand below</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Create New Brand Option */}
                  {allowCreate && (
                    <div className="border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Add new brand</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default BrandSelector