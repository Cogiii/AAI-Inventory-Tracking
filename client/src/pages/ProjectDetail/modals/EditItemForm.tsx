import { useEffect } from 'react';
import type { FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useUpdateInventoryItem, useBrands, useLocations } from '@/hooks/useInventory';
import { inventoryItemFormSchema, type InventoryItemFormInput, type Brand, type Location } from '@/schemas';
import { Package, Loader2 } from 'lucide-react';

interface EditItemFormProps {
  isOpen: boolean;
  item: any; // This should be the item with all properties including id, name, etc.
  availableItems?: any[];
  onSave: (item: any) => void;
  onCancel: () => void;
}

const EditItemForm: FC<EditItemFormProps> = ({ isOpen, item, onSave, onCancel }) => {
  const updateMutation = useUpdateInventoryItem();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<InventoryItemFormInput>({
    defaultValues: {
      type: 'product',
      brand_id: '',
      name: '',
      description: '',
      delivered_quantity: '0',
      damaged_quantity: '0',
      lost_quantity: '0',
      available_quantity: '0',
      warehouse_location_id: '',
      status: ''
    }
  });

  const brands = brandsData?.data?.brands || [];
  const locations = locationsData?.data?.locations || [];

  // Update form values when item changes
  useEffect(() => {
    if (item && isOpen) {
      setValue('type', item.type || 'product');
      setValue('brand_id', item.brand_id ? item.brand_id.toString() : '');
      setValue('name', item.name || '');
      setValue('description', item.description || '');
      setValue('delivered_quantity', item.delivered_quantity?.toString() || '0');
      setValue('damaged_quantity', item.damaged_quantity?.toString() || '0');
      setValue('lost_quantity', item.lost_quantity?.toString() || '0');
      setValue('available_quantity', item.available_quantity?.toString() || '0');
      setValue('warehouse_location_id', item.warehouse_location_id ? item.warehouse_location_id.toString() : '');
      setValue('status', item.status || '');
    }
  }, [item, isOpen, setValue]);

  const onSubmit: SubmitHandler<InventoryItemFormInput> = async (data) => {
    if (!item?.id) return;
    
    try {
      // Transform the form data using the schema
      const transformedData = inventoryItemFormSchema.parse(data);
      
      await updateMutation.mutateAsync({
        id: item.id,
        data: transformedData
      });
      reset();
      onSave(transformedData);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (!item) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel}
      title={`Edit Item: ${item.name || item.item_name || 'Unknown Item'}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="modal-scrollbar">
          <div className="space-y-4">
            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Type *
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="product">Product</option>
                <option value="material">Material</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                {...register('brand_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={brandsLoading}
              >
                <option value="">Select a brand</option>
                {brands.map((brand: Brand) => (
                  <option key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <p className="mt-1 text-sm text-red-600">{errors.brand_id.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivered Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('delivered_quantity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.delivered_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.delivered_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('available_quantity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.available_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.available_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damaged Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('damaged_quantity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.damaged_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.damaged_quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lost Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('lost_quantity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.lost_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.lost_quantity.message}</p>
                )}
              </div>
            </div>

            {/* Warehouse Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse Location
              </label>
              <select
                {...register('warehouse_location_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={locationsLoading}
              >
                <option value="">Select a location</option>
                {locations.map((location: Location) => (
                  <option key={location.id} value={location.id.toString()}>
                    {location.name} - {location.city}, {location.province}
                  </option>
                ))}
              </select>
              {errors.warehouse_location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.warehouse_location_id.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <input
                type="text"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter status (optional)"
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="flex items-center gap-2"
            >
              {(isSubmitting || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Package className="h-4 w-4" />
              Update Item
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default EditItemForm