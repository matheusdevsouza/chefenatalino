import { NextRequest, NextResponse } from 'next/server'
import { getActiveSubscriptionWithPlanDetails } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Retorna plano ativo do usuário. Permite acesso mesmo sem assinatura.
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const subscription = await getActiveSubscriptionWithPlanDetails(user.id)

        if (!subscription) {
          return setAPIHeaders(NextResponse.json({
            success: true,
            planId: null,
            subscription: null,
          }))
        }

        const response = NextResponse.json({
          success: true,
          planId: subscription.plan_id,
          subscription: {
            id: subscription.id,
            plan_id: subscription.plan_id,
            status: subscription.status,
            expires_at: subscription.expires_at,
            plan_name: subscription.plan_name || null,
            plan_slug: subscription.plan_slug || null,
            plan_price: subscription.plan_price || null,
          },
        })
        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar plano ativo:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar plano ativo', success: false, planId: null },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}


