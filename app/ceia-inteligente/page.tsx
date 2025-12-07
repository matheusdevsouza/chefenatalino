'use client'

import { CeiaInteligente } from '@/modules/CeiaInteligente'
import { ModuleHeader } from '@/components/ModuleHeader'
import { ChefHat, Lock } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

/**
 * Página do módulo Ceia Inteligente.
 * 
 * Verifica se o usuário está logado e tem plano ativo. Se não tiver,
 * mostra tela de bloqueio. Se tiver, exibe o módulo completo.
 */

export default function CeiaInteligentePage() {
  const { isPaid, isLoading } = useApp()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id')
      setUserId(storedUserId)
      if (!storedUserId && !isLoading) {
        router.push('/#precos')
      }
    }
  }, [isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!userId || !isPaid) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Home
          </Link>
          
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl mb-4 text-slate-900">
              Acesso Restrito
            </h1>
            
            {!userId ? (
              <>
                <p className="text-slate-600 text-lg mb-8">
                  Você precisa estar logado para acessar a Ceia Inteligente.
                </p>
                <p className="text-slate-500 mb-8">
                  Faça login ou crie uma conta para começar a usar todas as funcionalidades.
                </p>
                <Link href="/#precos">
                  <Button size="lg" variant="primary" className="bg-red-600 hover:bg-red-700 text-white">
                    Ver Planos e Preços
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-600 text-lg mb-8">
                  Você precisa ter um plano ativo para acessar a Ceia Inteligente.
                </p>
                <p className="text-slate-500 mb-8">
                  Assine um de nossos planos mensais para ter acesso completo a todas as funcionalidades.
                </p>
                <Link href="/#precos">
                  <Button size="lg" variant="primary" className="bg-red-600 hover:bg-red-700 text-white">
                    Ver Planos e Preços
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
        
        <ModuleHeader
          title="Ceia Inteligente"
          description="Planeje sua ceia de Natal completa com inteligência artificial. Cardápio personalizado, lista de compras e cronograma minuto-a-minuto."
          icon={ChefHat}
        />
        <CeiaInteligente />
      </div>
    </div>
  )
}
