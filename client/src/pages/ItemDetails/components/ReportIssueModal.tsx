import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface IssueFormState {
  issue_type: 'damage' | 'loss'
  quantity: number
  description: string
}

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
  issueForm: IssueFormState
  setIssueForm: React.Dispatch<React.SetStateAction<IssueFormState>>
  onSubmit: () => void
  saving: boolean
  maxQuantity?: number
}

const ReportIssueModal = ({
  isOpen,
  onClose,
  issueForm,
  setIssueForm,
  onSubmit,
  saving,
  maxQuantity = 100
}: ReportIssueModalProps) => {
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setIssueForm(prev => ({ 
      ...prev, 
      quantity: Math.max(1, Math.min(numValue, maxQuantity)) 
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Issue" size="md">
      <ModalBody>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
            <select
              value={issueForm.issue_type}
              onChange={(e) => setIssueForm(prev => ({ 
                ...prev, 
                issue_type: e.target.value as 'damage' | 'loss' 
              }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
            >
              <option value="damage">Damage</option>
              <option value="loss">Loss</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={issueForm.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum quantity: {maxQuantity}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={issueForm.description}
              onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 hover:border-gray-400 px-4 py-3"
              placeholder={`Describe the ${issueForm.issue_type} in detail...`}
              rows={4}
              required
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action will {issueForm.issue_type === 'damage' ? 'mark items as damaged' : 'mark items as lost'} 
              and reduce the available quantity. This action cannot be undone.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={saving || !issueForm.description.trim()}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {saving ? 'Reporting...' : `Report ${issueForm.issue_type === 'damage' ? 'Damage' : 'Loss'}`}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ReportIssueModal