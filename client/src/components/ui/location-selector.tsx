import { useState, useRef, useEffect } from 'react'
import { MapPin, Plus, Search, Check, X, Building, Warehouse, Home } from 'lucide-react'
import { getLocations } from '@/utils/projectData'

interface LocationSelectorProps {
  value?: number | null // location_id
  onChange: (locationId: number | null, locationData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select location...",
  allowCreate = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
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
  
  const locations = getLocations()
  const selectedLocation = value ? locations.find(l => l.id === value) : null

  // Filter locations based on search query
  const filteredLocations = locations.filter(location => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      location.name.toLowerCase().includes(query) ||
      location.city.toLowerCase().includes(query) ||
      location.province.toLowerCase().includes(query) ||
      location.full_address.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query)
    )
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationSelect = (location: any) => {
    onChange(location.id, location)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateLocation = () => {
    // In real app, this would call an API to create the location
    const tempId = Math.max(...locations.map(l => l.id)) + 1
    const createdLocation = {
      id: tempId,
      ...newLocation,
      postal_code: '0000', // Default
      full_address: `${newLocation.name}, ${newLocation.street}, ${newLocation.barangay}, ${newLocation.city}, ${newLocation.province}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null
    }
    
    // Add to locations array (in real app, this would be handled by state management)
    locations.push(createdLocation)
    
    handleLocationSelect(createdLocation)
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
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedLocation ? selectedLocation.name : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
            if (selectedLocation) {
              onChange(null) // Clear selection when typing
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedLocation && (
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

      {/* Selected Location Display */}
      {selectedLocation && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-2">
            {getLocationIcon(selectedLocation.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{selectedLocation.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(selectedLocation.type)}`}>
                  {selectedLocation.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600">{selectedLocation.full_address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {showCreateForm ? (
            // Create Form
            <div className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Create New Location</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Location name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={newLocation.type}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="project_site">Project Site</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newLocation.street}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Barangay</label>
                    <input
                      type="text"
                      value={newLocation.barangay}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, barangay: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Barangay"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Province *</label>
                    <input
                      type="text"
                      value={newLocation.province}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, province: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Province"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                    <select
                      value={newLocation.region}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateLocation}
                    disabled={!newLocation.name || !newLocation.city || !newLocation.province}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Search Results and Create Button
            <>
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
                        {getLocationIcon(location.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{location.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(location.type)}`}>
                              {location.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{location.full_address}</p>
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
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Create new location</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default LocationSelector