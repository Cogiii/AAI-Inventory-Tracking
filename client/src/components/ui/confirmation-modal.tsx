import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Save } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | React.ReactNode
  type?: 'delete' | 'update' | 'warning'
  confirmText?: string
  cancelText?: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-600" />
      case 'update':
        return <Save className="h-6 w-6 text-blue-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  // Helper function to parse and highlight important text
  const parseMessage = (text: string): React.ReactNode => {
    if (typeof text !== 'string') return text
    
    // Pattern to match text within quotes for highlighting
    const quotedTextPattern = /"([^"]+)"/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match
    let keyCounter = 0

    while ((match = quotedTextPattern.exec(text)) !== null) {
      // Add text before the quoted part
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index)
        // Check for action words in the before text and highlight them
        const highlightedBefore = beforeText.replace(
          /\b(update|delete|remove|add|create|modify|change|quantities?|status)\b/gi,
          (actionMatch) => `<strong class="font-semibold text-red-600">${actionMatch}</strong>`
        )
        parts.push(<span key={`before-${keyCounter}`} dangerouslySetInnerHTML={{ __html: highlightedBefore }} />)
      }
      
      // Add the quoted text as bold (without the quotes)
      parts.push(
        <strong key={`quote-${keyCounter}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      )
      
      lastIndex = match.index + match[0].length
      keyCounter++
    }
    
    // Add remaining text after the last quote
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex)
      // Check for action words in the remaining text and highlight them
      const highlightedRemaining = remainingText.replace(
        /\b(update|delete|remove|add|create|modify|change|quantities?|status|cannot be undone)\b/gi,
        (actionMatch) => `<strong class="font-semibold text-red-600">${actionMatch}</strong>`
      )
      parts.push(<span key={`after-${keyCounter}`} dangerouslySetInnerHTML={{ __html: highlightedRemaining }} />)
    }
    
    return parts.length > 1 ? <>{parts}</> : text
  }

  const renderMessage = () => {
    if (typeof message === 'string') {
      return parseMessage(message)
    }
    return message
  }

  const getButtonVariant = () => {
    switch (type) {
      case 'delete':
        return 'destructive'
      case 'update':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <ModalBody>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{renderMessage()}</p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          className="flex-1 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
        >
          {cancelText}
        </Button>
        <Button 
          type="button" 
          variant={getButtonVariant()} 
          onClick={() => {
            onConfirm()
            onClose()
          }} 
          className={`flex-1 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            type === 'delete' 
              ? 'hover:bg-red-600' 
              : 'hover:bg-blue-600'
          }`}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmationModal