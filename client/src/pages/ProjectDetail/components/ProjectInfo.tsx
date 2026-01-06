import type { FC } from 'react'
import { ArrowLeft, Calendar, User, AlertCircle, Loader2, Edit, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjectDetail } from '@/hooks/useProjectDetail'
import { useProjectDetailModalStore } from '@/stores/useProjectDetailModalStore'
import PermissionGuard from '@/components/auth/PermissionGuard'
import EditProjectModal from '../modals/EditProjectModal'

interface ProjectInfoProps {
  joNumber?: string
}

const ProjectInfo: FC<ProjectInfoProps> = ({ joNumber }) => {
  const navigate = useNavigate()
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber)
  const { isEditProjectModalOpen, openEditProjectModal, closeEditProjectModal } = useProjectDetailModalStore()

  if (!joNumber) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">Invalid project number</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">
          {error ? 'Error loading project' : 'Project not found'}
        </p>
      </div>
    )
  }

  const project = projectData.project

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <PermissionGuard module="projects" action="edit">
                <button
                  onClick={openEditProjectModal}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit project"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </PermissionGuard>
            </div>
            <p className="text-sm text-gray-500 font-mono">{project.jo_number}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>

      {/* Cancellation Notice */}
      {project.status === 'cancelled' && project.cancellation_reason && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{project.cancellation_reason}</p>
        </div>
      )}

      {/* Project Details - Compact inline */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Created:</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">By:</span>
          <span>{project.created_by_name || 'Unknown'}</span>
        </div>
        {project.description && (
          <p className="w-full text-gray-600 pt-2 border-t border-gray-100 mt-2">
            {project.description}
          </p>
        )}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={project}
        projectDays={projectData.project_days}
        onClose={closeEditProjectModal}
      />
    </div>
  )
}

export default ProjectInfo