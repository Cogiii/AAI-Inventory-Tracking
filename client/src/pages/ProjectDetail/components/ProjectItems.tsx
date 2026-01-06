import { useState } from 'react'
import type { FC } from 'react'
import { Package, Plus, Edit, Trash2, Loader2, AlertTriangle, Lock } from 'lucide-react'
import AddItemForm from '../modals/AddItemForm'
import EditItemForm from '../modals/EditItemForm'
import { ConfirmationModal } from '@/components/ui'
import { useProjectDetail, useDeleteProjectItem } from '@/hooks/useProjectDetail'
import { useProjectDetailModalStore } from '@/stores/useProjectDetailModalStore'

interface ProjectItemsProps {
  joNumber?: string
}

const ProjectItems: FC<ProjectItemsProps> = ({ joNumber }) => {
  const { data: projectData, isLoading: projectLoading, error: projectError } = useProjectDetail(joNumber)
  const deleteProjectItemMutation = useDeleteProjectItem()
  const { openAddDayModal } = useProjectDetailModalStore()

  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [applyToAllDays, setApplyToAllDays] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    item: any
    dayId: number
  }>({ isOpen: false, item: null, dayId: 0 })

  const handleDeleteItem = async (projectItemId: number) => {
    if (!joNumber) return
    try {
      await deleteProjectItemMutation.mutateAsync({ joNumber, id: projectItemId })
    } catch (error) {
      console.error('Error deleting project item:', error)
    }
  }

  const handleDeleteClick = (item: any, dayId: number) => {
    setDeleteConfirmation({ isOpen: true, item, dayId })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.item) {
      handleDeleteItem(deleteConfirmation.item.id)
      setDeleteConfirmation({ isOpen: false, item: null, dayId: 0 })
    }
  }

  if (!joNumber) return null

  if (projectLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading items...</p>
      </div>
    )
  }

  if (projectError || !projectData) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">Error loading items</p>
      </div>
    )
  }

  const projectDays = projectData.project_days || []

  const isItemDayCompleted = (item: any) => {
    const day = projectDays.find(d => d.id === item.project_day_id)
    return day?.day_status === 'completed'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDisplayItems = () => {
    if (selectedDay === 'all') {
      const allItems: any[] = []
      projectDays.forEach(day => allItems.push(...day.items))
      return allItems
    }
    const targetDay = projectDays.find(day => day.id === selectedDay)
    return targetDay ? targetDay.items : []
  }

  const displayItems = getDisplayItems()
  const totalItems = displayItems.reduce((sum, item) => sum + item.allocated_quantity, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Items</h2>
          <span className="text-sm text-gray-500">({totalItems})</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Day Filter - only show if there are days */}
      {projectDays.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              selectedDay === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            All
          </button>
          {projectDays.map((day, index) => {
            const isCompleted = day.day_status === 'completed'
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  selectedDay === day.id
                    ? isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                    : isCompleted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {isCompleted && <Lock className="h-3 w-3" />}
                {formatDate(day.project_date)}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => {
              const isDayCompleted = isItemDayCompleted(item)
              const hasIssues = item.damaged_quantity > 0 || item.lost_quantity > 0

              return (
                <div
                  key={`${item.id}-${item.project_day_id}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDayCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.item_name}</p>
                      {hasIssues && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                      {isDayCompleted && <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{item.brand_name}</span>
                      <span className="font-medium text-blue-600">{item.allocated_quantity} units</span>
                      {item.returned_quantity > 0 && (
                        <span className="text-green-600">{item.returned_quantity} returned</span>
                      )}
                    </div>
                  </div>

                  {!isDayCompleted && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item, item.project_day_id)}
                        disabled={deleteProjectItemMutation.isPending}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modals */}
        <AddItemForm
          isOpen={showAddForm}
          joNumber={joNumber!}
          projectDays={projectDays}
          selectedDay={selectedDay}
          applyToAllDays={applyToAllDays}
          setApplyToAllDays={setApplyToAllDays}
          onCancel={() => { setShowAddForm(false); setApplyToAllDays(false) }}
          onOpenAddDay={openAddDayModal}
        />

        <EditItemForm
          isOpen={!!editingItem}
          item={editingItem}
          joNumber={joNumber!}
          onSave={() => setEditingItem(null)}
          onCancel={() => setEditingItem(null)}
        />

        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          type="delete"
          title="Delete Item"
          message={`Delete "${deleteConfirmation.item?.item_name}"? ${deleteConfirmation.item?.allocated_quantity || 0} units will return to inventory.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmation({ isOpen: false, item: null, dayId: 0 })}
          confirmText={deleteProjectItemMutation.isPending ? "Deleting..." : "Delete"}
        />
      </div>
    </div>
  )
}

export default ProjectItems
