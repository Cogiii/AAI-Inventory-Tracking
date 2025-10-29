import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar, Loader2 } from 'lucide-react'
import { getLocations } from '@/utils/projectData'
import { useUpdateProjectDay } from '@/hooks/useProjectDetail'
import { UpdateProjectDaySchema, type UpdateProjectDayData } from '@/schemas/project-detail'

interface EditDayFormProps {
  isOpen: boolean
  day: any
  joNumber?: string
  onCancel: () => void
}

const EditDayForm: FC<EditDayFormProps> = ({
  isOpen,
  day,
  joNumber,
  onCancel
}) => {
  const updateProjectDayMutation = useUpdateProjectDay()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<UpdateProjectDayData>({
    resolver: zodResolver(UpdateProjectDaySchema)
  })
  
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<UpdateProjectDayData | null>(null)

  const watchedValues = watch()

  useEffect(() => {
    if (day) {
      const locations = getLocations()
      const location = locations.find(loc => loc.id === day.location_id)
      
      // Convert ISO date to yyyy-MM-dd format for date input (avoiding timezone issues)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        // Use local timezone to avoid date shifting
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      const formattedDate = formatDateForInput(day.project_date)
      
      reset({
        project_date: formattedDate,
        location_id: day.location_id || undefined
      })
      
      setSelectedLocation(location || null)
    }
  }, [day, reset])

  const handleFormSubmit = handleSubmit((data) => {
    if (!selectedLocation || !joNumber || !day) return

    setPendingData(data)
    setShowConfirmation(true)
  })

  const handleConfirmedUpdate = async () => {
    if (!pendingData || !day || !joNumber) return

    try {
      await updateProjectDayMutation.mutateAsync({
        joNumber,
        id: day.id,
        project_date: pendingData.project_date,
        location_id: pendingData.location_id
      })
      handleReset()
      onCancel() // Close the modal after successful update
    } catch (error) {
      console.error('Error updating project day:', error)
      // Keep confirmation modal open to allow retry
    }
  }

  const handleCancel = () => {
    handleReset()
    onCancel()
  }

  const handleReset = () => {
    reset()
    setSelectedLocation(null)
    setShowConfirmation(false)
    setPendingData(null)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <>
      <Modal isOpen={isOpen && !showConfirmation} onClose={handleCancel} title="Edit Project Day" size="lg">
        <form onSubmit={handleFormSubmit}>
          <ModalBody className="space-y-4">
            {/* Project Date */}
            <div>
              <label htmlFor="project_date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Date
              </label>
              <input
                type="date"
                id="project_date"
                {...register('project_date')}
                min={day?.status === 'completed' ? undefined : getTomorrowDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={day?.status === 'completed'}
              />
              {errors.project_date && (
                <p className="text-red-500 text-sm mt-1">{errors.project_date.message}</p>
              )}
              {day?.status === 'completed' && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Completed days cannot have their date changed
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Location
              </label>
              <LocationSelector
                value={watchedValues.location_id}
                onChange={(locationId, locationData) => {
                  setValue('location_id', locationId || undefined)
                  setSelectedLocation(locationData)
                }}
                placeholder="Search or select project location..."
                allowCreate={true}
              />
              {errors.location_id && (
                <p className="text-red-500 text-sm mt-1">{errors.location_id.message}</p>
              )}
            </div>

            {day?.status === 'completed' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  ℹ️ This is a completed project day. Only location can be updated.
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              disabled={updateProjectDayMutation.isPending}
              className="flex-1 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProjectDayMutation.isPending}
              className="flex-1 hover:bg-blue-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {updateProjectDayMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Day"
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="update"
        title="Update Project Day"
        message={
          `Are you sure you want to update this project day scheduled for ${
            pendingData?.project_date
          } at "${selectedLocation?.name || 'selected location'}"?`
        }
        onConfirm={handleConfirmedUpdate}
        onClose={() => setShowConfirmation(false)}
        confirmText={updateProjectDayMutation.isPending ? "Updating..." : "Update Day"}
      />
    </>
  )
}

export default EditDayForm