'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
  overlayClassName?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  overlayClassName
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }

      firstElement?.focus()
      document.addEventListener('keydown', handleTabKey)

      return () => {
        document.removeEventListener('keydown', handleTabKey)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  }

  // On mobile, most modals should be full-screen or near full-screen
  const getMobileSize = (size: string) => {
    if (size === 'sm') return 'max-w-sm'
    return 'max-w-[95vw]'
  }

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'p-4 sm:p-6 md:p-8',
        overlayClassName
      )}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-background border shadow-lg',
          'max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col',
          'rounded-lg sm:rounded-xl',
          // Mobile-first responsive sizing
          'sm:' + sizes[size],
          getMobileSize(size),
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            {title && (
              <h2 id="modal-title" className="text-lg sm:text-xl font-semibold truncate pr-2">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 sm:h-8 sm:w-8 touch-manipulation flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )

  // Portal to modal-root
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) {
    console.warn('Modal root element not found. Make sure to add <div id="modal-root" /> to your layout.')
    return modalContent
  }

  return createPortal(modalContent, modalRoot)
}

// Convenience components for common modal patterns
export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 sm:p-6 border-b', className)}>
      {children}
    </div>
  )
}

export function ModalContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 sm:p-6', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 p-4 sm:p-6 border-t',
      'flex-col-reverse sm:flex-row gap-2 sm:gap-3',
      className
    )}>
      {children}
    </div>
  )
}