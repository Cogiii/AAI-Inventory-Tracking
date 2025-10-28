import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar, ToggleLeft, ToggleRight } from 'lucide-react'

interface AddDayFormProps {
  isOpen: boolean
  onSave: (day: any) => void
  onCancel: () => void
}

const AddDayForm: React.FC<AddDayFormProps> = ({
  isOpen,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    project_date: '',
    location_id: null as number | null,
    status: 'scheduled'
  })
  
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [applyToMultipleDays, setApplyToMultipleDays] = useState(false)
  const [additionalDays, setAdditionalDays] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.project_date || !formData.location_id || !selectedLocation) {
      return
    }

    let daysToAdd = [formData]
    
    // If applying to multiple days, create entries for additional days
    if (applyToMultipleDays && additionalDays.length > 0) {
      daysToAdd = [
        formData,
        ...additionalDays.map(date => ({
          ...formData,
          project_date: date,
          id: Date.now() + Math.random(), // Temporary ID
          created_at: new Date().toISOString()
        } as any))
      ]
    } else {
      daysToAdd = [{
        ...formData,
        id: Date.now(), // Will be replaced with proper ID from backend
        created_at: new Date().toISOString()
      } as any]
    }

    setPendingData(daysToAdd)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    // If pendingData is an array (multiple days), save each one
    if (Array.isArray(pendingData)) {
      pendingData.forEach(dayData => onSave(dayData))
    } else {
      onSave(pendingData)
    }
    handleReset()
  }

  const handleCancel = () => {
    handleReset()
    onCancel()
  }

  const handleReset = () => {
    setFormData({
      project_date: '',
      location_id: null,
      status: 'scheduled'
    })
    setSelectedLocation(null)
    setApplyToMultipleDays(false)
    setAdditionalDays([])
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
      <Modal isOpen={isOpen && !showConfirmation} onClose={handleCancel} title="Add Project Day" size="lg">
        <form onSubmit={handleSubmit}>
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
                value={formData.project_date}
                min={getTomorrowDate()}
                onChange={(e) => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Location
              </label>
              <LocationSelector
                value={formData.location_id}
                onChange={(locationId, locationData) => {
                  setFormData(prev => ({ ...prev, location_id: locationId }))
                  setSelectedLocation(locationData)
                }}
                placeholder="Search or select project location..."
                allowCreate={true}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Apply to Multiple Days Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setApplyToMultipleDays(!applyToMultipleDays)}
                  className="flex items-center gap-2 text-sm hover:bg-gray-200 hover:shadow-sm p-2 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                >
                  {applyToMultipleDays ? (
                    <ToggleRight className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                  Apply same location to multiple days
                </button>
              </div>
              
              {applyToMultipleDays && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Dates (with same location)
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2].map((index) => (
                      <input
                        key={index}
                        type="date"
                        value={additionalDays[index] || ''}
                        min={getTomorrowDate()}
                        onChange={(e) => {
                          const newDays = [...additionalDays]
                          if (e.target.value) {
                            newDays[index] = e.target.value
                          } else {
                            newDays.splice(index, 1)
                          }
                          setAdditionalDays(newDays.filter(Boolean))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Additional date ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Add up to 3 additional dates that will use the same location: "{selectedLocation?.name || 'Select location above'}"
                  </p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              className="flex-1 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 hover:bg-blue-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Add Day
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="update"
        title={Array.isArray(pendingData) && pendingData.length > 1 ? "Add Project Days" : "Add Project Day"}
        message={
          Array.isArray(pendingData) && pendingData.length > 1
            ? `Are you sure you want to add ${pendingData.length} project days at "${selectedLocation?.name || 'selected location'}"?`
            : `Are you sure you want to add a new project day scheduled for ${
                Array.isArray(pendingData) 
                  ? pendingData[0]?.project_date 
                  : pendingData?.project_date
              } at "${selectedLocation?.name || 'selected location'}"?`
        }
        onConfirm={handleConfirm}
        onClose={() => setShowConfirmation(false)}
        confirmText={Array.isArray(pendingData) && pendingData.length > 1 ? "Add Days" : "Add Day"}
      />
    </>
  )
}

export default AddDayForm