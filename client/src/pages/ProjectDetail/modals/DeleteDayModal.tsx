import { useState } from 'react'
import type { FC } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertCircle, Info, Calendar, Package } from 'lucide-react'

interface DeleteDayModalProps {
  isOpen: boolean
  day: any
  onConfirm: (forceDelete: boolean) => void
  onClose: () => void
  isDeleting: boolean
}

const DeleteDayModal: FC<DeleteDayModalProps> = ({
  isOpen,
  day,
  onConfirm,
  onClose,
  isDeleting
}) => {
  const [overrideChecked, setOverrideChecked] = useState(false)
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  const hasItems = day?.items && day.items.length > 0
  const itemCount = day?.items?.length || 0

  const formatDate = (dateString: string) => {
    if (!dateString) return 'the selected date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const handleConfirm = () => {
    onConfirm(overrideChecked)
    // Reset state after confirming
    setOverrideChecked(false)
    setShowInfoTooltip(false)
  }

  const handleClose = () => {
    setOverrideChecked(false)
    setShowInfoTooltip(false)
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Delete Project Day"
      size="md"
    >
      <ModalBody className="space-y-4">
        {/* Warning Header */}
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-900">
            Warning: You are about to delete a project day
          </p>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {formatDate(day?.project_date)}
            </p>
            {day?.location_name && (
              <p className="text-xs text-gray-600 mt-0.5">
                at {day.location_name}
              </p>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {hasItems ? (
          <div className="space-y-4">
            {/* Items Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    This project day has {itemCount} allocated {itemCount === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    You must either delete all items from this day first, or check the override option below.
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-2">Allocated Items:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto compact-scrollbar">
                  {day.items.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between text-xs bg-white/50 px-2 py-1.5 rounded"
                    >
                      <span className="font-medium text-gray-900">
                        {item.item_name}
                        {item.brand_name && (
                          <span className="text-gray-600 ml-1">({item.brand_name})</span>
                        )}
                      </span>
                      <span className="text-amber-700 font-semibold">
                        Qty: {item.allocated_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Override Checkbox */}
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="override-delete"
                  checked={overrideChecked}
                  onChange={(e) => setOverrideChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="override-delete" 
                    className="text-sm font-medium text-red-900 cursor-pointer flex items-center gap-2"
                  >
                    Override and force delete
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onMouseEnter={() => setShowInfoTooltip(true)}
                        onMouseLeave={() => setShowInfoTooltip(false)}
                        className="p-0.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      
                      {/* Tooltip */}
                      <div 
                        role="tooltip" 
                        className={`absolute z-[9999] w-64 px-3 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none ${
                          showInfoTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                        style={{
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="space-y-1.5">
                          <p className="font-semibold text-amber-300">⚠️ Warning:</p>
                          <p className="text-xs leading-relaxed">
                            Enabling this will permanently delete this project day along with 
                            all <strong>{itemCount}</strong> allocated {itemCount === 1 ? 'item' : 'items'}. 
                            The items will be returned to inventory, but all allocation records will be lost.
                          </p>
                          <p className="text-amber-300 font-semibold text-xs mt-2">
                            This action cannot be undone!
                          </p>
                        </div>
                        {/* Arrow pointing down to button */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1f2937'
                          }}
                        ></div>
                      </div>
                    </div>
                  </label>
                  <p className="text-xs text-red-700 mt-1">
                    Check this box to delete the project day and all associated items
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Are you sure you want to delete this project day?
            </p>
            <p className="text-xs text-blue-700 mt-2">
              This action cannot be undone.
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClose}
          disabled={isDeleting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting || (hasItems && !overrideChecked)}
          className={`flex-1 ${
            hasItems && !overrideChecked
              ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete Day'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteDayModal
