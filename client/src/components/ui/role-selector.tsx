import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Shield, Plus, Search, Check, X, Crown, HardHat, Users, AlertTriangle } from 'lucide-react'
import { usePersonnelRoles } from '@/hooks/useProjectDetail'

interface RoleSelectorProps {
  value?: number | null // role_id
  onChange: (roleId: number | null, roleData?: any) => void
  placeholder?: string
  allowCreate?: boolean
  className?: string
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search or select role...",
  allowCreate = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: ''
  })
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update dropdown position based on input field
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap below input
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }
  
  // Use API to get roles data
  const { data: personnelRolesData } = usePersonnelRoles()
  const roles = personnelRolesData?.roles || []
  const selectedRole = value ? roles.find((r: any) => r.id === value) : null

  // Filter roles based on search query
  const filteredRoles = roles.filter((role: any) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return role.name.toLowerCase().includes(query)
  })

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
    }
  }, [isOpen])

  // Update position on scroll and resize
  useEffect(() => {
    if (isOpen) {
      const handleUpdate = () => updateDropdownPosition()
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen])

  const handleRoleSelect = (role: any) => {
    onChange(role.id, role)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateRole = () => {
    // In real app, this would call an API to create the role
    const tempId = roles.length > 0 ? Math.max(...roles.map((r: any) => r.id)) + 1 : 1
    const createdRole = {
      id: tempId,
      name: newRole.name,
      description: newRole.description
    }
    
    // For now, just select the created role (in real app, this would be handled by proper API call)
    handleRoleSelect(createdRole)
    setShowCreateForm(false)
    setNewRole({
      name: '',
      description: ''
    })
  }

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes('manager')) return <Crown className="h-4 w-4 text-purple-600" />
    if (name.includes('engineer')) return <HardHat className="h-4 w-4 text-blue-600" />
    if (name.includes('safety') || name.includes('security')) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    if (name.includes('supervisor') || name.includes('foreman')) return <Users className="h-4 w-4 text-green-600" />
    return <Shield className="h-4 w-4 text-gray-600" />
  }

  const getRoleColor = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes('manager')) return 'bg-purple-100 text-purple-800'
    if (name.includes('engineer')) return 'bg-blue-100 text-blue-800'
    if (name.includes('safety') || name.includes('security')) return 'bg-yellow-100 text-yellow-800'
    if (name.includes('supervisor') || name.includes('foreman')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedRole ? selectedRole.name : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
            if (selectedRole) {
              onChange(null) // Clear selection when typing
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedRole && (
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

      {/* Selected Role Display */}
      {selectedRole && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-2">
            {getRoleIcon(selectedRole.name)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{selectedRole.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(selectedRole.name)}`}>
                  Role
                </span>
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
              <h4 className="font-medium text-gray-900 mb-3">Create New Role</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Site Coordinator"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Brief role description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewRole({
                        name: '',
                        description: ''
                      })
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateRole}
                    disabled={!newRole.name}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.05] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    Create Role
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Search Results and Create Button
            <>
              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:shadow-sm border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-all duration-200"
                    >
                      <div className="flex items-start gap-2">
                        {getRoleIcon(role.name)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{role.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(role.name)}`}>
                              Role
                            </span>
                          </div>
                        </div>
                        <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No roles found for "{searchQuery}"</p>
                    {allowCreate && (
                      <p className="text-xs mt-1">You can create a new role below</p>
                    )}
                  </div>
                )}
              </div>

              {/* Create New Role Option */}
              {allowCreate && (
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-3 text-left hover:bg-green-50 hover:shadow-sm flex items-center gap-2 text-green-700 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Create new role</span>
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

export default RoleSelector
