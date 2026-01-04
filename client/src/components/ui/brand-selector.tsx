import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Tag, Plus, Search, Check, X, Loader2 } from 'lucide-react'
import { useBrands, useCreateBrand } from '@/hooks/useInventory'

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
  allowCreate = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: ''
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use API hooks
  const { data: brandsResponse, isLoading: brandsLoading } = useBrands()
  const createBrandMutation = useCreateBrand()

  // Get brands array from response
  const brands = Array.isArray(brandsResponse?.data?.brands) ? brandsResponse.data.brands : []
  const selectedBrand = value ? brands.find((b: any) => b.id === value) : null

  // Filter brands based on search query
  const filteredBrands = brands.filter((brand: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      (brand.name?.toLowerCase() || '').includes(query) ||
      (brand.description?.toLowerCase() || '').includes(query)
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
      if (showCreateForm) return

      const target = event.target as Node
      const isInsideInput = inputRef.current && inputRef.current.contains(target)
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target)

      if (!isInsideInput && !isInsideDropdown) {
        setIsOpen(false)
        setSearchQuery('')
        setIsSearching(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCreateForm])

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()

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
    setIsSearching(false)
  }

  const handleOpenCreateModal = () => {
    setIsOpen(false)
    setShowCreateForm(true)
    // Pre-fill with search query if any
    if (searchQuery) {
      setNewBrand(prev => ({ ...prev, name: searchQuery }))
    }
  }

  const handleCloseCreateModal = () => {
    setShowCreateForm(false)
    setNewBrand({ name: '', description: '' })
  }

  const handleCreateBrand = async () => {
    try {
      const result = await createBrandMutation.mutateAsync({
        name: newBrand.name,
        description: newBrand.description || undefined
      })

      // Select the newly created brand and close modal
      if (result.data?.brand) {
        onChange(result.data.brand.id, result.data.brand)
      }
      handleCloseCreateModal()
    } catch (error) {
      console.error('Error creating brand:', error)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isSearching ? searchQuery : (selectedBrand ? selectedBrand.name : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsSearching(true)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            if (selectedBrand && !isSearching) {
              setSearchQuery('')
              setIsSearching(true)
            }
          }}
          placeholder={brandsLoading ? 'Loading brands...' : placeholder}
          disabled={brandsLoading}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {selectedBrand && !isSearching && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setSearchQuery('')
              setIsSearching(false)
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
              <span className="font-medium text-gray-900">{selectedBrand.name}</span>
              {selectedBrand.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedBrand.description}</p>
              )}
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
          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {brandsLoading ? (
              <div className="px-3 py-4 text-center text-gray-500">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-500" />
                <p className="text-sm">Loading brands...</p>
              </div>
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand: any) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandSelect(brand)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                >
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 truncate block">{brand.name}</span>
                      {brand.description && (
                        <p className="text-sm text-gray-600 truncate">{brand.description}</p>
                      )}
                    </div>
                    {value === brand.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No brands found{searchQuery && ` for "${searchQuery}"`}</p>
                {allowCreate && (
                  <p className="text-xs mt-1">You can create a new brand below</p>
                )}
              </div>
            )}
          </div>

          {/* Create New Brand Option */}
          {allowCreate && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full px-3 py-3 text-left hover:bg-blue-50 hover:shadow-sm flex items-center gap-2 text-blue-700 transition-all duration-200 hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create new brand</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Create Brand Modal */}
      {showCreateForm && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Create New Brand</h3>
                    <p className="text-blue-100 text-sm">Add a new brand to the system</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="e.g., Samsung, LG, Sony"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={newBrand.description}
                  onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Brief description of the brand"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={createBrandMutation.isPending}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={!newBrand.name.trim() || createBrandMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                {createBrandMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Brand
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default BrandSelector
