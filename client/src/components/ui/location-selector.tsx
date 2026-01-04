import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Plus, Search, Check, X, Building, Warehouse, Home, Loader2 } from 'lucide-react'
import { getLocations } from '@/utils/projectData'
import { useCreateLocation } from '@/hooks/useProjectDetail'

interface LocationSelectorProps {
  value?: number | null // location_id
  onChange: (locationId: number | null, locationData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
  locations?: any[] // Database locations
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select location...",
  allowCreate = true,
  className = "",
  locations: locationsProp
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false) // Track if user is actively searching
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'project_site' as 'warehouse' | 'project_site' | 'office',
    street: '',
    barangay: '',
    city: '',
    province: '',
    region: 'NCR'
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use API to create location
  const createLocationMutation = useCreateLocation()

  // Use provided locations or fallback to hardcoded data
  const locations = locationsProp || getLocations()
  const selectedLocation = value ? locations.find(l => l.id === value) : null

  // Filter locations based on search query
  const filteredLocations = locations.filter(location => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (location.name?.toLowerCase() || '').includes(query) ||
      (location.city?.toLowerCase() || '').includes(query) ||
      (location.province?.toLowerCase() || '').includes(query) ||
      (location.full_address?.toLowerCase() || '').includes(query) ||
      (location.type?.toLowerCase() || '').includes(query)
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

  // Close dropdown when clicking outside and reset search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if the create modal is open
      if (showCreateForm) return

      const target = event.target as Node
      const isInsideInput = inputRef.current && inputRef.current.contains(target)
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target)

      if (!isInsideInput && !isInsideDropdown) {
        setIsOpen(false)
        // Reset search state - revert to showing selected location name
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

  const handleLocationSelect = (location: any) => {
    onChange(location.id, location)
    setIsOpen(false)
    setSearchQuery('')
    setIsSearching(false)
  }

  const handleOpenCreateModal = () => {
    setIsOpen(false) // Close the dropdown
    setShowCreateForm(true) // Open the modal
  }

  const handleCloseCreateModal = () => {
    setShowCreateForm(false)
    setNewLocation({
      name: '',
      type: 'project_site',
      street: '',
      barangay: '',
      city: '',
      province: '',
      region: 'NCR'
    })
  }

  const handleCreateLocation = async () => {
    try {
      const createdLocation = await createLocationMutation.mutateAsync({
        name: newLocation.name,
        type: newLocation.type,
        street: newLocation.street,
        barangay: newLocation.barangay,
        city: newLocation.city,
        province: newLocation.province,
        region: newLocation.region
      })

      // Select the newly created location and close modal
      onChange(createdLocation.id, createdLocation)
      handleCloseCreateModal()
    } catch (error) {
      console.error('Error creating location:', error)
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return <Warehouse className="h-4 w-4 text-blue-600" />
      case 'office': return <Building className="h-4 w-4 text-green-600" />
      case 'project_site': return <Home className="h-4 w-4 text-orange-600" />
      default: return <MapPin className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warehouse': return 'bg-blue-100 text-blue-800'
      case 'office': return 'bg-green-100 text-green-800'
      case 'project_site': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isSearching ? searchQuery : (selectedLocation ? selectedLocation.name : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsSearching(true)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            // If there's a selected location, start searching with empty query to show all options
            if (selectedLocation && !isSearching) {
              setSearchQuery('')
              setIsSearching(true)
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {selectedLocation && !isSearching && (
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

      {/* Selected Location Display */}
      {selectedLocation && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-2">
            {getLocationIcon(selectedLocation.type || '')}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{selectedLocation.name}</span>
                {selectedLocation.type && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(selectedLocation.type)}`}>
                    {selectedLocation.type.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {selectedLocation.full_address || `${selectedLocation.city || ''}${selectedLocation.province ? `, ${selectedLocation.province}` : ''}`}
              </p>
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
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                >
                  <div className="flex items-start gap-2">
                    {getLocationIcon(location.type || '')}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">{location.name}</span>
                        {location.type && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(location.type)}`}>
                            {location.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {location.full_address || `${location.city || ''}${location.province ? `, ${location.province}` : ''}`}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No locations found for "{searchQuery}"</p>
                {allowCreate && (
                  <p className="text-xs mt-1">You can create a new location below</p>
                )}
              </div>
            )}
          </div>

          {/* Create New Location Option */}
          {allowCreate && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create new location</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Create Location Modal - Nested Modal with Enhanced Styling */}
      {showCreateForm && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Darker overlay to emphasize nested modal */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header with accent border */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Create New Location</h3>
                    <p className="text-green-100 text-sm">Add a new project location</p>
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
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Location Name & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., SM Mall of Asia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  >
                    <option value="project_site">Project Site</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={newLocation.street}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              {/* Barangay & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay</label>
                  <input
                    type="text"
                    value={newLocation.barangay}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, barangay: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Barangay 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Pasay City"
                  />
                </div>
              </div>

              {/* Province & Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLocation.province}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Metro Manila"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                  <select
                    value={newLocation.region}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  >
                    <option value="NCR">NCR</option>
                    <option value="CAR">CAR</option>
                    <option value="Region I">Region I</option>
                    <option value="Region II">Region II</option>
                    <option value="Region III">Region III</option>
                    <option value="CALABARZON">CALABARZON</option>
                    <option value="MIMAROPA">MIMAROPA</option>
                    <option value="Bicol Region">Bicol Region</option>
                    <option value="Western Visayas">Western Visayas</option>
                    <option value="Central Visayas">Central Visayas</option>
                    <option value="Eastern Visayas">Eastern Visayas</option>
                    <option value="Zamboanga Peninsula">Zamboanga Peninsula</option>
                    <option value="Northern Mindanao">Northern Mindanao</option>
                    <option value="Davao Region">Davao Region</option>
                    <option value="SOCCSKSARGEN">SOCCSKSARGEN</option>
                    <option value="Caraga">Caraga</option>
                    <option value="BARMM">BARMM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={createLocationMutation.isPending}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLocation}
                disabled={!newLocation.name || !newLocation.city || !newLocation.province || createLocationMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                {createLocationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Location
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

export default LocationSelector