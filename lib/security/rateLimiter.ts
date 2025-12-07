import { RateLimiterMemory } from 'rate-limiter-flexible'

/**
 * Limitador de taxa para a API do Gemini.
 * Permite 10 requisições por minuto por IP.
 */

export const apiRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 300,
})

/**
 * Limitador de taxa geral para todas as rotas.
 * Permite 100 requisições por minuto por IP.
 */

export const generalRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
  blockDuration: 60,
})

/**
 * Limitador de taxa restrito para endpoints sensíveis.
 * Permite 5 requisições por minuto por IP.
 */

export const strictRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 600,
})

/**
 * Verifica se uma requisição está dentro do limite de taxa permitido.
 * 
 * Retorna objeto indicando se a requisição é permitida, quantas requisições
 * restam e o tempo até o próximo reset do contador.
 */

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const rateLimiterRes = await limiter.consume(identifier)
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
 * Prioriza headers de proxies e CDNs para obter o IP real do cliente,
 * considerando diferentes configurações de infraestrutura (Cloudflare, Vercel, etc.).
 */

export function getClientIdentifier(request: Request | { headers: Headers }): string {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || 
             (forwarded ? forwarded.split(',')[0].trim() : null) || 
             realIp || 
             'unknown'
  
  return ip
}

