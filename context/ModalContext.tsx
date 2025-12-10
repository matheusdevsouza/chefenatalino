'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Modal, ModalProps } from '@/components/Modal'

/**
 * Interface do contexto de modal.
 */
interface ModalContextType {
  showModal: (props: Omit<ModalProps, 'isOpen' | 'onClose'>) => void
  showConfirm: (props: {
    message: string
    title?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => void
  hideModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

/**
 * Gerencia modais globalmente. Renderizado no nível do provider, acessível via useModal.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalProps, setModalProps] = useState<Omit<ModalProps, 'isOpen' | 'onClose'> | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const showModal = useCallback((props: Omit<ModalProps, 'isOpen' | 'onClose'>) => {
    setModalProps(props)
    setIsOpen(true)
  }, [])

  const showConfirm = useCallback((props: {
    message: string
    title?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => {
    setModalProps({
      ...props,
      type: 'confirm',
    })
    setIsOpen(true)
  }, [])

  /**
   * Fecha o modal e limpa as props após a animação de fechamento (300ms).
   */
  const hideModal = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      setModalProps(null)
    }, 300)
  }, [])

  return (
    <ModalContext.Provider value={{ showModal, showConfirm, hideModal }}>
      {children}
      {modalProps && (
        <Modal
          {...modalProps}
          isOpen={isOpen}
          onClose={hideModal}
        />
      )}
    </ModalContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de modal.
 * 
 * @throws {Error} Se usado fora de um ModalProvider
 */
export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

