import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Package, Wrench, HardHat, ChevronRight, MapPin, AlertTriangle, Calendar } from 'lucide-react'
import { useInventoryItems } from '@/hooks/useInventory'
import Loader from '@/components/ui/Loader'
import type { FilterState } from '@/types'


interface InventoryTableProps {
  filters: FilterState
}

const InventoryTable = ({ filters }: InventoryTableProps) => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<'name' | 'available_quantity' | 'updated_at'>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.type, filters.brand, filters.location, filters.status])

  // Fetch inventory items from API with filters
  const { data: inventoryResponse, isLoading, error } = useInventoryItems({
    page: currentPage,
    limit: itemsPerPage,
    sort: sortBy,
    order: sortOrder,
    search: filters.search || undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    brand: filters.brand !== 'all' ? filters.brand : undefined,
    location: filters.location !== 'all' ? filters.location : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  })

  // Extract data from API response
  const inventoryItems = inventoryResponse?.data?.items || []
  const pagination = inventoryResponse?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  }

  // For compatibility with existing code, we'll use these aliases
  const sortedData = inventoryItems
  const paginatedData = inventoryItems
  const totalPages = pagination.totalPages
  const startIndex = (pagination.currentPage - 1) * itemsPerPage

  // Show loading state
  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="flex items-center justify-center p-8">
          <Loader />
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load inventory items</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  const handleViewItem = (item: any) => {
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
              {paginatedData.map((item: any) => (
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
                      <span>{item.warehouse_location_name}</span>
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