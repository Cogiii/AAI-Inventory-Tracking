import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  Wrench
} from 'lucide-react'

import InventoryTable from './components/InventoryTable'
import InventoryFilters from './components/InventoryFilters'

const Inventory = () => {
  // Mock data for inventory stats
  const stats = [
    {
      title: 'Total Products',
      value: '847',
      icon: Package,
    },
    {
      title: 'Total Materials',
      value: '400',
      icon: Wrench,
    }
  ]

  return (
    <div className="space-y-6 p-7">
      {/* Overview */}
      <div className="bg-gray space-y-6 p-7 rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-custom">Inventory Management</h1>

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

      {/* Filters Section */}
      <InventoryFilters />

      {/* Inventory Table */}
      <InventoryTable />
    </div>
  )
}

export default Inventory