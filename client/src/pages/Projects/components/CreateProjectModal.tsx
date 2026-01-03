import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { RefreshCw } from 'lucide-react';

import { createProjectSchema } from '@/schemas';
import { useCreateProject } from '@/hooks/useProjects';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { projectsApi } from '@/services/api/projects';

const CreateProjectModal = () => {
  const { isCreateModalOpen, setCreateModalOpen } = useProjectsStore();
  const createProjectMutation = useCreateProject();
  const [isLoadingJoNumber, setIsLoadingJoNumber] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      jo_number: '',
      name: '',
      description: '',
      status: 'upcoming' as const
    }
  });

  // Fetch next JO number when modal opens
  const fetchNextJoNumber = async () => {
    setIsLoadingJoNumber(true);
    try {
      const data = await projectsApi.getNextJoNumber();
      setValue('jo_number', data.jo_number);
    } catch (error) {
      console.error('Error fetching next JO number:', error);
    } finally {
      setIsLoadingJoNumber(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchNextJoNumber();
    }
  }, [isCreateModalOpen]);

  const handleClose = () => {
    setCreateModalOpen(false);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      await createProjectMutation.mutateAsync(data);
      handleClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      title="Create New Project"
      size="md"
    >
      <ModalBody>
        <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* JO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  JO Number *
                </label>
                <div className="relative">
                  <input
                    {...register('jo_number')}
                    type="text"
                    placeholder={isLoadingJoNumber ? "Loading..." : "e.g., JO-2026-001"}
                    disabled={isLoadingJoNumber}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={fetchNextJoNumber}
                    disabled={isLoadingJoNumber}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                    title="Generate new JO number"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingJoNumber ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated. You can modify if needed.
                </p>
                {errors.jo_number && (
                  <p className="text-sm text-red-600 mt-1">{errors.jo_number.message}</p>
                )}
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Enter project description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
                )}
              </div>

        </form>
      </ModalBody>
      
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-project-form"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateProjectModal;