import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Retorna histórico de pagamentos do usuário
 * Suporta paginação e filtros
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        // Buscar total de pagamentos
        const countResult = await query(
          'SELECT COUNT(*) as total FROM payments WHERE user_id = $1',
          [user.id]
        )
        const total = parseInt(countResult.rows[0].total)

        // Buscar pagamentos com informações de assinatura
        const result = await query(
          `
          SELECT 
            p.id,
            p.amount,
            p.payment_method,
            p.status,
            p.created_at,
            p.paid_at,
            s.plan_id,
            sp.name as plan_name
          FROM payments p
          LEFT JOIN subscriptions s ON p.subscription_id = s.id
          LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
          WHERE p.user_id = $1
          ORDER BY p.created_at DESC
          LIMIT $2 OFFSET $3
          `,
          [user.id, limit, offset]
        )

        const payments = result.rows.map((payment: any) => ({
          id: payment.id,
          amount: parseFloat(payment.amount),
          payment_method: payment.payment_method,
          status: payment.status,
          plan_name: payment.plan_name || 'Plano não identificado',
          created_at: payment.created_at,
          paid_at: payment.paid_at,
        }))

        const response = NextResponse.json({
          success: true,
          data: {
            payments,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          },
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar pagamentos:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar pagamentos', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}
