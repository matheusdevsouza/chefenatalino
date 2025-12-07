import { NextRequest, NextResponse } from 'next/server'
import { hasActiveSubscription } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      const response = NextResponse.json(
        { isPaid: false, message: 'Usuário não identificado' },
        { status: 200 }
      )
      return setAPIHeaders(response)
    }

    const isPaid = await hasActiveSubscription(userId)

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
}



