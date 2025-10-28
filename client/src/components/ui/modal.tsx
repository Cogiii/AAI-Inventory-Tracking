import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl", 
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "full": "max-w-[95vw]"
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, className, size = "md" }, ref) => {
    // Handle escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            "relative w-full mx-4 bg-white rounded-lg shadow-xl",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
    >
      {children}
    </div>
  )
)
ModalHeader.displayName = "ModalHeader"

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1", className)}
    >
      {children}
    </div>
  )
)
ModalBody.displayName = "ModalBody"

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn("flex gap-3 pt-4 border-t border-gray-100 mt-4", className)}
    >
      {children}
    </div>
  )
)
ModalFooter.displayName = "ModalFooter"

export { Modal, ModalHeader, ModalBody, ModalFooter }