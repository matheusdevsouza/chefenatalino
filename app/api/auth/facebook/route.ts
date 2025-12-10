import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * Rota de autenticação OAuth com Facebook.
 * 
 * Esta é uma estrutura básica. Para implementação completa:
 * 1. Configure OAuth app no Facebook Developers
 * 2. Adicione FACEBOOK_CLIENT_ID e FACEBOOK_CLIENT_SECRET ao .env
 * 3. Implemente fluxo OAuth completo com next-auth ou similar
 */

export async function GET(request: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/facebook/callback`
  
  if (!clientId) {
    const response = NextResponse.json(
      { error: 'Facebook OAuth não configurado', success: false },
      { status: 503 }
    )
    return setAPIHeaders(response)
  }

  // Redirecionar para página de autorização do Facebook
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent('email public_profile')}&` +
    `response_type=code`

  return NextResponse.redirect(authUrl)
}

