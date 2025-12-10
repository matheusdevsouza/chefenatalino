import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/security/admin'

/**
 * Protege rotas /admin. API retorna JSON, páginas redirecionam para login.
 */

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const authResult = await requireAdmin(request)

  if (!authResult.authorized) {
    if (pathname.startsWith('/admin/api')) {
      return NextResponse.json(
        {
          error: authResult.error || 'Acesso negado',
          success: false,
          requiresAdmin: true,
        },
        { status: authResult.error === 'Não autenticado' ? 401 : 403 }
      )
    } else {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

