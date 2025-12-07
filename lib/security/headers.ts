import { NextResponse } from 'next/server'

/**
 * Aplica headers de segurança HTTP em uma resposta.
 * 
 * Configura múltiplos headers de segurança incluindo Content Security Policy,
 * X-Frame-Options, Strict-Transport-Security e outros, seguindo as melhores
 * práticas de segurança web. Remove headers que podem vazar informações
 * sobre a infraestrutura do servidor.
 */

export function setSecurityHeaders(response: NextResponse): NextResponse {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  return response
}

/**
 * Aplica headers de segurança específicos para rotas de API.
 * 
 * Estende os headers de segurança padrão com configurações adicionais
 * para prevenir cache de respostas de API, garantindo que dados sensíveis
 * não sejam armazenados em cache por proxies ou navegadores.
 */

export function setAPIHeaders(response: NextResponse): NextResponse {
  response = setSecurityHeaders(response)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

