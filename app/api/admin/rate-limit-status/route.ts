import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
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
 * - Status atual de rate limits para o IP/usuário (general, api, strict)
 * - Métricas de uso e identificador do cliente
 * 
 * NOTA: Rate limiting utiliza memória local. Não requer Redis.
 * 
 * Requer autenticação administrativa (implementar conforme necessário).
 */
export async function GET(request: NextRequest) {
  try {
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
      rateLimitEngine: 'memory',
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

