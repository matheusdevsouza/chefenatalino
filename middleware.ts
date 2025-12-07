import { NextRequest, NextResponse } from 'next/server'
import { setSecurityHeaders } from '@/lib/security/headers'
import { generalRateLimiter, getClientIdentifier, checkRateLimit } from '@/lib/security/rateLimiter'
import { securityLogger } from '@/lib/security/logger'

/**
 * Middleware global de segurança do Next.js.
 * 
 * Intercepta todas as requisições para aplicar medidas de segurança:
 * rate limiting, validação de headers, detecção de User-Agents suspeitos
 * e prevenção de path traversal. Aplica headers de segurança HTTP e
 * registra eventos de segurança para monitoramento.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIp = getClientIdentifier(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  const rateLimitCheck = await checkRateLimit(generalRateLimiter, clientIp)
  
  if (!rateLimitCheck.allowed) {
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
    securityLogger.log({
      type: 'suspicious_activity',
      ip: clientIp,
      endpoint: pathname,
      details: `User-Agent suspeito: ${userAgent}`,
      userAgent,
    })
  }

  if (pathname.includes('..') || pathname.includes('//')) {
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

