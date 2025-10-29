import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  Wrench,
  AlertCircle,
  CheckCircle,
  Truck
} from 'lucide-react'
import { useInventoryStats } from '@/hooks/useInventory'
import Loader from '@/components/ui/Loader'

import InventoryTable from './components/InventoryTable'
import InventoryFilters from './components/InventoryFilters'
import type { FilterState } from '@/types'

const Inventory = () => {
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    brand: 'all',
    location: 'all', 
    status: 'all'
  })

  // Fetch real inventory stats from API
  const { data: statsResponse, isLoading, error } = useInventoryStats()
  
  // Create stats array from API data
  const stats = statsResponse ? [
    {
      title: 'Total Products',
      value: statsResponse.data.typeCounts.product?.toString() || '0',
      icon: Package,
    },
    {
      title: 'Total Materials', 
      value: statsResponse.data.typeCounts.material?.toString() || '0',
      icon: Wrench,
    },
    {
      title: 'Available Items',
      value: statsResponse.data.quantities.total_available?.toString() || '0',
      icon: CheckCircle,
    },
    {
      title: 'Delivered Items',
      value: statsResponse.data.quantities.total_delivered?.toString() || '0',
      icon: Truck,
    }
  ] : []

  return (
    <div className="space-y-6 p-7">
      {/* Overview */}
      <div className="bg-gray space-y-6 p-7 rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-custom">Inventory Management</h1>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading state for stats cards
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-16">
                    <Loader />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state for stats cards
            <div className="col-span-full">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center text-red-600">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Failed to load inventory statistics</p>
                      <p className="text-xs text-red-500 mt-1">
                        {error instanceof Error ? error.message : 'An error occurred while fetching data.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Normal state with real data
            stats.map((stat, index) => {
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
            })
          )}
        </div>

      </div>

      {/* Filters Section */}
      <InventoryFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Inventory Table */}
      <InventoryTable filters={filters} />
    </div>
  )
}

export default Inventory