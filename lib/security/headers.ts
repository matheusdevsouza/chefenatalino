import { NextResponse } from 'next/server'

/**
 * Aplica headers de segurança HTTP em uma resposta.
 * 
 * Configura múltiplos headers de segurança incluindo Content Security Policy,
 * X-Frame-Options, Strict-Transport-Security e outros, seguindo as melhores
 * práticas de segurança web. Remove headers que podem vazar informações
 * sobre a infraestrutura do servidor.
 */

export function setSecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  /**
   * Detectar ambiente de forma mais robusta.
   * 
   * Em produção (next start), NODE_ENV pode não estar definido, então verificamos também
   * se estamos rodando o servidor de produção do Next.js.
   */
  const isDevelopment = 
    process.env.NODE_ENV === 'development' || 
    process.env.NEXT_PHASE === 'phase-development-server'
  
  const isProduction = process.env.NODE_ENV === 'production'
  
  /**
   * Dev: Next.js precisa unsafe-inline/unsafe-eval (Fast Refresh, HMR).
   * Prod: Next.js gera scripts inline dinamicamente - usa 'strict-dynamic' + 'unsafe-inline'.
   */
  let scriptSrc = "'self'"
  
  if (nonce) {
    scriptSrc += ` 'nonce-${nonce}'`
  }
  
  /**
   * Hashes mudam a cada build - por isso usamos 'strict-dynamic' em vez de hashes fixos.
   */
  const nextjsInlineHashes = [
    "'sha256-Q+8tPsjVtiDsjF/Cv8FMOpg2Yg91oKFKDAJat1PPb2g='",
    "'sha256-CFL8btkcsXma16IS52k7qnG3+TCDJV4Pst1VCgbukuQ='",
    "'sha256-UCJb27hkdBw4XRfwb7dMok/nhue0AQevtgo0ZfxjRc4='",
    "'sha256-RZOWOG4wGEYzqqM00JxvyL1c21wsgpcfk9jhNb9LiIk='",
    "'sha256-Z+htuFZo1FpBAAkKpOkv8rSc+HYB1dmpC8N+EWDqpnI='",
  ]
  
  if (isDevelopment) {
    scriptSrc += " 'unsafe-inline' 'unsafe-eval'"
  } else {
    /**
     * 'strict-dynamic' permite scripts carregados por scripts confiáveis.
     * 'unsafe-inline' necessário porque Next.js injeta scripts inline no HTML.
     */
    scriptSrc += ` 'strict-dynamic' 'unsafe-inline'`
  }
  
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    /**
     * unsafe-inline necessário para Tailwind CSS (classes dinâmicas).
     */
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
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

