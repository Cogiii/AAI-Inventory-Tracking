import { useState } from 'react'
import type { FC } from 'react'
import { Calendar, MapPin, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react'
import AddDayForm from '../modals/AddDayForm'
import EditDayForm from '../modals/EditDayForm'
import DeleteDayModal from '../modals/DeleteDayModal'
import CompleteDayModal from '../modals/CompleteDayModal'
import { useProjectDetail, useDeleteProjectDay } from '@/hooks/useProjectDetail'

interface ProjectDaysProps {
  joNumber?: string
}

const ProjectDays: FC<ProjectDaysProps> = ({ joNumber }) => {
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber)
  const deleteProjectDayMutation = useDeleteProjectDay()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDay, setEditingDay] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    day: any
  }>({
    isOpen: false,
    day: null
  })
  const [completeDayModal, setCompleteDayModal] = useState<{
    isOpen: boolean
    day: any
  }>({
    isOpen: false,
    day: null
  })

  if (!joNumber) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading schedule...</p>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">Error loading schedule</p>
      </div>
    )
  }

  const projectDays = projectData.project_days || []

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'ongoing':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'past_scheduled':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const handleDeleteClick = (day: any) => {
    setDeleteConfirmation({ isOpen: true, day })
  }

  const handleConfirmDelete = async (forceDelete: boolean) => {
    if (deleteConfirmation.day && joNumber) {
      try {
        await deleteProjectDayMutation.mutateAsync({
          joNumber,
          id: deleteConfirmation.day.id,
          force: forceDelete
        })
        setDeleteConfirmation({ isOpen: false, day: null })
      } catch (error) {
        console.error('Error deleting project day:', error)
      }
    }
  }

  const getDayStatus = (day: any) => {
    if (day.day_status === 'completed') return 'completed'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const projectDate = new Date(day.project_date)
    projectDate.setHours(0, 0, 0, 0)
    if (projectDate.getTime() === today.getTime()) return 'ongoing'
    if (projectDate < today) return 'past_scheduled'
    return 'scheduled'
  }

  const isDayEditable = (day: any) => day.day_status !== 'completed'

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Schedule</h2>
          <span className="text-sm text-gray-500">({projectDays.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {projectDays.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No days scheduled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectDays.map((day, index) => {
              const dayStatus = getDayStatus(day)
              const isEditable = isDayEditable(day)
              const isCompleted = day.day_status === 'completed'

              return (
                <div
                  key={day.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStatusStyle(dayStatus)}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <span className="w-6 h-6 flex items-center justify-center text-xs font-medium bg-white rounded-full border flex-shrink-0">
                        {index + 1}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{formatDate(day.project_date)}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {day.location_name || 'No location'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isCompleted && (
                      <Lock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    )}
                    {!isCompleted && (
                      <button
                        onClick={() => setCompleteDayModal({ isOpen: true, day })}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Complete"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {isEditable && (
                      <button
                        onClick={() => setEditingDay(day)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {isEditable && dayStatus === 'scheduled' && (
                      <button
                        onClick={() => handleDeleteClick(day)}
                        disabled={deleteProjectDayMutation.isPending}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Day Form Modal */}
        <AddDayForm
          isOpen={showAddForm}
          joNumber={joNumber}
          onCancel={() => setShowAddForm(false)}
        />

        {/* Edit Day Form Modal */}
        <EditDayForm
          isOpen={!!editingDay}
          day={editingDay}
          joNumber={joNumber}
          existingDates={
            projectData?.project_days
              ?.filter(d => d.id !== editingDay?.id)
              .map(d => {
                const date = new Date(d.project_date)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const dayNum = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${dayNum}`
              }) || []
          }
          onCancel={() => setEditingDay(null)}
        />

        {/* Delete Confirmation Modal */}
        <DeleteDayModal
          isOpen={deleteConfirmation.isOpen}
          day={deleteConfirmation.day}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmation({ isOpen: false, day: null })}
          isDeleting={deleteProjectDayMutation.isPending}
        />

        {/* Complete Day Modal */}
        <CompleteDayModal
          isOpen={completeDayModal.isOpen}
          day={completeDayModal.day}
          onClose={() => setCompleteDayModal({ isOpen: false, day: null })}
        />
      </div>
    </div>
  )
}

export default ProjectDays