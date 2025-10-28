import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'

const ProjectStats = () => {
  // Mock data for project statistics
  const stats = [
    {
      title: 'Total Projects',
      value: '45',
      icon: FolderOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Ongoing Projects',
      value: '12',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Completed Projects',
      value: '28',
      icon: CheckCircle,
      color: 'text-gray-600'
    },
    {
      title: 'Upcoming Projects',
      value: '5',
      icon: XCircle,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      <div className='flex justify-between'>
        <h1 className="text-2xl font-semibold text-gray-custom">Project Statistics</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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