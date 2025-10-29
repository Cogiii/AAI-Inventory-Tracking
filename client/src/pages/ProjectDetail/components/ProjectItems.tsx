import { useState } from 'react'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Box, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react'
import AddItemForm from '../modals/AddItemForm'
import EditItemForm from '../modals/EditItemForm'
import { ConfirmationModal } from '@/components/ui'
import { useProjectDetail } from '@/hooks/useProjectDetail'

interface ProjectItemsProps {
  joNumber?: string
}

const ProjectItems: FC<ProjectItemsProps> = ({ joNumber }) => {
  const { data: projectData, isLoading: projectLoading, error: projectError } = useProjectDetail(joNumber)
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [applyToAllDays, setApplyToAllDays] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    item: any
    dayId: number
  }>({ isOpen: false, item: null, dayId: 0 })

  if (!joNumber) return null

  if (projectLoading) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading project items...</p>
        </CardContent>
      </Card>
    )
  }

  if (projectError || !projectData) {
    return (
      <Card className="bg-gray">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Error loading project items</p>
        </CardContent>
      </Card>
    )
  }

  const projectDays = projectData.project_days || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_use':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'partial_return':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'returned':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'damaged':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated': return Package
      case 'in_use': return CheckCircle
      case 'partial_return': return Box
      case 'returned': return CheckCircle
      case 'damaged': return XCircle
      default: return Package
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'product' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
  }

  const calculateInUse = (item: any) => {
    return item.allocated_quantity - item.damaged_quantity - item.lost_quantity - item.returned_quantity
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Get items for display based on selected day
  const getDisplayItems = () => {
    if (selectedDay === 'all') {
      // Combine all items from all days
      const allItems: any[] = []
      projectDays.forEach(day => {
        allItems.push(...day.items)
      })
      return allItems
    }
    // Find the specific day and return its items
    const targetDay = projectDays.find(day => day.id === selectedDay)
    return targetDay ? targetDay.items : []
  }



  const handleDeleteItem = (itemId: number, dayId: number) => {
    console.log('Delete item:', itemId, 'from day:', dayId)
  }

  const handleDeleteClick = (item: any, dayId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      item,
      dayId
    })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.item && deleteConfirmation.dayId) {
      handleDeleteItem(deleteConfirmation.item.item_id, deleteConfirmation.dayId)
      setDeleteConfirmation({ isOpen: false, item: null, dayId: 0 })
    }
  }

  const displayItems = getDisplayItems()

  return (
    <Card className='bg-gray'>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-custom">
            <Package className="h-5 w-5" />
            Project Items & Stocks
          </CardTitle>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
        
        {/* Day Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
              selectedDay === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm hover:scale-105'
            }`}
          >
            All Days
          </button>
          {projectDays.map(day => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                selectedDay === day.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm hover:scale-105'
              }`}
            >
              <Calendar className="h-3 w-3 inline mr-1" />
              {formatDate(day.project_date)}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No items allocated {selectedDay === 'all' ? 'to this project' : 'for this day'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status)
              const inUseQuantity = calculateInUse(item)
              
              return (
                <Card key={`${item.id}-${item.project_day_id}`} className="bg-white hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="h-4 w-4 text-blue-600" />
                          <h3 className="font-medium text-sm text-gray-900">
                            {item.item_name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.item_type)}`}>
                            {item.item_type}
                          </span>
                          {selectedDay === 'all' && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              Day {projectDays.findIndex(d => d.id === item.project_day_id) + 1}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3">
                          <span className="font-medium">Brand:</span> {item.brand_name} | 
                          <span className="ml-1 font-medium">Location:</span> {item.warehouse_location}
                        </div>

                        {/* Quantity Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium text-blue-800">Allocated:</span>
                            <span className="ml-1 font-bold">{item.allocated_quantity}</span>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-medium text-green-800">In Use:</span>
                            <span className="ml-1 font-bold">{inUseQuantity}</span>
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-medium text-orange-800">Returned:</span>
                            <span className="ml-1 font-bold">{item.returned_quantity}</span>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <span className="font-medium text-red-800">Issues:</span>
                            <span className="ml-1 font-bold">{item.damaged_quantity + item.lost_quantity}</span>
                          </div>
                        </div>

                        {/* Issues Details */}
                        {(item.damaged_quantity > 0 || item.lost_quantity > 0) && (
                          <div className="mt-3 flex items-center gap-4 text-xs bg-red-50 p-2 rounded">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="text-red-800">
                              {item.damaged_quantity > 0 && `${item.damaged_quantity} damaged`}
                              {item.damaged_quantity > 0 && item.lost_quantity > 0 && ', '}
                              {item.lost_quantity > 0 && `${item.lost_quantity} lost`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 hover:shadow-lg rounded-lg transition-all duration-200 hover:scale-110"
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item, item.project_day_id)}
                            className="p-2 text-red-600 hover:bg-red-50 hover:shadow-lg rounded-lg transition-all duration-200 hover:scale-110"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Add Item Form Modal */}
        <AddItemForm
          isOpen={showAddForm}
          joNumber={joNumber!}
          projectDays={projectDays}
          selectedDay={selectedDay}
          applyToAllDays={applyToAllDays}
          setApplyToAllDays={setApplyToAllDays}
          onCancel={() => {
            setShowAddForm(false)
            setApplyToAllDays(false)
          }}
        />

        {/* Edit Item Form Modal */}
        <EditItemForm
          isOpen={!!editingItem}
          item={editingItem}
          onSave={() => setEditingItem(null)}
          onCancel={() => setEditingItem(null)}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          type="delete"
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteConfirmation.item?.item_name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmation({ isOpen: false, item: null, dayId: 0 })}
        />
      </CardContent>
    </Card>
  )
}



export default ProjectItems