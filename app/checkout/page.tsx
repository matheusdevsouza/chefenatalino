'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, UserPlus, LogIn } from 'lucide-react'
import { Button } from '@/components/Button'
import { Check } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

/**
 * Componente interno da página de checkout
 */

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan')

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('user_id')
      const userEmail = localStorage.getItem('user_email')
      setIsLoggedIn(!!(userId && userEmail))
    }
  }, [])

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planSlug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/plans?slug=${planSlug}`)
        const data = await response.json()
        if (data.success && data.plan) {
          setPlan(data.plan)
        }
      } catch (error) {
        console.error('Erro ao buscar plano:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [planSlug])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-[#d4d4d4]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
        <Header />

        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-[#3a3a3a] text-center">
              <Lock className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h1 className="font-serif text-2xl text-slate-900 dark:text-[#f5f5f5] mb-4">Assinatura em desenvolvimento</h1>
              <p className="text-slate-600 dark:text-[#d4d4d4] mb-6">
                O sistema de pagamento está em desenvolvimento. Em breve você poderá assinar um plano diretamente pelo site.
              </p>
              
              <Link href="/">
                <Button variant="primary" className="w-full sm:w-auto">
                  Voltar para Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
      <Header />

      <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-[#3a3a3a]">
            <div className="text-center mb-8">
              <Lock className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h1 className="font-serif text-3xl text-slate-900 dark:text-[#f5f5f5] mb-2">Crie sua conta primeiro</h1>
              <p className="text-slate-600 dark:text-[#d4d4d4] mb-6">
                Para assinar um plano e ter acesso às funcionalidades, você precisa criar uma conta.
              </p>
            </div>

          {plan && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 border border-red-200 dark:border-red-800">
              <h2 className="font-serif text-xl text-slate-900 dark:text-[#f5f5f5] mb-2">Plano selecionado:</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">{formatPrice(plan.price)}</span>
                <span className="text-slate-600 dark:text-[#d4d4d4]">/mês</span>
              </div>
              <p className="text-slate-700 dark:text-[#d4d4d4] font-semibold">{plan.name}</p>
              {plan.description && (
                <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mt-1">{plan.description}</p>
              )}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-[#3a3a3a] rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-4">Ao criar sua conta, você terá acesso a:</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-[#d4d4d4]">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Planejamento completo de ceia com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Sugestões personalizadas de presentes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Gerador de amigo secreto</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Lista de compras automática</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Cronograma minuto-a-minuto</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span>Mensagens personalizadas de Natal</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/registro${planSlug ? `?plan=${planSlug}` : ''}`} className="flex-1">
              <Button variant="primary" size="lg" className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar conta
              </Button>
            </Link>
            
            <Link href="/login" className="flex-1">
              <Button variant="ghost" size="lg" className="w-full border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogIn className="w-4 h-4 mr-2" />
                Já tenho uma conta
              </Button>
            </Link>
          </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Carregando...</p>
          </div>
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  )
}

