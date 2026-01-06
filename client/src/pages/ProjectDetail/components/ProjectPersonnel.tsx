import { useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '@/components/ui'
import { Users, Plus, Trash2, Loader2, AlertTriangle, Lock } from 'lucide-react'
import AddPersonnelForm from '@/pages/ProjectDetail/modals/AddPersonnelForm'
import { useProjectDetail, useRemovePersonnel } from '@/hooks/useProjectDetail'
import { useProjectDetailModalStore } from '@/stores/useProjectDetailModalStore'

interface ProjectPersonnelProps {
  joNumber?: string
}

const ProjectPersonnel: FC<ProjectPersonnelProps> = ({ joNumber }) => {
  const { data: projectData, isLoading: projectLoading, error: projectError } = useProjectDetail(joNumber)
  const removePersonnelMutation = useRemovePersonnel()
  const { openAddDayModal } = useProjectDetailModalStore()
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [applyToAllDays, setApplyToAllDays] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    personnel: any
    dayId: number
  }>({ isOpen: false, personnel: null, dayId: 0 })

  if (!joNumber) return null

  if (projectLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading personnel...</p>
      </div>
    )
  }

  if (projectError || !projectData) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">Error loading personnel</p>
      </div>
    )
  }

  const projectDays = projectData.project_days || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const getDisplayPersonnel = () => {
    if (selectedDay === 'all') {
      const allPersonnel: any[] = []
      projectDays.forEach(day => allPersonnel.push(...day.personnel))
      return allPersonnel
    }
    const targetDay = projectDays.find(day => day.id === selectedDay)
    return targetDay ? targetDay.personnel : []
  }

  const displayPersonnel = getDisplayPersonnel()

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
    setDeleteConfirmation({ isOpen: true, personnel, dayId })
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
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Personnel</h2>
          <span className="text-sm text-gray-500">({displayPersonnel.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Day Filter */}
      {projectDays.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              selectedDay === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            All
          </button>
          {projectDays.map((day) => {
            const isCompleted = day.day_status === 'completed'
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  selectedDay === day.id
                    ? isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                    : isCompleted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {isCompleted && <Lock className="h-3 w-3" />}
                {formatDate(day.project_date)}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {displayPersonnel.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No personnel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayPersonnel.map((person: any, index: number) => (
              <div
                key={`${person.personnel_id}-${person.role_id}-${person.project_day_id}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-700">
                      {getInitials(person.personnel_name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{person.personnel_name}</p>
                    <p className="text-xs text-gray-500">{person.role_name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteClick(person, person.project_day_id)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <AddPersonnelForm
          isOpen={showAddForm}
          joNumber={joNumber!}
          projectDays={projectDays}
          selectedDay={selectedDay}
          applyToAllDays={applyToAllDays}
          setApplyToAllDays={setApplyToAllDays}
          onCancel={() => { setShowAddForm(false); setApplyToAllDays(false) }}
          onOpenAddDay={openAddDayModal}
        />

        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          type="delete"
          title="Remove Personnel"
          message={`Remove "${deleteConfirmation.personnel?.personnel_name}" from this project?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmation({ isOpen: false, personnel: null, dayId: 0 })}
        />
      </div>
    </div>
  )
}

export default ProjectPersonnel
