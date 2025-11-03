import { useEffect } from 'react';
import type { FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useUpdateProjectItem } from '@/hooks/useProjectDetail';
import { UpdateProjectItemSchema } from '@/schemas/project-detail';
import { Package, Loader2 } from 'lucide-react';
import type { z } from 'zod';

type UpdateProjectItemData = z.infer<typeof UpdateProjectItemSchema>;

interface EditProjectItemFormProps {
  isOpen: boolean;
  item: any; // Project item with quantities and status
  joNumber: string;
  onSave: () => void;
  onCancel: () => void;
}

const EditProjectItemForm: FC<EditProjectItemFormProps> = ({
  isOpen,
  item,
  joNumber,
  onSave,
  onCancel
}) => {
  const updateMutation = useUpdateProjectItem();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<UpdateProjectItemData>({
    resolver: zodResolver(UpdateProjectItemSchema),
    defaultValues: {
      allocated_quantity: 0,
      damaged_quantity: 0,
      lost_quantity: 0,
      returned_quantity: 0,
      status: 'allocated',
    }
  });

  const watchedValues = watch();

  // Update form values when item changes
  useEffect(() => {
    if (item && isOpen) {
      setValue('allocated_quantity', item.allocated_quantity || 0);
      setValue('damaged_quantity', item.damaged_quantity || 0);
      setValue('lost_quantity', item.lost_quantity || 0);
      setValue('returned_quantity', item.returned_quantity || 0);
      setValue('status', item.status || 'allocated');
    }
  }, [item, isOpen, setValue]);

  const onSubmit: SubmitHandler<UpdateProjectItemData> = async (data) => {
    if (!item?.id) return;

    try {
      await updateMutation.mutateAsync({
        joNumber,
        id: item.id,
        ...data
      });
      reset();
      onSave();
    } catch (error) {
      console.error('Failed to update project item:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  // Calculate quantities for validation
  const inUseQuantity = (watchedValues.allocated_quantity || 0) -
    (watchedValues.damaged_quantity || 0) -
    (watchedValues.lost_quantity || 0) -
    (watchedValues.returned_quantity || 0);

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Edit Item: ${item.item_name || 'Unknown Item'}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="modal-scrollbar">
          <div className="space-y-6">
            {/* Item Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {item.item_type}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Brand:</span> {item.brand_name} |
                <span className="ml-1 font-medium">Location:</span> {item.warehouse_location}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="allocated">Allocated</option>
                <option value="returned">Returned</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Quantities Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocated Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('allocated_quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.allocated_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.allocated_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damaged Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max={watchedValues.allocated_quantity || 0}
                  {...register('damaged_quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.damaged_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.damaged_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lost Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max={watchedValues.allocated_quantity || 0}
                  {...register('lost_quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.lost_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.lost_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Returned Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max={watchedValues.allocated_quantity || 0}
                  {...register('returned_quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.returned_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.returned_quantity.message}</p>
                )}
              </div>
            </div>

            {inUseQuantity < 0 && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
                ⚠️ Warning: Total damaged, lost, and returned quantities exceed allocated quantity.
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || inUseQuantity < 0}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditProjectItemForm;