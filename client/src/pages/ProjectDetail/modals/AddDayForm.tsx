import { useState } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar, ToggleLeft, ToggleRight, Loader2, Plus, X, CalendarDays } from 'lucide-react'
import { useAddProjectDay, useProjectDetail } from '@/hooks/useProjectDetail'
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
      location_id: null,
      status: 'scheduled'
    }
  })

  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [applyToMultipleDays, setApplyToMultipleDays] = useState(false)
  const [additionalDays, setAdditionalDays] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<AddProjectDayData[]>([])

  const watchedValues = watch()

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

    let daysToAdd: AddProjectDayData[] = [data]
    
    // If applying to multiple days, create entries for additional days (filter out empty dates)
    if (applyToMultipleDays && additionalDays.length > 0) {
      const validAdditionalDays = additionalDays.filter(date => date.trim() !== '')
      if (validAdditionalDays.length > 0) {
        daysToAdd = [
          data as AddProjectDayData,
          ...validAdditionalDays.map(date => ({
            ...data,
            project_date: date,
            status: (data as AddProjectDayData).status
          } as AddProjectDayData))
        ]
      }
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

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Apply to Multiple Days Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={handleToggleMultipleDays}
                  className={`flex items-center gap-3 text-sm p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    applyToMultipleDays 
                      ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-2 border-blue-300 shadow-sm' 
                      : 'bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {applyToMultipleDays ? (
                    <ToggleRight className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Apply same location to multiple days</span>
                    <span className="text-xs opacity-75">
                      {applyToMultipleDays ? 'Click to disable' : 'Click to add multiple dates with same location'}
                    </span>
                  </div>
                </button>
              </div>
              
              {applyToMultipleDays && (
                <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Additional Dates
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      disabled={additionalDays.length >= 10}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                        additionalDays.length >= 10 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm hover:scale-105'
                      }`}
                      title={additionalDays.length >= 10 ? 'Maximum 10 dates allowed' : 'Add another date'}
                    >
                      <Plus className="h-3 w-3" />
                      Add Date
                    </button>
                  </div>
                  
                  {/* Scrollable container for dates */}
                  <div className="max-h-32 overflow-y-auto pr-2 compact-scrollbar">
                    <div className="space-y-2">
                      {additionalDays.map((date, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <div className="flex-1 relative">
                            <input
                              type="date"
                              value={date}
                              min={getTomorrowDate()}
                              onChange={(e) => handleDayChange(index, e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                              placeholder={`Date ${index + 1}`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                              {index + 1}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                            title="Remove this date"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info footer */}
                  <div className="mt-3 pt-2 border-t border-blue-200">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-blue-700 font-medium">
                          📍 Location: "{selectedLocation?.name || 'Select location above'}"
                        </p>
                        <p className="text-xs text-blue-600/80 mt-1">
                          All dates will use the same location. Add up to 10 additional dates.
                        </p>
                      </div>
                      <div className="text-xs text-blue-600/70 font-mono bg-blue-100 px-2 py-1 rounded">
                        {additionalDays.filter(d => d).length}/10
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex-col gap-3">
            {applyToMultipleDays && getTotalDaysCount() > 1 && (
              <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  ✅ Ready to create <strong>{getTotalDaysCount()} project days</strong> 
                  {selectedLocation && ` at "${selectedLocation.name}"`}
                </p>
              </div>
            )}
            <div className="flex gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={addProjectDayMutation.isPending}
                className="flex-1 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addProjectDayMutation.isPending}
                className="flex-1 hover:bg-blue-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
              {addProjectDayMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Days...
                </>
              ) : (
                <>
                  Add Day{getTotalDaysCount() > 1 ? 's' : ''}
                  {getTotalDaysCount() > 1 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                      {getTotalDaysCount()}
                    </span>
                  )}
                </>
              )}
              </Button>
            </div>
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