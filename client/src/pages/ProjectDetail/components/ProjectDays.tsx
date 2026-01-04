import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Clock, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react'
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
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading project days...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !projectData) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Error loading project days</p>
        </CardContent>
      </Card>
    )
  }

  const projectDays = projectData.project_days || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scheduled':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'past_scheduled':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ongoing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-orange-600" />
      case 'past_scheduled':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'ongoing':
        return 'Ongoing'
      case 'scheduled':
        return 'Scheduled'
      case 'past_scheduled':
        return 'Pending Completion'
      default:
        return 'Unknown'
    }
  }

  const getLocationDisplay = (day: any) => {
    if (day.full_address) {
      return day.full_address
    }
    return day.location_name || 'No location specified'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  // No longer needed - AddDayForm and EditDayForm handle mutations internally

  const handleDeleteClick = (day: any) => {
    setDeleteConfirmation({
      isOpen: true,
      day
    })
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
        // Keep confirmation modal open to allow retry
      }
    }
  }

  // Get day status from backend or calculate based on date for display purposes
  const getDayStatus = (day: any) => {
    // If the day has been completed via the Complete Day button, use that status
    if (day.day_status === 'completed') return 'completed'

    // Otherwise, calculate based on date for visual indicator
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const projectDate = new Date(day.project_date)
    projectDate.setHours(0, 0, 0, 0)

    if (projectDate.getTime() === today.getTime()) return 'ongoing'
    if (projectDate < today) return 'past_scheduled' // Past but not completed
    return 'scheduled'
  }

  // Check if day is editable (only scheduled days that haven't been completed)
  const isDayEditable = (day: any) => {
    return day.day_status !== 'completed'
  }

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-custom">
            <Calendar className="h-5 w-5" />
            Project Schedule & Locations
          </CardTitle>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Day
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {projectDays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No project days scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectDays.map((day, index) => {
              const dayStatus = getDayStatus(day)
              const isEditable = isDayEditable(day)
              const isCompleted = day.day_status === 'completed'
              return (
                <Card key={day.id} className={`bg-white hover:shadow-sm transition-shadow ${isCompleted ? 'border-green-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(dayStatus)}
                          <h3 className="font-medium text-base text-gray-900">
                            Day {index + 1}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(dayStatus)}`}>
                            {getStatusLabel(dayStatus)}
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Lock className="h-3 w-3" />
                              Locked
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(day.project_date)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Planned:</span>
                            <span className="text-xs">{formatDate(day.created_at)}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">Location:</span>
                            <p className="text-sm text-gray-600 mt-1">{getLocationDisplay(day)}</p>
                          </div>
                        </div>

                        {/* Completed By Info */}
                        {isCompleted && day.completed_by_name && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <span>Completed by </span>
                            <span className="font-medium text-gray-700">{day.completed_by_name}</span>
                            {day.completed_at && (
                              <span> on {formatDate(day.completed_at)}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {/* Complete Day Button - only show for non-completed days */}
                          {!isCompleted && (
                            <button
                              onClick={() => setCompleteDayModal({ isOpen: true, day })}
                              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                              title="Complete this day"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Complete
                            </button>
                          )}

                          {/* Edit Button - only show for editable days */}
                          {isEditable && (
                            <button
                              onClick={() => setEditingDay(day)}
                              className="p-2 text-blue-600 hover:bg-blue-50 hover:shadow-lg rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit day"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete Button - only show for scheduled editable days */}
                          {isEditable && dayStatus === 'scheduled' && (
                            <button
                              onClick={() => handleDeleteClick(day)}
                              disabled={deleteProjectDayMutation.isPending}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                deleteProjectDayMutation.isPending
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-50 hover:shadow-lg hover:scale-110'
                              }`}
                              title={deleteProjectDayMutation.isPending ? "Deleting..." : "Delete day"}
                            >
                              {deleteProjectDayMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            // Get all project day dates except the one being edited
            projectData?.project_days
              ?.filter(d => d.id !== editingDay?.id)
              .map(d => {
                const date = new Date(d.project_date)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
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
      </CardContent>
    </Card>
  )
}

export default ProjectDays