import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar, Loader2, X, AlertCircle } from 'lucide-react'
import { ConfirmationModal } from '@/components/ui'
import { useUpdateProjectDay, useLocations } from '@/hooks/useProjectDetail'
import { UpdateProjectDaySchema, type UpdateProjectDayData } from '@/schemas/project-detail'

interface EditDayFormProps {
  isOpen: boolean
  day: any
  joNumber?: string
  existingDates?: string[]
  onCancel: () => void
}

const EditDayForm: FC<EditDayFormProps> = ({
  isOpen,
  day,
  joNumber,
  existingDates = [],
  onCancel
}) => {
  const updateProjectDayMutation = useUpdateProjectDay()
  const { data: locationsData } = useLocations()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<UpdateProjectDayData>({
    resolver: zodResolver(UpdateProjectDaySchema)
  })

  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false)

  const watchedValues = watch()

  useEffect(() => {
    if (day && locationsData) {
      const location = locationsData.find(loc => loc.id === day.location_id)

      const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${d}`
      }

      reset({
        project_date: formatDateForInput(day.project_date),
        location_id: day.location_id || undefined
      })

      setSelectedLocation(location || null)
    }
  }, [day, locationsData, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!selectedLocation || !joNumber || !day) return

    try {
      await updateProjectDayMutation.mutateAsync({
        joNumber,
        id: day.id,
        project_date: data.project_date,
        location_id: data.location_id
      })
      handleCancel()
    } catch (error) {
      console.error('Error updating project day:', error)
    }
  })

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardConfirmation(true)
    } else {
      handleConfirmDiscard()
    }
  }

  const handleConfirmDiscard = () => {
    reset()
    setSelectedLocation(null)
    setShowDiscardConfirmation(false)
    onCancel()
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Check for date conflict
  const isDateConflict = !!(watchedValues.project_date && existingDates.includes(watchedValues.project_date))

  if (!isOpen && !showDiscardConfirmation) return null

  return (
    <>
    {isOpen && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Project Day</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-5 space-y-4">
            {/* Completed Day Notice */}
            {day?.status === 'completed' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                Completed days can only have their location updated.
              </div>
            )}

            {/* Date */}
            <div>
              <label htmlFor="project_date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="project_date"
                  {...register('project_date')}
                  min={day?.status === 'completed' ? undefined : getTomorrowDate()}
                  disabled={day?.status === 'completed'}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    day?.status === 'completed'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isDateConflict
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.project_date && (
                <p className="text-red-500 text-sm mt-1">{errors.project_date.message}</p>
              )}
              {isDateConflict && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  This date already exists
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <LocationSelector
                value={watchedValues.location_id}
                onChange={(locationId, locationData) => {
                  setValue('location_id', locationId || undefined)
                  setSelectedLocation(locationData)
                }}
                placeholder="Select location..."
                allowCreate={true}
                locations={locationsData || []}
              />
              {errors.location_id && (
                <p className="text-red-500 text-sm mt-1">{errors.location_id.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateProjectDayMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProjectDayMutation.isPending || !selectedLocation || isDateConflict}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateProjectDayMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )}

  <ConfirmationModal
    isOpen={showDiscardConfirmation}
    type="warning"
    title="Discard Changes?"
    message="You have unsaved changes. Are you sure you want to discard them?"
    onConfirm={handleConfirmDiscard}
    onClose={() => setShowDiscardConfirmation(false)}
    confirmText="Discard"
    cancelText="Keep Editing"
  />
  </>
  )
}

export default EditDayForm
