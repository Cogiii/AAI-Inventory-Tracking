import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, MapPin, Package, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { getItemReservations, type ItemReservation } from '@/services/api/inventory'

interface ReservationsCardProps {
  itemId: number
  reservedQuantity: number
}

const ReservationsCard = ({ itemId, reservedQuantity }: ReservationsCardProps) => {
  const [reservations, setReservations] = useState<ItemReservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (reservedQuantity > 0 && isExpanded) {
      fetchReservations()
    }
  }, [itemId, reservedQuantity, isExpanded])

  const fetchReservations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getItemReservations(itemId)
      if (response.success) {
        setReservations(response.data.reservations)
      } else {
        setError('Failed to load reservations')
      }
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  // Don't render if no reserved items
  if (reservedQuantity === 0) {
    return null
  }

  return (
    <Card className="hover:shadow-md transition-shadow bg-white mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Clock className="h-5 w-5 text-orange-500" />
            Reserved Items
            <span className="ml-2 px-2 py-0.5 text-sm font-semibold bg-orange-100 text-orange-700 rounded-full">
              {reservedQuantity} units
            </span>
          </CardTitle>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Items reserved for upcoming project days (not yet deducted from available)
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-4">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading reservations...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {!loading && !error && reservations.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No reservation details available</p>
            </div>
          )}

          {!loading && !error && reservations.length > 0 && (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.project_item_id}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Project Link */}
                      <Link
                        to={`/projects/${reservation.jo_number}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {reservation.project_name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        JO# {reservation.jo_number}
                      </p>

                      {/* Date and Location */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(reservation.project_date)}</span>
                        </div>
                        {reservation.location_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{reservation.location_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reserved Quantity */}
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-600">
                        {reservation.reserved_quantity}
                      </span>
                      <p className="text-xs text-gray-500">reserved</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {reservations.length} upcoming {reservations.length === 1 ? 'allocation' : 'allocations'}
                </span>
                <span className="font-semibold text-orange-600">
                  Total: {reservedQuantity} units reserved
                </span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default ReservationsCard
