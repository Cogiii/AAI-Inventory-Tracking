import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, AlertTriangle, MapPin, Package, PackagePlus, PackageMinus, ArrowLeftRight, Settings } from 'lucide-react'
// Note: Package is used in Stock Management section

interface ActionButtonsProps {
  onEdit: () => void
  onMoveLocation: () => void
  onReportIssue: () => void
  onDelete: () => void
  onAddStock?: () => void
  onOutStock?: () => void
  onAdjustQuantity?: () => void
  onTransferStock?: () => void
  isAdmin?: boolean
  canEditInventory?: boolean
  canDeleteInventory?: boolean
}

const ActionButtons = ({
  onEdit,
  onMoveLocation,
  onReportIssue,
  onDelete,
  onAddStock,
  onOutStock,
  onAdjustQuantity,
  onTransferStock,
  isAdmin = false,
  canEditInventory = false,
  canDeleteInventory = false
}: ActionButtonsProps) => {
  return (
    <div className="mb-8 space-y-4">
      {/* Stock Management Actions */}
      <Card className="hover:shadow-md transition-shadow bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Package className="h-6 w-6 mr-3 text-blue-600" />
            Stock Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Add Stock (requires canEditInventory) */}
            {(isAdmin || canEditInventory) && (
              <Button
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                variant="outline"
                onClick={onAddStock}
              >
                <PackagePlus className="h-5 w-5" />
                <span className="text-xs font-medium">Add Stock</span>
              </Button>
            )}

            {/* Out Stock (requires canEditInventory) */}
            {(isAdmin || canEditInventory) && (
              <Button
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
                variant="outline"
                onClick={onOutStock}
              >
                <PackageMinus className="h-5 w-5" />
                <span className="text-xs font-medium">Out Stock</span>
              </Button>
            )}

            {/* Transfer Stock (requires canEditInventory) */}
            {(isAdmin || canEditInventory) && (
              <Button
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
                variant="outline"
                onClick={onTransferStock}
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-xs font-medium">Transfer Stock</span>
              </Button>
            )}

            {/* Report Issue (requires canEditInventory) */}
            {(isAdmin || canEditInventory) && (
              <Button
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700"
                variant="outline"
                onClick={onReportIssue}
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-medium">Report Issue</span>
              </Button>
            )}

            {/* Adjust Quantity (Admin Only) */}
            {isAdmin && (
              <Button
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
                variant="outline"
                onClick={onAdjustQuantity}
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs font-medium">Adjust Stock</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item Actions */}
      <Card className="hover:shadow-md transition-shadow bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Edit className="h-6 w-6 mr-3 text-gray-500" />
            Item Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Edit Item */}
            <Button
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow"
              variant="outline"
              onClick={onEdit}
            >
              <Edit className="h-5 w-5" />
              <span className="text-xs font-medium">Edit Details</span>
            </Button>

            {/* Set Primary Location */}
            <Button
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow"
              variant="outline"
              onClick={onMoveLocation}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs font-medium">Set Primary Location</span>
            </Button>

            {/* Delete Item */}
            <Button
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
              variant="outline"
              onClick={onDelete}
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-xs font-medium">Delete Item</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ActionButtons