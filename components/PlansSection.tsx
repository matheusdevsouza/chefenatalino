'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'
import type { SubscriptionPlan } from '@/database/types'

interface PlanFeatures {
  ceias_completas?: number
  sugestoes_presentes?: number
  sorteios_amigo_secreto?: number
  mensagens_natal?: number
  suporte?: string
  novas_funcionalidades?: boolean
  acesso_beta?: boolean
}

/**
 * Exibe os planos de assinatura buscados do banco de dados
 */

export function PlansSection() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        const data = await response.json()
        if (data.success) {
          setPlans(data.plans)
        }
      } catch (error) {
        console.error('Erro ao buscar planos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('user_id')
      const userEmail = localStorage.getItem('user_email')
      setIsLoggedIn(!!(userId && userEmail))
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const getFeatures = (plan: SubscriptionPlan): PlanFeatures => {
    if (typeof plan.features === 'object' && plan.features !== null && !Array.isArray(plan.features)) {
      return plan.features as PlanFeatures
    }
    if (typeof plan.features === 'string') {
      try {
        return JSON.parse(plan.features)
      } catch {
        return {}
      }
    }
    return {}
  }

  const renderFeature = (label: string, value: any, isPopular: boolean) => {
    const checkColor = isPopular ? 'text-white' : 'text-red-600'
    const textColor = isPopular ? 'text-white/90' : 'text-slate-700'
    
    if (typeof value === 'boolean' && value) {
      return (
        <div className="flex items-start gap-2">
          <Check className={`w-5 h-5 ${checkColor} flex-shrink-0 mt-0.5`} />
          <span className={`${textColor} text-sm`}>{label}</span>
        </div>
      )
    }
    if (typeof value === 'number') {
      if (value === -1) {
        return (
          <div className="flex items-start gap-2">
            <Check className={`w-5 h-5 ${checkColor} flex-shrink-0 mt-0.5`} />
            <span className={`${textColor} text-sm`}><strong>Mensagens ilimitadas</strong></span>
          </div>
        )
      }
      return (
        <div className="flex items-start gap-2">
          <Check className={`w-5 h-5 ${checkColor} flex-shrink-0 mt-0.5`} />
          <span className={`${textColor} text-sm`}><strong>{value} {label}</strong></span>
        </div>
      )
    }
    if (typeof value === 'string') {
      return (
        <div className="flex items-start gap-2">
          <Check className={`w-5 h-5 ${checkColor} flex-shrink-0 mt-0.5`} />
          <span className={`${textColor} text-sm`}>{label}</span>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="text-slate-600 mt-4">Carregando planos...</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return null
  }

  const popularPlanIndex = plans.length > 1 ? Math.floor(plans.length / 2) : -1

  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
      {plans.map((plan, idx) => {
        const features = getFeatures(plan)
        const isPopular = idx === popularPlanIndex
        
        return (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
              isPopular
                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white relative overflow-hidden shadow-2xl border-4 border-red-500 transform scale-105 md:scale-100 lg:scale-105'
                : 'bg-white border-2 border-slate-200 hover:border-red-300 hover:shadow-xl'
            }`}
          >
            {isPopular && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 px-4 py-1 rounded-bl-2xl font-bold text-xs uppercase tracking-wider">
                Mais Popular
              </div>
            )}

            <div className={`mb-6 ${isPopular ? 'relative z-10' : ''}`}>
              <h3 className={`font-serif text-2xl mb-2 ${isPopular ? '' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${isPopular ? 'text-white/90' : 'text-slate-600'}`}>
                {plan.description || ''}
              </p>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${isPopular ? '' : 'text-slate-900'}`}>
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${isPopular ? 'text-white/80' : 'text-slate-500'}`}>
                  por mês
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
              {features.ceias_completas !== undefined &&
                renderFeature('ceias completas por mês', features.ceias_completas, isPopular)}
              {features.sugestoes_presentes !== undefined &&
                renderFeature('sugestões de presentes', features.sugestoes_presentes, isPopular)}
              {features.sorteios_amigo_secreto !== undefined &&
                renderFeature('sorteios de amigo secreto', features.sorteios_amigo_secreto, isPopular)}
              {features.mensagens_natal !== undefined &&
                renderFeature('mensagens de Natal', features.mensagens_natal, isPopular)}
              {features.suporte && (
                <div className="flex items-start gap-2">
                  <Check
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isPopular ? 'text-white' : 'text-red-600'
                    }`}
                  />
                  <span className={isPopular ? 'text-white/90 text-sm' : 'text-slate-700 text-sm'}>
                    {features.suporte === 'email' && 'Suporte por email'}
                    {features.suporte === 'prioritario' && 'Suporte prioritário'}
                    {features.suporte === 'prioritario_24_7' && 'Suporte prioritário 24/7'}
                  </span>
                </div>
              )}
              {features.novas_funcionalidades && (
                <div className="flex items-start gap-2">
                  <Check
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isPopular ? 'text-white' : 'text-red-600'
                    }`}
                  />
                  <span className={isPopular ? 'text-white/90 text-sm' : 'text-slate-700 text-sm'}>
                    Novas funcionalidades primeiro
                  </span>
                </div>
              )}
              {features.acesso_beta && (
                <div className="flex items-start gap-2">
                  <Check
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isPopular ? 'text-white' : 'text-red-600'
                    }`}
                  />
                  <span className={isPopular ? 'text-white/90 text-sm' : 'text-slate-700 text-sm'}>
                    Acesso beta a novas funcionalidades
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              {isLoggedIn ? (
                <Button
                  size="lg"
                  variant="ghost"
                  disabled
                  className={`w-full text-base py-5 font-semibold rounded-xl opacity-50 cursor-not-allowed ${
                    isPopular
                      ? 'bg-white text-red-600'
                      : 'border-2 border-red-600 text-red-600'
                  }`}
                >
                  Já está logado
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(`/checkout?plan=${plan.slug}`)
                  }}
                  className={`w-full text-base py-5 font-semibold rounded-xl ${
                    isPopular
                      ? 'bg-white text-red-600 hover:bg-white/90'
                      : 'border-2 border-red-600 text-red-600 hover:bg-red-50'
                  }`}
                >
                  Começar Agora
                  {isPopular && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

