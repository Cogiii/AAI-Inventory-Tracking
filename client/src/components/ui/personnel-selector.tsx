import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { User, Plus, Search, Check, X, Phone, Loader2 } from 'lucide-react'
import { usePersonnelRoles, useCreatePersonnel } from '@/hooks/useProjectDetail'

interface PersonnelSelectorProps {
  value?: number | null // personnel_id
  onChange: (personnelId: number | null, personnelData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
  excludeIds?: number[] // Personnel IDs to exclude from the list
}

const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select personnel...",
  allowCreate = false,
  className = "",
  excludeIds = []
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
  const createPersonnelMutation = useCreatePersonnel()
  const personnel = personnelRolesData?.personnel || []
  const selectedPersonnel = value ? personnel.find((p: any) => p.id === value) : null

  // Filter personnel based on search query, active status, and exclusions
  const filteredPersonnel = personnel.filter((person: any) => {
    // Exclude personnel in excludeIds list
    if (excludeIds.includes(person.id)) return false
    
    // Only show active personnel
    if (person.is_active === false || person.is_active === 0) return false
    
    // Filter by search query
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
      // Don't close if the create modal is open
      if (showCreateForm) return

      const target = event.target as Node
      const isInsideInput = inputRef.current && inputRef.current.contains(target)
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target)

      if (!isInsideInput && !isInsideDropdown) {
        setIsOpen(false)
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

  const handlePersonnelSelect = (person: any) => {
    onChange(person.id, person)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleOpenCreateModal = () => {
    setIsOpen(false) // Close the dropdown
    setShowCreateForm(true) // Open the modal
  }

  const handleCloseCreateModal = () => {
    setShowCreateForm(false)
    setNewPersonnel({
      name: '',
      contact_number: '',
      is_active: true
    })
  }

  const handleCreatePersonnel = async () => {
    try {
      const createdPersonnel = await createPersonnelMutation.mutateAsync({
        name: newPersonnel.name,
        contact_number: newPersonnel.contact_number
      })

      // Select the newly created personnel and close modal
      onChange(createdPersonnel.id, createdPersonnel)
      handleCloseCreateModal()
    } catch (error) {
      console.error('Error creating personnel:', error)
    }
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
                onClick={handleOpenCreateModal}
                className="w-full px-3 py-3 text-left hover:bg-blue-50 hover:shadow-sm flex items-center gap-2 text-blue-700 transition-all duration-200 hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add new personnel</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Create Personnel Modal - Nested Modal with Enhanced Styling */}
      {showCreateForm && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Darker overlay to emphasize nested modal */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header with accent border */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Add New Personnel</h3>
                    <p className="text-blue-100 text-sm">Add a new team member</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={newPersonnel.contact_number}
                    onChange={(e) => {
                      // Only allow digits and limit to 11 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                      setNewPersonnel(prev => ({ ...prev, contact_number: value }))
                    }}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="09123456789"
                    maxLength={11}
                  />
                </div>
                {newPersonnel.contact_number && (
                  newPersonnel.contact_number.length < 11 ? (
                    <p className="text-xs text-amber-600 mt-1.5">Enter 11 digits (e.g., 09123456789)</p>
                  ) : !newPersonnel.contact_number.startsWith('09') ? (
                    <p className="text-xs text-red-600 mt-1.5">Number must start with 09</p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1.5">Valid phone number format</p>
                  )
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePersonnel}
                disabled={!newPersonnel.name || !newPersonnel.contact_number || newPersonnel.contact_number.length !== 11 || !newPersonnel.contact_number.startsWith('09') || createPersonnelMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                {createPersonnelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Personnel
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

export default PersonnelSelector
