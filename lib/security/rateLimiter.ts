import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'
import { createRateLimiter, getRedisStatus } from './redis'

// Tipo unificado para rate limiters
export type RateLimiter = RateLimiterRedis | RateLimiterMemory

/**
 * Sistema avançado de rate limiting distribuído com Redis.
 * 
 * Implementa múltiplos níveis de rate limiting:
 * - Por IP (proteção contra abuso)
 * - Por usuário autenticado (limites personalizados)
 * - Por endpoint (limites específicos por rota)
 * 
 * Fallback automático para memória quando Redis não está disponível.
 */

// ============================================================================
// RATE LIMITERS POR IP
// ============================================================================

/**
 * Limitador de taxa geral para todas as rotas (por IP).
 * Permite 100 requisições por minuto por IP.
 * 
 * Usado no middleware global para proteção básica.
 */
export const generalRateLimiter = createRateLimiter({
  keyPrefix: 'rl:general',
  points: 100,
  duration: 60, // 1 minuto
  blockDuration: 60,
})

/**
 * Limitador de taxa para a API do Gemini (por IP).
 * Permite 10 requisições por minuto por IP.
 * 
 * Limite mais restrito devido ao custo e latência da API.
 */
export const apiRateLimiter = createRateLimiter({
  keyPrefix: 'rl:api:gemini',
  points: 10,
  duration: 60,
  blockDuration: 300, // Bloqueia por 5 minutos
  execEvenly: true, // Distribui requisições uniformemente
  execEvenlyMinDelayMs: 100,
})

/**
 * Limitador de taxa restrito para endpoints sensíveis (por IP).
 * Permite 5 requisições por minuto por IP.
 * 
 * Usado para login, registro, reset de senha, etc.
 */
export const strictRateLimiter = createRateLimiter({
  keyPrefix: 'rl:strict',
  points: 5,
  duration: 60,
  blockDuration: 600, // Bloqueia por 10 minutos
})

/**
 * Limitador de taxa para autenticação (por IP).
 * Permite 3 tentativas de login por 15 minutos.
 * 
 * Previne brute force attacks.
 */
export const authRateLimiter = createRateLimiter({
  keyPrefix: 'rl:auth',
  points: 3,
  duration: 900, // 15 minutos
  blockDuration: 1800, // Bloqueia por 30 minutos após 3 tentativas
})

// ============================================================================
// RATE LIMITERS POR USUÁRIO AUTENTICADO
// ============================================================================

/**
 * Cria um rate limiter específico para um usuário autenticado.
 * 
 * Permite limites personalizados baseados no plano de assinatura.
 * Usuários premium têm limites maiores.
 */
export function getUserRateLimiter(userId: string, isPremium: boolean = false): RateLimiter {
  const points = isPremium ? 500 : 100
  const keyPrefix = `rl:user:${userId}`
  
  return createRateLimiter({
    keyPrefix,
    points,
    duration: 60,
    blockDuration: 60,
  })
}

/**
 * Rate limiter para criação de conteúdo por usuário.
 * 
 * Limita criação de ceias, mensagens, etc. por usuário autenticado.
 */
export function getContentCreationLimiter(userId: string, planLimits: {
  ceias: number
  mensagens: number
  bebidas: number
}) {
  return {
    ceias: createRateLimiter({
      keyPrefix: `rl:user:${userId}:ceias`,
      points: planLimits.ceias,
      duration: 86400, // 24 horas
      blockDuration: 3600,
    }),
    mensagens: createRateLimiter({
      keyPrefix: `rl:user:${userId}:mensagens`,
      points: planLimits.mensagens,
      duration: 86400,
      blockDuration: 3600,
    }),
    bebidas: createRateLimiter({
      keyPrefix: `rl:user:${userId}:bebidas`,
      points: planLimits.bebidas,
      duration: 86400,
      blockDuration: 3600,
    }),
  }
}

// ============================================================================
// RATE LIMITERS POR ENDPOINT
// ============================================================================

/**
 * Rate limiters específicos por endpoint.
 * 
 * Permite configuração granular de limites por rota.
 */
export const endpointLimiters: Record<string, RateLimiter> = {
  '/api/ceia/save': createRateLimiter({
    keyPrefix: 'rl:endpoint:ceia:save',
    points: 20,
    duration: 60,
    blockDuration: 120,
  }),
  '/api/messages/save': createRateLimiter({
    keyPrefix: 'rl:endpoint:messages:save',
    points: 30,
    duration: 60,
    blockDuration: 120,
  }),
  '/api/drinks/save': createRateLimiter({
    keyPrefix: 'rl:endpoint:drinks:save',
    points: 20,
    duration: 60,
    blockDuration: 120,
  }),
  '/api/user/data': createRateLimiter({
    keyPrefix: 'rl:endpoint:user:data',
    points: 50,
    duration: 60,
    blockDuration: 60,
  }),
}

/**
 * Obtém rate limiter para um endpoint específico.
 */
export function getEndpointLimiter(endpoint: string): RateLimiter {
  return endpointLimiters[endpoint] || generalRateLimiter
}

// ============================================================================
// FUNÇÕES DE VERIFICAÇÃO
// ============================================================================

/**
 * Resultado de uma verificação de rate limit.
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked?: boolean
}

/**
 * Verifica se uma requisição está dentro do limite de taxa permitido.
 * 
 * Suporta tanto RateLimiterRedis quanto RateLimiterMemory.
 * Retorna informações detalhadas sobre o status do rate limit.
 */
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string
): Promise<RateLimitResult> {
  try {
    const rateLimiterRes = await limiter.consume(identifier) as RateLimiterRes
    
    return {
      allowed: true,
      remaining: rateLimiterRes.remainingPoints,
      resetTime: rateLimiterRes.msBeforeNext,
      blocked: false,
    }
  } catch (rateLimiterRes: any) {
    // RateLimiterRes quando bloqueado
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimiterRes.msBeforeNext || 0,
      blocked: true,
    }
  }
}

/**
 * Verifica múltiplos rate limits simultaneamente.
 * 
 * Útil quando um endpoint precisa verificar vários limites
 * (ex: limite geral + limite específico do endpoint).
 */
export async function checkMultipleRateLimits(
  limiters: Array<{ limiter: RateLimiter; identifier: string }>
): Promise<{
  allowed: boolean
  results: RateLimitResult[]
  firstBlocked?: RateLimitResult
}> {
  const results = await Promise.all(
    limiters.map(({ limiter, identifier }) => checkRateLimit(limiter, identifier))
  )

  const firstBlocked = results.find((r) => !r.allowed)

  return {
    allowed: !firstBlocked,
    results,
    firstBlocked,
  }
}

/**
 * Obtém informações sobre o status atual de rate limiting.
 * 
 * Útil para debug e monitoramento.
 */
export async function getRateLimitInfo(
  limiter: RateLimiter,
  identifier: string
): Promise<{
  remaining: number
  resetTime: number
  redisStatus: ReturnType<typeof getRedisStatus>
}> {
  try {
    const info = await limiter.get(identifier)
    
    return {
      remaining: info?.remainingPoints || 0,
      resetTime: info?.msBeforeNext || 0,
      redisStatus: getRedisStatus(),
    }
  } catch {
    return {
      remaining: 0,
      resetTime: 0,
      redisStatus: getRedisStatus(),
    }
  }
}

/**
 * Reseta o rate limit para um identificador específico.
 * 
 * Útil para testes ou quando necessário resetar limites manualmente.
 */
export async function resetRateLimit(
  limiter: RateLimiter,
  identifier: string
): Promise<boolean> {
  try {
    await limiter.delete(identifier)
    return true
  } catch {
    return false
  }
}

/**
 * Extrai o identificador do cliente a partir dos headers da requisição.
 * 
 * Prioriza headers de proxies e CDNs para obter o IP real do cliente,
 * considerando diferentes configurações de infraestrutura (Cloudflare, Vercel, etc.).
 * 
 * Também suporta identificação por usuário autenticado quando disponível.
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

/**
 * Obtém identificador composto para rate limiting avançado.
 * 
 * Combina IP e userId quando disponível para rate limiting mais granular.
 */
export function getCompositeIdentifier(
  request: Request | { headers: Headers },
  userId?: string
): {
  ip: string
  user: string | null
  composite: string
} {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || 
             (forwarded ? forwarded.split(',')[0].trim() : null) || 
             realIp || 
             'unknown'
  
  const user = userId || null
  const composite = user ? `${ip}:${user}` : ip

  return {
    ip,
    user,
    composite,
  }
}
