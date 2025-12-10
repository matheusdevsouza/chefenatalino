import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'

/**
 * Rate Limiter específico para Edge Runtime (Middleware).
 * 
 * Não usa Redis porque Edge Runtime não suporta conexões TCP.
 * Usa apenas RateLimiterMemory que funciona perfeitamente no Edge.
 */

/**
 * Rate limiter para middleware (Edge Runtime compatível).
 */
export const middlewareRateLimiter = new RateLimiterMemory({
  keyPrefix: 'rl:middleware',
  points: 100,
  duration: 60,
  blockDuration: 60,
})

/**
 * Resultado de uma verificação de rate limit.
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Verifica se uma requisição está dentro do limite de taxa permitido.
 */
export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  try {
    const rateLimiterRes = await middlewareRateLimiter.consume(identifier) as RateLimiterRes
    
    return {
      allowed: true,
      remaining: rateLimiterRes.remainingPoints,
      resetTime: rateLimiterRes.msBeforeNext,
    }
  } catch (rateLimiterRes: any) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimiterRes.msBeforeNext || 0,
    }
  }
}

/**
 * Extrai o identificador do cliente a partir dos headers da requisição.
 * 
 * Compatível com Edge Runtime - não usa dependências externas.
 */
export function getClientIdentifier(
  request: Request | { headers: Headers },
  userId?: string
): string {
  // Se há userId autenticado, usar como identificador primário
  if (userId) {
    return `user:${userId}`
  }

  // Caso contrário, usar IP (priorizando Cloudflare)
  const headers = request.headers
  const cfConnectingIp = headers.get('cf-connecting-ip')
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  
  // Priorizar Cloudflare IP quando disponível
  const ip = cfConnectingIp || 
             (forwarded ? forwarded.split(',')[0].trim() : null) || 
             realIp || 
             'unknown'
  
  return `ip:${ip}`
}

