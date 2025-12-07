import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriptionPlans, getSubscriptionPlanBySlug } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * Busca planos de assinatura do banco de dados.
 * 
 * Pode buscar todos os planos ou um plano específico pelo slug.
 */

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')
    
    if (slug) {
      const plan = await getSubscriptionPlanBySlug(slug)
      
      if (!plan) {
        const response = NextResponse.json(
          { error: 'Plano não encontrado', success: false },
          { status: 404 }
        )
        return setAPIHeaders(response)
      }
      
      const response = NextResponse.json({ 
        success: true, 
        plan 
      })
      return setAPIHeaders(response)
    }
    
    const plans = await getAllSubscriptionPlans()
    
    const response = NextResponse.json({ 
      success: true, 
      plans 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao buscar planos:', error)
    const response = NextResponse.json(
      { error: 'Erro ao buscar planos', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

