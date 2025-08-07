import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

const DensityModal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div
          ref={ref}
          className={cn(
            "relative z-50 w-full max-w-lg mx-4 bg-background rounded-lg shadow-lg",
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }
)
DensityModal.displayName = "DensityModal"

const DensityModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
DensityModalHeader.displayName = "DensityModalHeader"

const DensityModalContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  )
)
DensityModalContent.displayName = "DensityModalContent"

const DensityModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end space-x-2 p-6 border-t", className)}
      {...props}
    />
  )
)
DensityModalFooter.displayName = "DensityModalFooter"

export { DensityModal, DensityModalHeader, DensityModalContent, DensityModalFooter }
