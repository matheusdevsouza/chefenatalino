import { NextRequest, NextResponse } from 'next/server'
import { setSecurityHeaders } from '@/lib/security/headers'
import { 
  getClientIdentifier, 
  checkRateLimit
} from '@/lib/security/rateLimiter-edge'
import { securityLogger } from '@/lib/security/logger'
import { getAuthenticatedUser } from '@/lib/security/auth'
import { cloudflareMiddleware } from './middleware-cloudflare'

/**
 * Middleware global de segurança: rate limiting, validação de headers, detecção de User-Agents suspeitos,
 * prevenção de path traversal, integração Cloudflare.
 * 
 * Executa no Edge Runtime - validações completas de autorização são feitas nas rotas de API.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Validar Cloudflare (se configurado)

  const cfResponse = cloudflareMiddleware(request)
  if (cfResponse) {
    return cfResponse
  }

  /**
   * Proteger rotas administrativas.
   * 
   * Nota: Esta é apenas uma verificação básica de autenticação.
   * A validação completa de permissões de admin é feita nas rotas de API,
   * pois o middleware roda no Edge Runtime que não suporta conexões de banco de dados.
   */

  if (pathname.startsWith('/admin')) {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      if (pathname.startsWith('/admin/api')) {
        return NextResponse.json(
          {
            error: 'Não autenticado',
            success: false,
            requiresAdmin: true,
          },
          { status: 401 }
        )
      } else {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    // Verificação completa de is_admin será feita nas rotas de API

  }

  // Obter usuário autenticado para rate limiting mais preciso (por userId em vez de apenas IP)

  const user = await getAuthenticatedUser(request)
  const identifier = getClientIdentifier(request, user?.userId)

  // Verificar rate limit usando limiter de memória compatível com Edge Runtime

  const rateLimitCheck = await checkRateLimit(identifier)
  
  if (!rateLimitCheck.allowed) {
    const clientIp = getClientIdentifier(request)
    securityLogger.log({
      type: 'rate_limit',
      ip: clientIp,
      endpoint: pathname,
      details: 'Rate limit geral excedido',
      userAgent,
    })

    const response = NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
      { status: 429 }
    )
    
    response.headers.set('Retry-After', Math.ceil(rateLimitCheck.resetTime / 1000).toString())
    return setSecurityHeaders(response)
  }

  const response = NextResponse.next()

  setSecurityHeaders(response)

  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', rateLimitCheck.remaining.toString())

  /**
   * Padrões de User-Agent suspeitos.
   * 
   * Detecta ferramentas comuns de scanning e exploração:
   * - sqlmap, nikto, nmap: ferramentas de scanning
   * - burp, zap, w3af: proxies de segurança/teste
   * - acunetix, nessus: scanners de vulnerabilidade
   * - User-Agent vazio: pode indicar requisições automatizadas maliciosas
   */

  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /burp/i,
    /zap/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /^$/,
  ]

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    const clientIp = getClientIdentifier(request)
    securityLogger.log({
      type: 'suspicious_activity',
      ip: clientIp,
      endpoint: pathname,
      details: `User-Agent suspeito: ${userAgent}`,
      userAgent,
    })
  }

  // Detectar tentativas de path traversal (../ ou // no caminho)

  if (pathname.includes('..') || pathname.includes('//')) {
    const clientIp = getClientIdentifier(request)
    securityLogger.log({
      type: 'suspicious_activity',
      ip: clientIp,
      endpoint: pathname,
      details: 'Tentativa de path traversal detectada',
      userAgent,
    })

    return NextResponse.json(
      { error: 'Caminho inválido' },
      { status: 400 }
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

