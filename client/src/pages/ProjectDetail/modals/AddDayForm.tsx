import { useState } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar, Loader2, Plus, X, AlertCircle } from 'lucide-react'
import { useAddProjectDay, useProjectDetail, useLocations } from '@/hooks/useProjectDetail'
import { AddProjectDaySchema, type AddProjectDayData } from '@/schemas/project-detail'

interface AddDayFormProps {
  isOpen: boolean
  joNumber?: string
  onCancel: () => void
}

const AddDayForm: FC<AddDayFormProps> = ({
  isOpen,
  joNumber,
  onCancel
}) => {
  const addProjectDayMutation = useAddProjectDay()
  const { data: projectData } = useProjectDetail(joNumber)
  const { data: locationsData } = useLocations()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AddProjectDayData>({
    resolver: zodResolver(AddProjectDaySchema),
    defaultValues: {
      project_date: '',
      location_id: null
    }
  })

  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [applyToMultipleDays, setApplyToMultipleDays] = useState(false)
  const [additionalDays, setAdditionalDays] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<AddProjectDayData[]>([])

  const watchedValues = watch()

  // Get existing project days dates
  const existingDates = projectData?.project_days?.map(day => {
    const date = new Date(day.project_date)
    return date.toISOString().split('T')[0]
  }) || []

  // Helper function to check if date is already added
  const isDateAlreadyAdded = (dateString: string) => {
    return existingDates.includes(dateString)
  }

  // Helper functions for managing additional days
  const handleToggleMultipleDays = () => {
    const newValue = !applyToMultipleDays
    setApplyToMultipleDays(newValue)
    
    // Initialize with one empty date when enabling
    if (newValue) {
      setAdditionalDays([''])
    } else {
      setAdditionalDays([])
    }
  }

  const handleAddDay = () => {
    if (additionalDays.length < 10) { // Max 10 additional dates
      setAdditionalDays([...additionalDays, ''])
    }
  }

  const handleRemoveDay = (index: number) => {
    const newDays = additionalDays.filter((_, i) => i !== index)
    setAdditionalDays(newDays)
    
    // If no days left, disable multiple days mode
    if (newDays.length === 0) {
      setApplyToMultipleDays(false)
    }
  }

  const handleDayChange = (index: number, value: string) => {
    const newDays = [...additionalDays]
    newDays[index] = value
    setAdditionalDays(newDays)
  }

  // Calculate total days that will be created
  const getTotalDaysCount = () => {
    const validAdditionalDays = additionalDays.filter(date => date.trim() !== '')
    return applyToMultipleDays ? 1 + validAdditionalDays.length : 1
  }

  const handleFormSubmit = handleSubmit((data) => {
    if (!selectedLocation || !joNumber || !projectData) return

    let daysToAdd: AddProjectDayData[] = []
    
    // Only add the main date if it's not already added
    if (!isDateAlreadyAdded(data.project_date)) {
      daysToAdd.push(data)
    }
    
    // If applying to multiple days, create entries for additional days (filter out empty and duplicate dates)
    if (applyToMultipleDays && additionalDays.length > 0) {
      const validAdditionalDays = additionalDays.filter(date => 
        date.trim() !== '' && !isDateAlreadyAdded(date)
      )
      if (validAdditionalDays.length > 0) {
        daysToAdd = [
          ...daysToAdd,
          ...validAdditionalDays.map(date => ({
            ...data,
            project_date: date
          } as AddProjectDayData))
        ]
      }
    }

    // Show warning if no valid dates to add
    if (daysToAdd.length === 0) {
      alert('All selected dates are already added to the project. Please select different dates.')
      return
    }

    setPendingData(daysToAdd)
    setShowConfirmation(true)
  })

  const handleConfirmedAdd = async () => {
    if (!joNumber || !projectData) return

    try {
      for (const dayData of pendingData) {
        await addProjectDayMutation.mutateAsync({
          joNumber,
          project_id: projectData.project.id,
          project_date: dayData.project_date,
          location_id: dayData.location_id || undefined
        })
      }
      handleReset()
      onCancel() // Close the modal after successful add
    } catch (error) {
      console.error('Error adding project day(s):', error)
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
    setApplyToMultipleDays(false)
    setAdditionalDays([])
    setShowConfirmation(false)
    setPendingData([])
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <>  
      <Modal isOpen={isOpen && !showConfirmation} onClose={handleCancel} title="Add Project Day" size="lg">
        <form onSubmit={handleFormSubmit}>
          <ModalBody className="space-y-4 overflow-y-auto max-h-[60vh] modal-scrollbar">
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
                min={getTomorrowDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.project_date && (
                <p className="text-red-500 text-sm mt-1">{errors.project_date.message}</p>
              )}
              {watchedValues.project_date && isDateAlreadyAdded(watchedValues.project_date) && (
                <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  This date is already added to the project
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
                locations={locationsData || []}
              />
              {errors.location_id && (
                <p className="text-red-500 text-sm mt-1">{errors.location_id.message}</p>
              )}
            </div>



            {/* Apply to Multiple Days Option */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToMultipleDays}
                  onChange={handleToggleMultipleDays}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Add multiple dates with same location</span>
              </label>

              {applyToMultipleDays && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Additional Dates
                    </label>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      disabled={additionalDays.length >= 10}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3 w-3" />
                      Add Date
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {additionalDays.map((date, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={date}
                            min={getTomorrowDate()}
                            onChange={(e) => handleDayChange(index, e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                              date && isDateAlreadyAdded(date)
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {date && isDateAlreadyAdded(date) && (
                          <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            This date is already added
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {additionalDays.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {additionalDays.filter(d => d).length} of 10 additional dates
                    </p>
                  )}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={addProjectDayMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addProjectDayMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addProjectDayMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                getTotalDaysCount() > 1 ? `Add ${getTotalDaysCount()} Days` : 'Add Day'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="update"
        title={pendingData.length > 1 ? "Add Project Days" : "Add Project Day"}
        message={
          pendingData.length > 1
            ? `Are you sure you want to add ${pendingData.length} project days at "${selectedLocation?.name || 'selected location'}"?`
            : `Are you sure you want to add a new project day scheduled for ${
                pendingData[0]?.project_date
              } at "${selectedLocation?.name || 'selected location'}"?`
        }
        onConfirm={handleConfirmedAdd}
        onClose={() => setShowConfirmation(false)}
        confirmText={addProjectDayMutation.isPending ? "Adding..." : (pendingData.length > 1 ? "Add Days" : "Add Day")}
      />
    </>
  )
}

export default AddDayForm