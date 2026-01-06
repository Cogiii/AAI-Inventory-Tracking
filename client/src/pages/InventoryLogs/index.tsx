import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Package,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
} from 'lucide-react'
import { api } from '@/services/api'
import type { InventoryLog } from '@/types'

interface PaginatedResponse {
  data: InventoryLog[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const InventoryLogsPage = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [logType, setLogType] = useState('')

  const { data, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['inventory-logs', 'all', page, limit, search, logType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append('search', search)
      if (logType) params.append('type', logType)
      const response = await api.get(`/dashboard/inventory-logs/all?${params}`)
      return response.data
    },
  })

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'out':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'out':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'transfer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const logs = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6 p-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Logs</h1>
            <p className="text-gray-600 mt-1">Track all inventory movements and transactions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by item name, reference number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              <Button type="submit" variant="default">
                Search
              </Button>
            </form>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={logType}
                  onChange={(e) => { setLogType(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[130px]"
                >
                  <option value="all">All Types</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={limit.toString()}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[70px]"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="bg-gray">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-custom">
            <Package className="h-5 w-5" />
            Inventory Flow/Logs
            {pagination && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({pagination.totalItems} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-4">
                    <div className="animate-pulse flex gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-red-300" />
              <p>Error loading inventory logs</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <Card key={log.id} className="bg-white hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getLogIcon(log.log_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{log.item_name}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLogBadge(log.log_type)}`}>
                              {log.log_type.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Qty:</span>
                              <span className={log.log_type === 'in' ? 'text-green-600' : log.log_type === 'out' ? 'text-red-600' : ''}>
                                {log.log_type === 'in' ? '+' : log.log_type === 'out' ? '-' : ''}{log.quantity}
                              </span>
                            </div>
                            {log.reference_no && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Ref:</span>
                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.reference_no}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="font-medium">From:</span>
                              <span>{log.from_location_name || 'External'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">To:</span>
                              <span>{log.to_location_name || 'External'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              By: {log.handler_first_name} {log.handler_last_name}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(log.created_at)}
                            </div>
                          </div>

                          {log.remarks && (
                            <p className="text-sm text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                              {log.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No inventory logs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryLogsPage
