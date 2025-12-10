import { NextRequest, NextResponse } from 'next/server'
import { hasActiveSubscription } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Verifica se usuário tem assinatura ativa. Permite acesso mesmo sem assinatura.
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const isPaid = await hasActiveSubscription(user.id)

        const response = NextResponse.json({ isPaid })
        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao verificar assinatura:', error)
        const response = NextResponse.json(
          { error: 'Erro ao verificar assinatura', isPaid: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}
