import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, AlertTriangle, MapPin, Package } from 'lucide-react'

interface ActionButtonsProps {
  onEdit: () => void
  onUpdateQuantity: () => void
  onMoveLocation: () => void
  onReportIssue: () => void
  onDelete: () => void
}

const ActionButtons = ({
  onEdit,
  onUpdateQuantity,
  onMoveLocation,
  onReportIssue,
  onDelete
}: ActionButtonsProps) => {
  return (
    <div className="mb-8">
      <Card className="hover:shadow-md transition-shadow bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Package className="h-6 w-6 mr-3 text-gray-custom" />
            Item Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Edit Item */}
            <Button 
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow" 
              variant="outline" 
              onClick={onEdit}
            >
              <Edit className="h-5 w-5" />
              <span className="text-xs font-medium">Edit Details</span>
            </Button>

            {/* Update Quantity */}
            <Button 
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow" 
              variant="outline" 
              onClick={onUpdateQuantity}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs font-medium">Update Quantity</span>
            </Button>

            {/* Move Location */}
            <Button 
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow" 
              variant="outline" 
              onClick={onMoveLocation}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs font-medium">Move Location</span>
            </Button>

            {/* Report Issue */}
            <Button 
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow" 
              variant="outline" 
              onClick={onReportIssue}
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-medium">Report Issue</span>
            </Button>

            {/* Delete Item */}
            <Button 
              className="h-20 flex-col gap-2 hover:shadow-md transition-shadow" 
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