import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { User, Plus, Search, Check, X, Phone } from 'lucide-react'
import { usePersonnelRoles } from '@/hooks/useProjectDetail'

interface PersonnelSelectorProps {
  value?: number | null // personnel_id
  onChange: (personnelId: number | null, personnelData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
}

const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select personnel...",
  allowCreate = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [newPersonnel, setNewPersonnel] = useState({
    name: '',
    contact_number: '',
    is_active: true
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Use API to get personnel data
  const { data: personnelRolesData } = usePersonnelRoles()
  const personnel = personnelRolesData?.personnel || []
  const selectedPersonnel = value ? personnel.find((p: any) => p.id === value) : null

  // Filter personnel based on search query
  const filteredPersonnel = personnel.filter((person: any) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      person.name.toLowerCase().includes(query) ||
      (person.contact_number && person.contact_number.includes(query))
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

  const handlePersonnelSelect = (person: any) => {
    onChange(person.id, person)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreatePersonnel = () => {
    // In real app, this would call an API to create the personnel
    const tempId = personnel.length > 0 ? Math.max(...personnel.map((p: any) => p.id)) + 1 : 1
    const createdPersonnel = {
      id: tempId,
      ...newPersonnel
    }
    
    // For now, just select the created personnel (in real app, this would be handled by proper API call)
    handlePersonnelSelect(createdPersonnel)
    setShowCreateForm(false)
    setNewPersonnel({
      name: '',
      contact_number: '',
      is_active: true
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedPersonnel ? selectedPersonnel.name : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
            if (selectedPersonnel) {
              onChange(null) // Clear selection when typing
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedPersonnel && (
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

      {/* Selected Personnel Display */}
      {selectedPersonnel && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{selectedPersonnel.name}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{selectedPersonnel.contact_number}</span>
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
          {showCreateForm ? (
            // Create Form
            <div className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Add New Personnel</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newPersonnel.name}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="text"
                    value={newPersonnel.contact_number}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, contact_number: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="+63-917-xxx-xxxx"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewPersonnel({
                        name: '',
                        contact_number: '',
                        is_active: true
                      })
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePersonnel}
                    disabled={!newPersonnel.name || !newPersonnel.contact_number}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    Add Personnel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Search Results and Create Button
            <>
              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto">
                {filteredPersonnel.length > 0 ? (
                  filteredPersonnel.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handlePersonnelSelect(person)}
                      className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                    >
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{person.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{person.contact_number}</span>
                          </div>
                        </div>
                        <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No personnel found for "{searchQuery}"</p>
                    {allowCreate && (
                      <p className="text-xs mt-1">You can add a new person below</p>
                    )}
                  </div>
                )}
              </div>

              {/* Create New Personnel Option */}
              {allowCreate && (
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add new personnel</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default PersonnelSelector
