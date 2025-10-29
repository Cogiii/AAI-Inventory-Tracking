import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationModal } from '@/components/ui'
import { Users, User, Phone, Calendar, Briefcase, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import AddPersonnelForm from '../modals/AddPersonnelForm'
import { useProjectDetail, usePersonnelRoles, useRemovePersonnel } from '@/hooks/useProjectDetail'


interface ProjectPersonnelProps {
  joNumber?: string
}

const ProjectPersonnel: FC<ProjectPersonnelProps> = ({ joNumber }) => {
  // All hooks must be called at the top level, before any early returns
  const { data: projectData, isLoading: projectLoading, error: projectError } = useProjectDetail(joNumber)
  const removePersonnelMutation = useRemovePersonnel()
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [applyToAllDays, setApplyToAllDays] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    personnel: any
    dayId: number
  }>({ 
    isOpen: false, 
    personnel: null, 
    dayId: 0 
  })

  if (!joNumber) return null

  if (projectLoading) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading project personnel...</p>
        </CardContent>
      </Card>
    )
  }

  if (projectError || !projectData) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Error loading project personnel</p>
        </CardContent>
      </Card>
    )
  }

  const projectDays = projectData.project_days || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
  }

  // Get personnel for display based on selected day
  const getDisplayPersonnel = () => {
    if (selectedDay === 'all') {
      // Combine all personnel from all days
      const allPersonnel: any[] = []
      projectDays.forEach(day => {
        allPersonnel.push(...day.personnel)
      })
      return allPersonnel
    }
    // Find the specific day and return its personnel
    const targetDay = projectDays.find(day => day.id === selectedDay)
    return targetDay ? targetDay.personnel : []
  }

  const displayPersonnel = getDisplayPersonnel()

  // Group personnel by role for better organization
  const groupedPersonnel = displayPersonnel.reduce((acc: Record<string, any[]>, person: any) => {
    const role = person.role_name
    if (!acc[role]) {
      acc[role] = []
    }
    acc[role].push(person)
    return acc
  }, {})

  const handleDeletePersonnel = async (personnelId: number, roleId: number, dayId: number) => {
    try {
      await removePersonnelMutation.mutateAsync({
        joNumber: joNumber!,
        projectDayId: dayId,
        personnelId,
        roleId
      })
    } catch (error) {
      console.error('Error removing personnel:', error)
    }
  }

  const handleDeleteClick = (personnel: any, dayId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      personnel,
      dayId
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.personnel) {
      handleDeletePersonnel(
        deleteConfirmation.personnel.personnel_id, 
        deleteConfirmation.personnel.role_id, 
        deleteConfirmation.dayId
      )
      setDeleteConfirmation({ isOpen: false, personnel: null, dayId: 0 })
    }
  }

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-custom">
            <Users className="h-5 w-5" />
            Project Personnel ({displayPersonnel.length})
          </CardTitle>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Personnel
          </button>
        </div>
        
        {/* Day Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedDay === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Days
          </button>
          {projectDays.map(day => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedDay === day.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Calendar className="h-3 w-3 inline mr-1" />
              {formatDate(day.project_date)}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayPersonnel.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No personnel assigned {selectedDay === 'all' ? 'to this project' : 'for this day'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPersonnel).map(([role, personnel]) => (
              <div key={role}>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {role} ({(personnel as any[]).length})
                </h4>
                <div className="space-y-2">
                  {(personnel as any[]).map((person: any, index: number) => (
                    <Card key={`${person.personnel_id}-${person.role_id}-${person.project_day_id}-${index}`} className="bg-white hover:shadow-sm transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-800">
                              {getInitials(person.personnel_name)}
                            </span>
                          </div>
                          
                          {/* Person Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {person.personnel_name}
                              </h4>
                              <div className="flex items-center gap-2">
                                {selectedDay === 'all' && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    Day {projectDays.findIndex(d => d.id === person.project_day_id) + 1}
                                  </span>
                                )}
                                {!person.is_active && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                    Inactive
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteClick(person, person.project_day_id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove from project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{person.contact_number}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Summary Stats */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Active:</span>
                  </div>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {displayPersonnel.filter(p => p.is_active).length}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Roles:</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {Object.keys(groupedPersonnel).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Personnel Form Modal */}
        <AddPersonnelForm
          isOpen={showAddForm}
          joNumber={joNumber!}
          projectDays={projectDays}
          selectedDay={selectedDay}
          applyToAllDays={applyToAllDays}
          setApplyToAllDays={setApplyToAllDays}
          onCancel={() => {
            setShowAddForm(false)
            setApplyToAllDays(false)
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          type="delete"
          title="Remove Personnel"
          message={`Are you sure you want to remove "${deleteConfirmation.personnel?.personnel_name}" from this project? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmation({ isOpen: false, personnel: null, dayId: 0 })}
        />
      </CardContent>
    </Card>
  )
}



export default ProjectPersonnel