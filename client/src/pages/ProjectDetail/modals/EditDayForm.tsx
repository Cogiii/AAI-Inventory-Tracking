import { useState, useEffect } from 'react'
import type { FC, FormEvent } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui'
import LocationSelector from '@/components/ui/location-selector'
import { Calendar } from 'lucide-react'
import { getLocations } from '@/utils/projectData'

interface EditDayFormProps {
  isOpen: boolean
  day: any
  onSave: (day: any) => void
  onCancel: () => void
}

const EditDayForm: FC<EditDayFormProps> = ({
  isOpen,
  day,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    project_date: '',
    location_id: null as number | null,
    status: 'scheduled'
  })
  
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)

  useEffect(() => {
    if (day) {
      const locations = getLocations()
      const location = locations.find(loc => loc.id === day.location_id)
      
      setFormData({
        project_date: day.project_date || '',
        location_id: day.location_id || null,
        status: day.status || 'scheduled'
      })
      setSelectedLocation(location || null)
    }
  }, [day])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (!formData.project_date || !formData.location_id || !selectedLocation) {
      return
    }

    const dayData = {
      ...day,
      ...formData,
      updated_at: new Date().toISOString()
    }

    setPendingData(dayData)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    onSave(pendingData)
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
    setShowConfirmation(false)
    setPendingData(null)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const isStatusDisabled = (status: string) => {
    // Don't allow changing from completed to other statuses
    if (day?.status === 'completed' && status !== 'completed') {
      return true
    }
    return false
  }

  return (
    <>
      <Modal isOpen={isOpen && !showConfirmation} onClose={handleCancel} title="Edit Project Day" size="lg">
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
                min={day?.status === 'completed' ? undefined : getTomorrowDate()}
                onChange={(e) => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={day?.status === 'completed'}
                required
              />
              {day?.status === 'completed' && (
                <p className="text-xs text-gray-500 mt-1">Date cannot be modified for completed projects</p>
              )}
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
                <option value="scheduled" disabled={isStatusDisabled('scheduled')}>
                  Scheduled
                </option>
                <option value="ongoing" disabled={isStatusDisabled('ongoing')}>
                  Ongoing
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>
              {day?.status === 'completed' && (
                <p className="text-xs text-gray-500 mt-1">Completed projects can only remain completed</p>
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
              Update Day
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        type="update"
        title="Update Project Day"
        message={`Are you sure you want to update this project day? The changes will be saved immediately.`}
        onConfirm={handleConfirm}
        onClose={() => setShowConfirmation(false)}
        confirmText="Update"
      />
    </>
  )
}

export default EditDayForm