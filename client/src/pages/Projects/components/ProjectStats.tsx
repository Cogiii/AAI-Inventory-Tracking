import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useProjectStats } from '@/hooks/useProjects'
import { useProjectsStore } from '@/stores/useProjectsStore'

const ProjectStats = () => {
  const { data: projectStats, isLoading } = useProjectStats();
  const { setCreateModalOpen } = useProjectsStore();

  const handleNewProject = () => {
    setCreateModalOpen(true);
  };

  // Create stats array from API data
  const stats = projectStats ? [
    {
      title: 'Total Projects',
      value: projectStats.total_projects.toString(),
      icon: FolderOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Ongoing Projects',
      value: projectStats.ongoing_projects.toString(),
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Completed Projects',
      value: projectStats.completed_projects.toString(),
      icon: CheckCircle,
      color: 'text-gray-600'
    },
    {
      title: 'Upcoming Projects',
      value: projectStats.upcoming_projects.toString(),
      icon: XCircle,
      color: 'text-orange-600'
    }
  ] : []

  if (isLoading) {
    return (
      <div className="space-y-6 bg-gray p-7 rounded-lg">
        <div className='flex justify-between'>
          <h1 className="text-2xl font-semibold text-gray-custom">Project Statistics</h1>
          <button 
            onClick={handleNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                      <div className="h-3 w-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      <div className='flex justify-between'>
        <h1 className="text-2xl font-semibold text-gray-custom">Project Statistics</h1>
        <button 
          onClick={handleNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Icon className={`h-6 w-6`} />
                  <div>
                    <p className="text-md font-bold text-gray-700">
                      {stat.title}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectStats