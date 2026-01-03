import { useState, useEffect } from 'react'
import type { FC , FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

import { ConfirmationModal, PersonnelSelector, RoleSelector } from '@/components/ui'
import { Users, User, Loader2, Calendar, Check, X, Edit2, Phone, Briefcase, UserCheck, CalendarPlus } from 'lucide-react'
import { usePersonnelRoles, useAddPersonnel } from '@/hooks/useProjectDetail'

interface AddPersonnelFormProps {
  isOpen: boolean
  joNumber: string
  projectDays: any[]
  selectedDay: number | 'all'
  applyToAllDays: boolean
  setApplyToAllDays: (value: boolean) => void
  onCancel: () => void
  onOpenAddDay?: () => void
}

interface AddedPersonnel {
  id: string
  personnel_id: number
  role_id: number
  personnel_name: string
  contact_number: string
  role_name: string
  isEditing: boolean
}

const AddPersonnelForm: FC<AddPersonnelFormProps> = ({
  isOpen,
  joNumber,
  projectDays,
  selectedDay,
  applyToAllDays,
  setApplyToAllDays,
  onCancel,
  onOpenAddDay
}) => {
  // Hooks
  const { isLoading: personnelRolesLoading } = usePersonnelRoles()
  const addPersonnelMutation = useAddPersonnel()
  
  // State for added personnel list
  const [addedPersonnel, setAddedPersonnel] = useState<AddedPersonnel[]>([])
  
  // State for current input selection
  const [currentPersonnelId, setCurrentPersonnelId] = useState<number | null>(null)
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null)
  const [currentPersonnelData, setCurrentPersonnelData] = useState<any>(null)
  const [currentRoleData, setCurrentRoleData] = useState<any>(null)
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any[]>([])
  
  // State for selected project days
  const [selectedProjectDays, setSelectedProjectDays] = useState<Set<number>>(new Set())
  const [applyToAll, setApplyToAll] = useState(false)

  // Get all personnel IDs that are already assigned to the project
  const getExistingPersonnelIds = () => {
    const existingIds = new Set<number>()
    
    // Add personnel from all project days
    projectDays.forEach(day => {
      if (day.personnel && Array.isArray(day.personnel)) {
        day.personnel.forEach((person: any) => {
          existingIds.add(person.personnel_id)
        })
      }
    })
    
    // Add personnel from the current "to be added" list
    addedPersonnel.forEach(person => {
      existingIds.add(person.personnel_id)
    })
    
    return Array.from(existingIds)
  }

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

  // Add personnel to the list
  const handleAddPersonnel = () => {
    if (!currentPersonnelId || !currentRoleId || !currentPersonnelData || !currentRoleData) {
      return
    }

    const newPersonnel: AddedPersonnel = {
      id: Date.now().toString(),
      personnel_id: currentPersonnelId,
      role_id: currentRoleId,
      personnel_name: currentPersonnelData.name,
      contact_number: currentPersonnelData.contact_number,
      role_name: currentRoleData.name,
      isEditing: false
    }

    setAddedPersonnel(prev => [...prev, newPersonnel])
    
    // Clear current selection
    setCurrentPersonnelId(null)
    setCurrentRoleId(null)
    setCurrentPersonnelData(null)
    setCurrentRoleData(null)
  }

  // Remove personnel from the list
  const handleRemovePersonnel = (id: string) => {
    setAddedPersonnel(prev => prev.filter(p => p.id !== id))
  }

  // Toggle edit mode for a personnel
  const handleToggleEdit = (id: string) => {
    setAddedPersonnel(prev => prev.map(p => 
      p.id === id ? { ...p, isEditing: !p.isEditing } : p
    ))
  }

  // Update role for a personnel
  const handleUpdateRole = (id: string, roleId: number | null, roleData?: any) => {
    if (!roleId || !roleData) return

    setAddedPersonnel(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        role_id: roleId, 
        role_name: roleData.name,
        isEditing: false 
      } : p
    ))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (addedPersonnel.length === 0) {
      return
    }

    // Convert to personnel data
    const personnelData = addedPersonnel.map(p => ({
      personnel_id: p.personnel_id,
      role_id: p.role_id,
      personnel_name: p.personnel_name,
      contact_number: p.contact_number,
      role_name: p.role_name
    }))

    setPendingData(personnelData)
    setShowConfirmation(true)
  }

  const handleConfirmedAdd = async () => {
    if (pendingData.length === 0 || selectedProjectDays.size === 0) return

    try {
      await addPersonnelMutation.mutateAsync({
        joNumber,
        project_day_ids: Array.from(selectedProjectDays),
        personnel_assignments: pendingData.map(personnel => ({
          personnel_id: personnel.personnel_id,
          role_id: personnel.role_id
        }))
      })
      
      // Reset form
      setAddedPersonnel([])
      setCurrentPersonnelId(null)
      setCurrentRoleId(null)
      setCurrentPersonnelData(null)
      setCurrentRoleData(null)
      setSelectedProjectDays(new Set())
      setApplyToAll(false)
      setPendingData([])
      setShowConfirmation(false)
      onCancel()
    } catch (error) {
      console.error('Error adding personnel:', error)
      // Keep confirmation modal open to allow retry
    }
  }

  const handleCancel = () => {
    // Reset form on cancel
    setAddedPersonnel([])
    setCurrentPersonnelId(null)
    setCurrentRoleId(null)
    setCurrentPersonnelData(null)
    setCurrentRoleData(null)
    onCancel()
  }

  const isFormValid = addedPersonnel.length > 0 && selectedProjectDays.size > 0
  
  const canAddCurrent = currentPersonnelId && currentRoleId && currentPersonnelData && currentRoleData

  // Loading state when personnel/roles data is loading
  if (personnelRolesLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleCancel} title="Add Personnel" size="5xl">
        <ModalBody>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading personnel data...</span>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCancel} title="Add Personnel" size="5xl">
        <ModalBody className='overflow-y-auto max-h-[70vh] modal-scrollbar'>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">
                Add Personnel to Schedule
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
                  Personnel need to be assigned to project days. Please add at least one project day before adding personnel to this project.
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
            {/* Added Personnel List */}
            {addedPersonnel.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Personnel to Add ({addedPersonnel.length})
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {addedPersonnel.map((personnel, index) => (
                    <div
                      key={personnel.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* Number Badge */}
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>

                        {/* Personnel Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {personnel.personnel_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600">
                                  {personnel.contact_number}
                                </span>
                              </div>
                              
                              {/* Role Section */}
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                {personnel.isEditing ? (
                                  <div className="flex-1">
                                    <RoleSelector
                                      value={personnel.role_id}
                                      onChange={(roleId, roleData) => handleUpdateRole(personnel.id, roleId, roleData)}
                                      placeholder="Select role..."
                                      allowCreate={true}
                                      className="text-xs"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                    {personnel.role_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleEdit(personnel.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                title={personnel.isEditing ? "Cancel edit" : "Edit role"}
                              >
                                {personnel.isEditing ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <Edit2 className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePersonnel(personnel.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Remove personnel"
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
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Add New Personnel
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Personnel Selection */}
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Personnel
                  </label>
                  <PersonnelSelector
                    value={currentPersonnelId}
                    onChange={(personnelId, personnelData) => {
                      setCurrentPersonnelId(personnelId)
                      setCurrentPersonnelData(personnelData)
                    }}
                    placeholder="Choose personnel..."
                    allowCreate={true}
                    className="min-w-0"
                    excludeIds={getExistingPersonnelIds()}
                  />
                </div>

                {/* Role Selection */}
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                  </label>
                  <RoleSelector
                    value={currentRoleId}
                    onChange={(roleId, roleData) => {
                      setCurrentRoleId(roleId)
                      setCurrentRoleData(roleData)
                    }}
                    placeholder="Choose role..."
                    allowCreate={true}
                    className="min-w-0"
                  />
                </div>

                {/* Add Button */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">
                    Action
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddPersonnel}
                    disabled={!canAddCurrent}
                    className={`w-full py-2.5 flex items-center justify-center gap-2 transition-all duration-200 ${
                      canAddCurrent
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Helper Text */}
              {canAddCurrent && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span>
                    Ready to add <span className="font-semibold">{currentPersonnelData?.name}</span> as{' '}
                    <span className="font-semibold">{currentRoleData?.name}</span>
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
                        Choose which days to add these personnel to
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
              </>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              {projectDays.length === 0 ? (
                <span className="text-sm text-amber-600">
                  Add project days to continue
                </span>
              ) : addedPersonnel.length > 0 ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {addedPersonnel.length} personnel ready to add
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  Add personnel to continue
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
                  disabled={!isFormValid || addPersonnelMutation.isPending}
                  className={`px-4 py-2 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
                    isFormValid && !addPersonnelMutation.isPending
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addPersonnelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>Add {addedPersonnel.length} Personnel</>
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
        title="Confirm Add Personnel"
        message={`Are you sure you want to add ${pendingData.length} personnel to ${selectedProjectDays.size} project day(s)?`}
        onConfirm={handleConfirmedAdd}
        onClose={() => {
          setShowConfirmation(false)
          setPendingData([])
        }}
      />
    </>
  )
}

export default AddPersonnelForm