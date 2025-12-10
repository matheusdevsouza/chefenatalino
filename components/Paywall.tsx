'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import { Button } from './Button'
import { useApp } from '@/context/AppContext'
import { useModal } from '@/context/ModalContext'

/**
 * Propriedades do componente Paywall.
 * 
 * @interface PaywallProps
 * @property {React.ReactNode} children
 * @property {string} [moduleName='conteúdo']
 */

interface PaywallProps {
  children: React.ReactNode
  moduleName?: string
}

/**
 * Componente de paywall que controla o acesso a conteúdo premium.
 * 
 * Exibe o conteúdo fornecido apenas quando o usuário possui acesso premium.
 * Caso contrário, aplica efeitos visuais de bloqueio (blur e overlay) e
 * apresenta uma interface para liberação do acesso mediante pagamento.
 * 
 * @param {PaywallProps} props 
 * @returns {JSX.Element} 
 */

export function Paywall({ children, moduleName = 'conteúdo' }: PaywallProps) {
  const { isPaid, setIsPaid } = useApp()
  const { showConfirm } = useModal()

  const handleUnlock = async () => {
    showConfirm({
      message: 'Deseja liberar o acesso premium por R$ 19,90?',
      title: 'Confirmar Acesso Premium',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
        
        if (!userId) {
          const newUserId = crypto.randomUUID()
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_id', newUserId)
          }
        }

        setIsPaid(true)
        
        try {
          const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
          if (currentUserId) {
            await fetch('/api/user/subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUserId,
              },
              body: JSON.stringify({ action: 'upgrade' }),
            })
          }
        } catch (error) {
          console.error('Erro ao processar upgrade:', error)
        }
      },
    })
  }

  if (isPaid) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/95 rounded-xl border border-vermelho-claro">
        <Lock className="w-12 h-12 text-vermelho-medio" />
        <p className="text-center text-vermelho-escuro font-semibold">
          Conteúdo Premium Bloqueado
        </p>
        <Button
          variant="primary"
          onClick={handleUnlock}
          className="mt-2"
        >
          Liberar Acesso Premium – R$ 19,90
        </Button>
      </div>
    </div>
  )
}
