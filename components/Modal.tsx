'use client'

import { useEffect, ReactNode } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from './Button'

/**
 * Tipos de modal com ícone e cores específicos.
 */
export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

/**
 * Propriedades do componente Modal.
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: ModalType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  children?: ReactNode
}

/**
 * Mapeamento de ícones por tipo de modal.
 */
const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  confirm: AlertCircle,
}

/**
 * Esquemas de cores por tipo de modal.
 */
const colors = {
  success: {
    icon: 'text-green-600',
    iconBg: 'bg-green-100',
    accent: 'text-green-600',
    border: 'border-green-200',
  },
  error: {
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
    accent: 'text-red-600',
    border: 'border-red-200',
  },
  warning: {
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    accent: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  info: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    accent: 'text-blue-600',
    border: 'border-blue-200',
  },
  confirm: {
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100',
    accent: 'text-amber-600',
    border: 'border-amber-200',
  },
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  children,
}: ModalProps) {
  const Icon = icons[type]
  const colorScheme = colors[type]
  const isConfirm = type === 'confirm'

  /**
   * Bloqueia scroll do body quando o modal está aberto.
   * Previne scroll da página por trás do modal.
   */
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

  /**
   * Adiciona listener para fechar modal com tecla Escape.
   * Remove listener quando modal fecha ou componente desmonta.
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const defaultTitle = isConfirm 
    ? 'Confirmar Ação' 
    : type === 'success' 
    ? 'Sucesso' 
    : type === 'error' 
    ? 'Erro' 
    : type === 'warning' 
    ? 'Atenção' 
    : 'Informação'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isConfirm) {
          onClose()
        }
      }}
    >
      {/* Backdrop com blur forte e escurecimento para focar atenção no modal */}

      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      />

      {/* Container principal do modal com animação de entrada */}

      <div
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{
          animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com ícone, título e botão de fechar */}

        <div className="relative px-6 py-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Ícone com background colorido baseado no tipo do modal */}

            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${colorScheme.iconBg} flex items-center justify-center shadow-sm`}>
              <Icon className={`w-7 h-7 ${colorScheme.icon}`} />
            </div>
            
            {/* Título do modal */}

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 font-serif leading-tight">
                {title || defaultTitle}
              </h3>
            </div>

            {/* Botão fechar (não exibido em modais de confirmação) */}

            {!isConfirm && (
              <button
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all duration-200"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo principal do modal (mensagem e children) */}

        <div className="px-6 py-6">
          <p className="text-slate-700 leading-relaxed text-base">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>

        {/* Footer com botões de ação (OK ou Confirmar/Cancelar) */}

        <div className="px-6 py-4 bg-gradient-to-t from-slate-50/80 to-transparent border-t border-slate-100">
          {isConfirm ? (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  if (onCancel) onCancel()
                  onClose()
                }}
                size="md"
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (onConfirm) onConfirm()
                  onClose()
                }}
                size="md"
                className="flex-1"
              >
                {confirmText}
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={onClose}
              size="md"
              className="w-full"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>

    </div>
  )
}
