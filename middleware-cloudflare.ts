import { NextRequest, NextResponse } from 'next/server'
import { 
  isCloudflareRequest, 
  getCloudflareInfo, 
  getRealClientIP,
  shouldBlockRequest 
} from '@/lib/security/cloudflare'
import { securityLogger } from '@/lib/security/logger'

/**
 * Valida requisições do Cloudflare. Bloqueia baseado em regras de segurança e registra eventos.
 * Retorna 403 se bloqueado, null para continuar.
 */

export function cloudflareMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const isCF = isCloudflareRequest(request)
  
  if (isCF) {
    const cfInfo = getCloudflareInfo(request)
    const blockCheck = shouldBlockRequest(request)
    
    if (blockCheck.block) {
      securityLogger.log({
        type: 'suspicious_activity',
        ip: getRealClientIP(request),
        endpoint: pathname,
        details: `Requisição bloqueada pelo Cloudflare: ${blockCheck.reason}`,
      })
      
      return NextResponse.json(
        { error: 'Requisição bloqueada por segurança' },
        { status: 403 }
      )
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[CLOUDFLARE]', {
        rayID: cfInfo.rayID,
        country: cfInfo.country,
        realIP: cfInfo.realIP,
        isBot: cfInfo.isBot,
      })
    }
  }
  
  return null
}

