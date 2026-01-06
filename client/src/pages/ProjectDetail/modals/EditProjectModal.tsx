import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, AlertTriangle, RefreshCw } from 'lucide-react'
import { ConfirmationModal } from '@/components/ui'
import { useUpdateProject } from '@/hooks/useProjects'

// Form validation schema
const editProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(255, 'Project name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  cancellation_reason: z
    .string()
    .max(500, 'Cancellation reason must not exceed 500 characters')
    .optional()
})

type EditProjectFormData = z.infer<typeof editProjectSchema>

interface EditProjectModalProps {
  isOpen: boolean
  project: any
  projectDays?: any[]
  onClose: () => void
}

const EditProjectModal: FC<EditProjectModalProps> = ({
  isOpen,
  project,
  projectDays = [],
  onClose
}) => {
  const updateProjectMutation = useUpdateProject()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema)
  })

  const [showCancelProject, setShowCancelProject] = useState(false)
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [showReactivateConfirmation, setShowReactivateConfirmation] = useState(false)

  const watchedCancellationReason = watch('cancellation_reason')

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      reset({
        name: project.name || project.project_name || '',
        description: project.description || '',
        cancellation_reason: ''
      })
      setShowCancelProject(false)
    }
  }, [project, reset])

  // Determine what status to set when reactivating
  const getReactivationStatus = (): 'upcoming' | 'ongoing' => {
    if (!projectDays || projectDays.length === 0) {
      return 'upcoming'
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const hasCurrentOrPastDay = projectDays.some(day => {
      const dayDate = new Date(day.project_date)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate <= today
    })

    return hasCurrentOrPastDay ? 'ongoing' : 'upcoming'
  }

  // Close modal directly after successful action (no discard confirmation)
  const closeModalDirectly = () => {
    reset()
    setShowCancelProject(false)
    setShowDiscardConfirmation(false)
    setShowCancelConfirmation(false)
    setShowReactivateConfirmation(false)
    onClose()
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!project) return

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id || project.project_id,
        data: {
          name: data.name,
          description: data.description || undefined
        }
      })
      closeModalDirectly()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  })

  const handleCancelProject = async () => {
    if (!project || !watchedCancellationReason?.trim()) return

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id || project.project_id,
        data: {
          status: 'cancelled',
          cancellation_reason: watchedCancellationReason.trim()
        }
      })
      closeModalDirectly()
    } catch (error) {
      console.error('Error cancelling project:', error)
    }
  }

  const handleReactivateProject = async () => {
    if (!project) return

    const newStatus = getReactivationStatus()

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id || project.project_id,
        data: {
          status: newStatus
        }
      })
      closeModalDirectly()
    } catch (error) {
      console.error('Error reactivating project:', error)
    }
  }

  const handleClose = () => {
    if (isDirty || showCancelProject) {
      setShowDiscardConfirmation(true)
    } else {
      closeModalDirectly()
    }
  }

  const handleConfirmDiscard = () => {
    closeModalDirectly()
  }

  const isCancelled = project?.status === 'cancelled'

  if (!isOpen && !showDiscardConfirmation && !showCancelConfirmation && !showReactivateConfirmation) return null

  return (
    <>
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Edit Project</h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-5 space-y-4">
                {/* Cancelled Project Notice */}
                {isCancelled && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">This project is cancelled</p>
                        {project.cancellation_reason && (
                          <p className="text-sm text-red-700 mt-1">
                            Reason: {project.cancellation_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter project description (optional)"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* JO Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    JO Number
                  </label>
                  <input
                    type="text"
                    value={project?.jo_number || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">JO Number cannot be changed</p>
                </div>

                {/* Reactivate Button for Cancelled Projects */}
                {isCancelled && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReactivateConfirmation(true)}
                      disabled={updateProjectMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reactivate Project
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Status will be set to "{getReactivationStatus()}" based on project dates
                    </p>
                  </div>
                )}

                {/* Cancel Project Section - Only for non-cancelled projects */}
                {!isCancelled && (
                  <div className="pt-2 border-t">
                    {!showCancelProject ? (
                      <button
                        type="button"
                        onClick={() => setShowCancelProject(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Cancel Project
                      </button>
                    ) : (
                      <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Cancel this project?</p>
                            <p className="text-xs text-red-700 mt-0.5">This action can be reversed by reactivating the project later.</p>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="cancellation_reason" className="block text-sm font-medium text-red-800 mb-1">
                            Cancellation Reason <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="cancellation_reason"
                            {...register('cancellation_reason')}
                            rows={2}
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            placeholder="Please provide a reason for cancellation..."
                          />
                          {errors.cancellation_reason && (
                            <p className="text-red-500 text-sm mt-1">{errors.cancellation_reason.message}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCancelProject(false)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirmation(true)}
                            disabled={!watchedCancellationReason?.trim() || updateProjectMutation.isPending}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Confirm Cancellation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={updateProjectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProjectMutation.isPending || !isDirty}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateProjectMutation.isPending ? (
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

      {/* Discard Changes Confirmation */}
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

      {/* Cancel Project Confirmation */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        type="delete"
        title="Cancel Project?"
        message={`Are you sure you want to cancel this project? Reason: "${watchedCancellationReason?.trim()}"`}
        onConfirm={() => {
          setShowCancelConfirmation(false)
          handleCancelProject()
        }}
        onClose={() => setShowCancelConfirmation(false)}
        confirmText={updateProjectMutation.isPending ? "Cancelling..." : "Yes, Cancel Project"}
        cancelText="No, Go Back"
      />

      {/* Reactivate Project Confirmation */}
      <ConfirmationModal
        isOpen={showReactivateConfirmation}
        type="update"
        title="Reactivate Project?"
        message={`This will reactivate the project and set its status to "${getReactivationStatus()}". Do you want to continue?`}
        onConfirm={() => {
          setShowReactivateConfirmation(false)
          handleReactivateProject()
        }}
        onClose={() => setShowReactivateConfirmation(false)}
        confirmText={updateProjectMutation.isPending ? "Reactivating..." : "Yes, Reactivate"}
        cancelText="Cancel"
      />
    </>
  )
}

export default EditProjectModal
