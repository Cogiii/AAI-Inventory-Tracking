import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FolderOpen, Calendar, User, AlertCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjectDetail } from '@/hooks/useProjectDetail'



interface ProjectInfoProps {
  joNumber?: string
}

const ProjectInfo: FC<ProjectInfoProps> = ({ joNumber }) => {
  const navigate = useNavigate()
  const { data: projectData, isLoading, error } = useProjectDetail(joNumber)
  
  if (!joNumber) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Invalid project number</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading project information...</p>
        </CardContent>
      </Card>
    )
  }
  
  if (error || !projectData) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">
            {error ? 'Error loading project information' : 'Project not found'}
          </p>
        </CardContent>
      </Card>
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
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-gray-custom" />
            <h1 className="text-2xl font-semibold text-gray-custom">{project.name}</h1>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>

      {/* Project Details */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Job Order Number</label>
              <p className="mt-1 font-mono bg-gray-100 px-3 py-2 rounded-lg text-sm">
                {project.jo_number}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created Date
              </label>
              <p className="mt-1 text-sm text-gray-600 px-3 py-2">
                {formatDate(project.created_at)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Created By
              </label>
              <p className="mt-1 text-sm text-gray-600 px-3 py-2">
                {project.created_by_name || 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Project Description</label>
            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="text-xs text-gray-500 border-t pt-3">
            Last updated: {project.updated_at ? formatDate(project.updated_at) : 'Never'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectInfo