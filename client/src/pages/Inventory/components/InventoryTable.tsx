import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, MapPin, Calendar, Wrench, HardHat, ChevronRight } from 'lucide-react'

// Mock inventory data based on the database schema
const mockInventoryData = [
  {
    id: 1,
    type: 'product',
    brand: 'INGCO',
    name: 'INGCO Angle Grinder 4.5"',
    description: 'Heavy-duty angle grinder with 850W motor',
    delivered_quantity: 50,
    damaged_quantity: 2,
    lost_quantity: 0,
    available_quantity: 48,
    warehouse_location: 'Main Warehouse - A1',
    status: 'active',
    created_at: '2024-09-15',
    updated_at: '2024-10-20'
  },
  {
    id: 2,
    type: 'product',
    brand: 'Makita',
    name: 'Makita Cordless Drill 18V',
    description: 'Lithium-ion cordless drill with 2 batteries',
    delivered_quantity: 30,
    damaged_quantity: 1,
    lost_quantity: 0,
    available_quantity: 29,
    warehouse_location: 'Main Warehouse - A2',
    status: 'active',
    created_at: '2024-09-10',
    updated_at: '2024-10-18'
  },
  {
    id: 3,
    type: 'product',
    brand: 'Stanley',
    name: 'Stanley Measuring Tape 8m',
    description: 'Professional measuring tape with magnetic tip',
    delivered_quantity: 100,
    damaged_quantity: 0,
    lost_quantity: 2,
    available_quantity: 98,
    warehouse_location: 'Main Warehouse - B1',
    status: 'active',
    created_at: '2024-09-20',
    updated_at: '2024-10-22'
  },
  {
    id: 4,
    type: 'material',
    brand: null,
    name: 'Cement Portland 40kg',
    description: 'High-grade portland cement bags',
    delivered_quantity: 500,
    damaged_quantity: 15,
    lost_quantity: 5,
    available_quantity: 480,
    warehouse_location: 'Main Warehouse - C1',
    status: 'active',
    created_at: '2024-08-30',
    updated_at: '2024-10-25'
  },
  {
    id: 5,
    type: 'material',
    brand: null,
    name: 'Steel Rebar 12mm',
    description: '6-meter steel reinforcement bars',
    delivered_quantity: 200,
    damaged_quantity: 8,
    lost_quantity: 2,
    available_quantity: 190,
    warehouse_location: 'Main Warehouse - D1',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-10-15'
  },
  {
    id: 6,
    type: 'material',
    brand: null,
    name: 'Plywood 4x8 Marine Grade',
    description: '18mm marine grade plywood sheets',
    delivered_quantity: 150,
    damaged_quantity: 3,
    lost_quantity: 1,
    available_quantity: 146,
    warehouse_location: 'Main Warehouse - E1',
    status: 'active',
    created_at: '2024-09-12',
    updated_at: '2024-10-20'
  },
  {
    id: 7,
    type: 'product',
    brand: null,
    name: 'Safety Helmet White',
    description: 'ANSI approved safety helmets',
    delivered_quantity: 200,
    damaged_quantity: 5,
    lost_quantity: 3,
    available_quantity: 192,
    warehouse_location: 'Main Warehouse - S1',
    status: 'active',
    created_at: '2024-09-08',
    updated_at: '2024-10-18'
  },
  {
    id: 8,
    type: 'product',
    brand: 'DeWalt',
    name: 'DeWalt Impact Driver',
    description: '20V MAX cordless impact driver',
    delivered_quantity: 35,
    damaged_quantity: 1,
    lost_quantity: 0,
    available_quantity: 34,
    warehouse_location: 'Main Warehouse - A5',
    status: 'active',
    created_at: '2024-09-18',
    updated_at: '2024-10-19'
  },
  {
    id: 9,
    type: 'material',
    brand: null,
    name: 'PVC Pipe 4 inches',
    description: '6-meter PVC drainage pipes',
    delivered_quantity: 100,
    damaged_quantity: 2,
    lost_quantity: 0,
    available_quantity: 98,
    warehouse_location: 'Main Warehouse - F1',
    status: 'active',
    created_at: '2024-09-25',
    updated_at: '2024-10-21'
  },
  {
    id: 10,
    type: 'product',
    brand: 'Bosch',
    name: 'Bosch Hammer Drill',
    description: 'SDS-Plus rotary hammer drill',
    delivered_quantity: 20,
    damaged_quantity: 0,
    lost_quantity: 1,
    available_quantity: 19,
    warehouse_location: 'Main Warehouse - A4',
    status: 'active',
    created_at: '2024-09-14',
    updated_at: '2024-10-16'
  },
  {
    id: 11,
    type: 'material',
    brand: null,
    name: 'Electrical Wire 14AWG',
    description: '100-meter copper electrical wire rolls',
    delivered_quantity: 80,
    damaged_quantity: 1,
    lost_quantity: 0,
    available_quantity: 5, // Low stock example
    warehouse_location: 'Main Warehouse - G1',
    status: 'low_stock',
    created_at: '2024-09-02',
    updated_at: '2024-10-23'
  },
  {
    id: 12,
    type: 'product',
    brand: null,
    name: 'Work Boots Steel Toe',
    description: 'Size 8-12 steel toe safety boots',
    delivered_quantity: 100,
    damaged_quantity: 1,
    lost_quantity: 0,
    available_quantity: 0, // Out of stock example
    warehouse_location: 'Main Warehouse - S3',
    status: 'out_of_stock',
    created_at: '2024-08-28',
    updated_at: '2024-10-24'
  }
]

const InventoryTable = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<'name' | 'available_quantity' | 'updated_at'>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort data
  const sortedData = useMemo(() => {
    return [...mockInventoryData].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'available_quantity':
          comparison = a.available_quantity - b.available_quantity
          break
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Wrench className="h-4 w-4 text-blue-600" />
      case 'material':
        return <HardHat className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (availableQuantity: number) => {
    if (availableQuantity === 0) {
      return 'bg-red-100 text-red-800 border-red-200'
    } else if (availableQuantity <= 10) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    } else {
      return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusText = (availableQuantity: number) => {
    if (availableQuantity === 0) return 'Out of Stock'
    if (availableQuantity <= 10) return 'Low Stock'
    return 'In Stock'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSort = (column: 'name' | 'available_quantity' | 'updated_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleViewItem = (item: typeof mockInventoryData[0]) => {
    navigate(`/inventory/item/${item.id}`)
  }

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Package className="h-5 w-5" />
          Inventory Items ({sortedData.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('name')}
                >
                  Item Details {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('available_quantity')}
                >
                  Quantities {sortBy === 'available_quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('updated_at')}
                >
                  Last Updated {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr 
                  key={item.id} 
                  className="group border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleViewItem(item)}
                  title="Click to view item details"
                >
                  {/* Type */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="text-sm font-medium capitalize">
                        {item.type}
                      </span>
                    </div>
                  </td>

                  {/* Item Details */}
                  <td className="py-4 px-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      {item.brand && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.brand}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quantities */}
                  <td className="py-4 px-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-gray-900">{item.available_quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="text-gray-700">{item.delivered_quantity}</span>
                      </div>
                      {(item.damaged_quantity > 0 || item.lost_quantity > 0) && (
                        <div className="text-xs space-y-0.5">
                          {item.damaged_quantity > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Damaged:</span>
                              <span>{item.damaged_quantity}</span>
                            </div>
                          )}
                          {item.lost_quantity > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Lost:</span>
                              <span>{item.lost_quantity}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{item.warehouse_location}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.available_quantity)}`}>
                      {item.available_quantity <= 10 && item.available_quantity > 0 && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {getStatusText(item.available_quantity)}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.updated_at)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} items
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-600">Get started by adding your first inventory item.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InventoryTable