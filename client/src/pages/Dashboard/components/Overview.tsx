import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  Package,
  FolderOpen,
  Building2
} from 'lucide-react'

const Overview = () => {
  // Mock data for info cards
  const stats = [
    {
      title: 'Current Stocks',
      value: '1,009,879',
      icon: Package,
    },
    {
      title: 'Current Projects',
      value: '75,098',
      icon: FolderOpen,
    },
    {
      title: 'Current Clients',
      value: '10,980',
      icon: Building2,
    },
    {
      title: 'Total Employees',
      value: '68',
      icon: Users,
    }
  ]

  return (
    <div className="space-y-6 bg-gray p-7 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-custom">Dashboard</h1>

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

export default Overview