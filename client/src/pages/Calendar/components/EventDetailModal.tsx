import type { FC } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { MapPin, Eye, Building2 } from 'lucide-react'

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: number
    jo_number: string
    name: string
    status: string
    location: string
  } | null
  onViewProject: (joNumber: string) => void
}

const EventDetailModal: FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onViewProject
}) => {
  if (!event) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'upcoming':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Event Details" size="sm">
      <ModalBody>
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>

          {/* Project Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">JO Number:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {event.jo_number}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location:</span>
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button 
          type="button"
          onClick={() => {
            onViewProject(event.jo_number)
            onClose()
          }}
          className="flex-1 flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Project
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default EventDetailModal