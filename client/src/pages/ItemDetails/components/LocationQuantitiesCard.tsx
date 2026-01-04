import { MapPin, Package, Lock, AlertTriangle, Truck } from 'lucide-react'
import type { ItemLocation } from '@/services/api/inventory'

interface LocationQuantitiesCardProps {
  locations: ItemLocation[]
  loading: boolean
  totalDelivered?: number
}

const LocationQuantitiesCard = ({ locations, loading, totalDelivered = 0 }: LocationQuantitiesCardProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Stock Locations
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Stock Locations
        </h2>
        <div className="text-center py-6">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No stock at any location</p>
          <p className="text-gray-400 text-xs mt-1">Add a delivery to get started</p>
        </div>
      </div>
    )
  }

  const totalAvailable = locations.reduce((sum, loc) => sum + loc.available_quantity, 0)
  const totalReserved = locations.reduce((sum, loc) => sum + loc.reserved_quantity, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Stock Locations
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Truck className="w-3 h-3 text-blue-500" />
            <p className="text-xs text-gray-500">Total Delivered</p>
          </div>
          <p className="text-lg font-semibold text-blue-600">{totalDelivered}</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package className="w-3 h-3 text-green-500" />
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <p className="text-lg font-semibold text-green-600">{totalAvailable}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="w-3 h-3 text-amber-500" />
            <p className="text-xs text-gray-500">Reserved</p>
          </div>
          <p className="text-lg font-semibold text-amber-600">{totalReserved}</p>
        </div>
      </div>

      {/* Location list */}
      <div className="space-y-3">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  loc.available_quantity > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="font-medium text-gray-900">{loc.location_name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {loc.location_type}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {loc.quantity} total
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-green-500" />
                <span className="text-gray-600">Available:</span>
                <span className="font-medium text-green-600">{loc.available_quantity}</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500" />
                <span className="text-gray-600">Reserved:</span>
                <span className="font-medium text-amber-600">{loc.reserved_quantity}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-gray-600">Damaged:</span>
                <span className="font-medium text-red-500">{loc.damaged_quantity}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">Lost:</span>
                <span className="font-medium text-gray-500">{loc.lost_quantity}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {loc.city}, {loc.province}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationQuantitiesCard
