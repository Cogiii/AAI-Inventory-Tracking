import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, FileText } from 'lucide-react'
import { useRecentProjects } from '@/hooks/useDashboard'
import { Link } from 'react-router-dom'

const Projects = () => {
  const { data: projects, isLoading, error } = useRecentProjects();

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



  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-custom">
          <FileText className="h-5 w-5" />
          Current Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-red-300" />
            <p>Error loading projects</p>
          </div>
        ) : projects && projects.length > 0 ? (
          projects.map((project) => (
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
                          {project.jo_number}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{project.creator_first_name} {project.creator_last_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium">Event Days:</span>
                        <span>{project.total_days}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium">Items Allocated:</span>
                        <span>{project.total_items_allocated}</span>
                      </div>
                      
                      <p className="text-gray-700 mt-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
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