import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, FileText } from 'lucide-react'

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    joNumber: 'JO-2024-001',
    name: 'Metro Manila Construction Project',
    status: 'ongoing',
    firstDay: '2024-10-15',
    description: 'Major infrastructure development in Metro Manila area'
  },
  {
    id: 2,
    joNumber: 'JO-2024-002',
    name: 'Cebu Commercial Building',
    status: 'upcoming',
    firstDay: null,
    description: 'Commercial building construction in Cebu City'
  },
  {
    id: 3,
    joNumber: 'JO-2024-003',
    name: 'Davao Residential Complex',
    status: 'ongoing',
    firstDay: '2024-09-20',
    description: 'Residential complex development in Davao'
  },
  {
    id: 4,
    joNumber: 'JO-2024-004',
    name: 'Baguio Bridge Construction',
    status: 'upcoming',
    firstDay: null,
    description: 'Bridge construction project in Baguio City'
  }
]

const Projects = () => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewProject = (projectId: number) => {
    // Placeholder for navigation to project details
    console.log('View project:', projectId)
    alert(`View project details for ID: ${projectId}`)
  }

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-custom">
          <FileText className="h-5 w-5" />
          Current Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockProjects.map((project) => (
          <Card key={project.id} className="bg-white hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-medium text-lg text-gray-900">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">JO Number:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {project.joNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">First Day:</span>
                      <span>{formatDate(project.firstDay)}</span>
                    </div>
                    
                    <p className="text-gray-700 mt-2">
                      {project.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewProject(project.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {mockProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No projects found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Projects