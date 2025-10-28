import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FolderOpen, Calendar, User, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Mock project data (in real app, this would come from API)
const getProjectByJO = (joNumber: string) => {
  const projects: Record<string, any> = {
    'JO-2024-001': {
      id: 1,
      jo_number: 'JO-2024-001',
      name: 'Metro Manila Infrastructure Development',
      description: 'Major highway and bridge construction project covering multiple districts in Metro Manila. This comprehensive project includes road widening, bridge construction, drainage system installation, and traffic management improvements.',
      status: 'ongoing',
      created_by: 'John Smith',
      created_at: '2024-09-15',
      updated_at: '2024-10-27'
    },
    'JO-2024-002': {
      id: 2,
      jo_number: 'JO-2024-002',
      name: 'Cebu Commercial Complex',
      description: 'Shopping mall and office building construction in Cebu Business Park with modern amenities and sustainable design features.',
      status: 'upcoming',
      created_by: 'Maria Garcia',
      created_at: '2024-10-20',
      updated_at: '2024-10-25'
    },
    'JO-2024-003': {
      id: 3,
      jo_number: 'JO-2024-003',
      name: 'Davao Residential Village',
      description: 'Residential subdivision development with 150 housing units, community facilities, and green spaces.',
      status: 'ongoing',
      created_by: 'Robert Chen',
      created_at: '2024-08-10',
      updated_at: '2024-10-26'
    }
  }
  return projects[joNumber] || null
}

interface ProjectInfoProps {
  joNumber?: string
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ joNumber }) => {
  const navigate = useNavigate()
  
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

  const project = getProjectByJO(joNumber)
  
  if (!project) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Project not found</p>
        </CardContent>
      </Card>
    )
  }

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
                {project.created_by}
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
            Last updated: {formatDate(project.updated_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectInfo