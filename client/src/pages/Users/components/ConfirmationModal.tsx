import type { FC } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, UserX, UserCheck } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'delete' | 'deactivate' | 'activate' | 'update';
  isLoading?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  isLoading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'deactivate':
        return <UserX className="w-6 h-6 text-red-600" />;
      case 'activate':
        return <UserCheck className="w-6 h-6 text-green-600" />;
      case 'update':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'delete':
      case 'deactivate':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'activate':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'update':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'delete':
        return 'Delete';
      case 'deactivate':
        return 'Deactivate';
      case 'activate':
        return 'Activate';
      case 'update':
        return 'Update';
      default:
        return 'Confirm';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <ModalBody>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            {getIcon()}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {message}
          </p>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-end space-x-3 w-full">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={getButtonColor()}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : getButtonText()}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;