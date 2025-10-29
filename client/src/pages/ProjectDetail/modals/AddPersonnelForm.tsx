import { useState } from 'react'
import type { FC , FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmationModal, PersonnelSelector, RoleSelector } from '@/components/ui'
import { ToggleLeft, ToggleRight, Plus, Minus, Users, User, Loader2 } from 'lucide-react'
import { usePersonnelRoles, useAddPersonnel, useProjectDetail } from '@/hooks/useProjectDetail'

interface AddPersonnelFormProps {
  isOpen: boolean
  joNumber: string
  projectDays: any[]
  selectedDay: number | 'all'
  applyToAllDays: boolean
  setApplyToAllDays: (value: boolean) => void
  onCancel: () => void
}

interface PersonnelRow {
  id: string
  personnel_id: number | null
  role_id: number | null
  selectedPersonnel: any
  selectedRole: any
}

const AddPersonnelForm: FC<AddPersonnelFormProps> = ({
  isOpen,
  joNumber,
  projectDays,
  selectedDay,
  applyToAllDays,
  setApplyToAllDays,
  onCancel
}) => {
  // Hooks
  const { data: personnelRolesData, isLoading: personnelRolesLoading } = usePersonnelRoles()
  const addPersonnelMutation = useAddPersonnel()
  const [personnelRows, setPersonnelRows] = useState<PersonnelRow[]>([
    {
      id: '1',
      personnel_id: null,
      role_id: null,
      selectedPersonnel: null,
      selectedRole: null
    }
  ])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any[]>([])

  const addNewRow = () => {
    const newRow: PersonnelRow = {
      id: Date.now().toString(),
      personnel_id: null,
      role_id: null,
      selectedPersonnel: null,
      selectedRole: null
    }
    setPersonnelRows(prev => [...prev, newRow])
  }

  const removeRow = (rowId: string) => {
    if (personnelRows.length > 1) {
      setPersonnelRows(prev => prev.filter(row => row.id !== rowId))
    }
  }



  const handlePersonnelChange = (rowId: string, personnelId: number | null, personnelData?: any) => {
    setPersonnelRows(prev => prev.map(row => 
      row.id === rowId ? { 
        ...row, 
        personnel_id: personnelId, 
        selectedPersonnel: personnelData 
      } : row
    ))
  }

  const handleRoleChange = (rowId: string, roleId: number | null, roleData?: any) => {
    setPersonnelRows(prev => prev.map(row => 
      row.id === rowId ? { 
        ...row, 
        role_id: roleId, 
        selectedRole: roleData 
      } : row
    ))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Validate all rows
    const validRows = personnelRows.filter(row => 
      row.personnel_id && row.role_id && row.selectedPersonnel && row.selectedRole
    )
    
    if (validRows.length === 0) {
      return
    }

    // Convert to personnel data
    const personnelData = validRows.map(row => ({
      personnel_id: row.personnel_id,
      role_id: row.role_id,
      personnel_name: row.selectedPersonnel.name,
      contact_number: row.selectedPersonnel.contact_number,
      role_name: row.selectedRole.name
    }))

    setPendingData(personnelData)
    setShowConfirmation(true)
  }

  const handleConfirmedAdd = async () => {
    if (pendingData.length > 0) {
      try {
        // Determine which project days to assign to
        const targetProjectDayIds = applyToAllDays 
          ? projectDays.map(day => day.id)
          : selectedDay === 'all' 
            ? projectDays.map(day => day.id)
            : [selectedDay as number]

        // Prepare personnel assignments
        const personnel_assignments = pendingData.map(personnel => ({
          personnel_id: personnel.personnel_id,
          role_id: personnel.role_id
        }))

        // Call the mutation
        await addPersonnelMutation.mutateAsync({
          joNumber,
          project_day_ids: targetProjectDayIds,
          personnel_assignments
        })

        // Reset form
        setPersonnelRows([{
          id: '1',
          personnel_id: null,
          role_id: null,
          selectedPersonnel: null,
          selectedRole: null
        }])
        setPendingData([])
        setShowConfirmation(false)
        onCancel() // Close the modal
      } catch (error) {
        console.error('Error adding personnel:', error)
        // Handle error - could show toast notification here
      }
    }
  }

  const handleCancel = () => {
    // Reset form on cancel
    setPersonnelRows([{
      id: '1',
      personnel_id: null,
      role_id: null,
      selectedPersonnel: null,
      selectedRole: null
    }])
    onCancel()
  }

  const isFormValid = personnelRows.some(row => 
    row.personnel_id && row.role_id && row.selectedPersonnel && row.selectedRole
  )

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">
                  Add Personnel to Schedule
                </span>
              </div>
              <Button
                type="button"
                onClick={addNewRow}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
            </div>

            {/* Personnel Grid */}
            <div className="space-y-6">
              {personnelRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  {/* Row Number */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>

                  {/* Personnel Selection - Wider for better UX */}
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Personnel
                    </label>
                    <PersonnelSelector
                      value={row.personnel_id}
                      onChange={(personnelId, personnelData) => handlePersonnelChange(row.id, personnelId, personnelData)}
                      placeholder="Choose personnel..."
                      allowCreate={true}
                      className="min-w-0"
                    />
                  </div>

                  {/* Role Selection - Wider for better UX */}
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Role
                    </label>
                    <RoleSelector
                      value={row.role_id}
                      onChange={(roleId, roleData) => handleRoleChange(row.id, roleId, roleData)}
                      placeholder="Choose role..."
                      allowCreate={true}
                      className="min-w-0"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-end justify-center">
                    {personnelRows.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="p-3 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 transform hover:scale-110 transition-all duration-200"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {/* Personnel Info Display */}
                  {row.selectedPersonnel && row.selectedRole && (
                    <div className="col-span-12 mt-2 p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {row.selectedPersonnel.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {row.selectedPersonnel.contact_number}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {row.selectedRole.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Apply to All Days Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Apply to all project days
                </span>
                <span className="text-xs text-gray-500">
                  Add these personnel to every day in the project schedule
                </span>
              </div>
              <button
                type="button"
                onClick={() => setApplyToAllDays(!applyToAllDays)}
                className="flex items-center transition-colors duration-200"
              >
                {applyToAllDays ? (
                  <ToggleRight className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>

            {/* Summary */}
            {personnelRows.some(row => row.personnel_id && row.role_id) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Personnel to Add ({personnelRows.filter(row => row.personnel_id && row.role_id).length})
                </h4>
                <div className="space-y-1">
                  {personnelRows
                    .filter(row => row.personnel_id && row.role_id && row.selectedPersonnel && row.selectedRole)
                    .map((row, index) => (
                      <div key={row.id} className="text-xs text-green-700">
                        {index + 1}. {row.selectedPersonnel.name} - {row.selectedRole.name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              {personnelRows.filter(row => row.personnel_id && row.role_id).length} personnel ready to add
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
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
                  <>Add {personnelRows.filter(row => row.personnel_id && row.role_id).length} Personnel</>
                )}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirm Add Personnel"
        message={`Are you sure you want to add ${pendingData.length} personnel to the project${applyToAllDays ? ' for all days' : ''}?`}
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