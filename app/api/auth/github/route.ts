import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * Rota de autenticação OAuth com GitHub.
 * 
 * Esta é uma estrutura básica. Para implementação completa:
 * 1. Configure OAuth app no GitHub Settings > Developer settings
 * 2. Adicione GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET ao .env
 * 3. Implemente fluxo OAuth completo com next-auth ou similar
 */

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`
  
  if (!clientId) {
    const response = NextResponse.json(
      { error: 'GitHub OAuth não configurado', success: false },
      { status: 503 }
    )
    return setAPIHeaders(response)
  }

  // Redirecionar para página de autorização do GitHub
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent('user:email')}`

  return NextResponse.redirect(authUrl)
}

