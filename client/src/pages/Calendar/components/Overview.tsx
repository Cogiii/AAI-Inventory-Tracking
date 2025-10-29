import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  FolderOpen,
  Calendar as CalendarIcon
} from 'lucide-react'

// Mock project data (this would come from your API)
const mockProjectEvents = [
  {
    id: 1,
    jo_number: 'JO-2024-001',
    name: 'Metro Manila Infrastructure',
    project_days: [
      { date: '2025-01-01', location: 'EDSA Makati' },
      { date: '2025-01-03', location: 'EDSA Ortigas' },
      { date: '2025-01-09', location: 'BGC Taguig' },
      { date: '2025-01-12', location: 'Makati CBD' },
      { date: '2025-01-15', location: 'Ortigas Center' },
      { date: '2025-01-21', location: 'Alabang' },
      { date: '2025-01-22', location: 'QC Triangle' },
      { date: '2025-01-30', location: 'Mandaluyong' },
      { date: '2025-01-31', location: 'Final Inspection' }
    ],
    status: 'ongoing'
  },
  {
    id: 2,
    jo_number: 'JO-2024-002',
    name: 'Cebu Commercial Complex',
    project_days: [
      { date: '2025-01-07', location: 'Site Preparation' },
      { date: '2025-01-14', location: 'Foundation Work' },
      { date: '2025-01-28', location: 'Structural Work' }
    ],
    status: 'upcoming'
  },
  {
    id: 3,
    jo_number: 'JO-2024-003',
    name: 'Davao Residential Village',
    project_days: [
      { date: '2025-01-16', location: 'Phase 1 Area A' },
      { date: '2025-01-17', location: 'Phase 1 Area B' },
      { date: '2025-01-23', location: 'Phase 2 Planning' }
    ],
    status: 'ongoing'
  },
  {
    id: 4,
    jo_number: 'JO-2024-004',
    name: 'Baguio Tourism Center',
    project_days: [
      { date: '2025-01-02', location: 'Session Road' },
      { date: '2025-01-10', location: 'Main Building' }
    ],
    status: 'completed'
  }
]

const Overview = () => {
  // Calculate month statistics for current month (January 2025)
  const monthStats = useMemo(() => {
    const currentDate = new Date(2025, 0, 1) // January 2025
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const monthEvents = mockProjectEvents.reduce((acc, project) => {
      const projectDaysInMonth = project.project_days.filter(day => {
        const dayDate = new Date(day.date)
        return dayDate >= monthStart && dayDate <= monthEnd
      })
      return acc + projectDaysInMonth.length
    }, 0)

    const activeProjects = new Set()
    mockProjectEvents.forEach(project => {
      const hasEventsInMonth = project.project_days.some(day => {
        const dayDate = new Date(day.date)
        return dayDate >= monthStart && dayDate <= monthEnd
      })
      if (hasEventsInMonth) {
        activeProjects.add(project.id)
      }
    })

    return {
      totalEvents: monthEvents,
      activeProjects: activeProjects.size
    }
  }, [])

  const stats = [
    {
      title: 'Active Projects',
      value: monthStats.activeProjects.toString(),
      icon: FolderOpen,
    },
    {
      title: 'Scheduled Events',
      value: monthStats.totalEvents.toString(),
      icon: CalendarIcon,
    }
  ]

  return (
    <div className="bg-gray space-y-6 p-7 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-custom">Project Calendar</h1>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default Overview