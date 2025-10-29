import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  FolderOpen,
  TrendingUp
} from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboard'

const Overview = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Items',
      value: stats?.totalStocks || 0,
      icon: Package,
      color: 'text-gray-custom',
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: FolderOpen,
      color: 'text-gray-custom',
    },
    {
      title: "Today's Allocations",
      value: stats?.todayAllocations || 0,
      icon: TrendingUp,
      color: 'text-gray-custom',
    }
  ]

  if (error) {
    return (
      <div className="space-y-6 bg-gray p-7 rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-custom">Dashboard</h1>
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          Error loading dashboard data. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-custom">Dashboard</h1>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                  <div>
                    <p className="text-md font-bold text-gray-700">
                      {stat.title}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {isLoading ? '...' : stat.value.toLocaleString()}
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