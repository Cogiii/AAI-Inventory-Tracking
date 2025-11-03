import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ItemHeaderProps {
  itemName?: string
  onBack: () => void
}

const ItemHeader = ({ itemName, onBack }: ItemHeaderProps) => {
  return (
    <div className="bg-gray rounded-lg p-7 mb-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        <Package className="h-6 w-6 text-gray-custom" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-custom">
          {itemName || 'Item Details'}
        </h1>
        <p className="text-gray-500">
          Comprehensive item management and analytics
        </p>
      </div>
    </div>
  )
}

export default ItemHeader