import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * Remove cookies HTTP-only (access-token e refresh-token). Remoção deve ser feita pelo servidor.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logout realizado com sucesso'
  })

  response.cookies.delete('access-token')
  response.cookies.delete('refresh-token')

  return setAPIHeaders(response)
}

