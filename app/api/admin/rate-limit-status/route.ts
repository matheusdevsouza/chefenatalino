import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { getRedisStatus, checkRedisHealth } from '@/lib/security/redis'
import { 
  generalRateLimiter, 
  apiRateLimiter, 
  strictRateLimiter,
  getRateLimitInfo 
} from '@/lib/security/rateLimiter'
import { getClientIdentifier } from '@/lib/security/rateLimiter'

/**
 * Endpoint administrativo para verificar status do rate limiting.
 * 
 * Retorna informações sobre:
 * - Status do Redis (disponibilidade, fallback para memória)
 * - Health check do Redis
 * - Status atual de rate limits para o IP/usuário (general, api, strict)
 * - Métricas de uso e identificador do cliente
 * 
 * Requer autenticação administrativa (implementar conforme necessário).
 */
export async function GET(request: NextRequest) {
  try {
    const redisStatus = getRedisStatus()
    const redisHealth = await checkRedisHealth()
    const identifier = getClientIdentifier(request)

    /**
     * Obter informações de rate limits atuais para os três tipos de limiters.
     * 
     * Busca informações em paralelo para melhor performance.
     */
    const [generalInfo, apiInfo, strictInfo] = await Promise.all([
      getRateLimitInfo(generalRateLimiter, identifier),
      getRateLimitInfo(apiRateLimiter, identifier),
      getRateLimitInfo(strictRateLimiter, identifier),
    ])

    const response = NextResponse.json({
      success: true,
      redis: {
        available: redisStatus.available,
        fallbackToMemory: redisStatus.fallbackToMemory,
        health: redisHealth,
      },
      rateLimits: {
        general: generalInfo,
        api: apiInfo,
        strict: strictInfo,
      },
      identifier,
      timestamp: new Date().toISOString(),
    })

    return setAPIHeaders(response)
  } catch (error: any) {
    const response = NextResponse.json(
      {
        success: false,
        error: 'Erro ao obter status de rate limiting',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

