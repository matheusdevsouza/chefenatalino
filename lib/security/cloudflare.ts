import { NextRequest } from 'next/server'

/**
 * Sistema de integração e validação com Cloudflare.
 * 
 * Valida requisições provenientes do Cloudflare e extrai informações
 * úteis como IP real do cliente, país, etc.
 * 
 * Cloudflare adiciona headers específicos que podem ser validados:
 * - CF-Connecting-IP: IP real do cliente
 * - CF-Ray: ID único da requisição
 * - CF-IPCountry: País do cliente
 * - CF-Visitor: Protocolo (HTTP/HTTPS)
 */

export interface CloudflareInfo {
  isCloudflare: boolean
  realIP?: string
  country?: string
  rayID?: string
  protocol?: 'http' | 'https'
  isBot?: boolean
}

/**
 * Valida se a requisição vem do Cloudflare.
 * 
 * Verifica headers específicos do Cloudflare para garantir
 * que a requisição passou pelo proxy do Cloudflare.
 */
export function isCloudflareRequest(request: NextRequest): boolean {
  const headers = request.headers
  
  // Cloudflare sempre adiciona CF-Ray em requisições válidas
  const cfRay = headers.get('cf-ray')
  const cfConnectingIP = headers.get('cf-connecting-ip')
  
  // Verificar se temos headers do Cloudflare
  return !!(cfRay || cfConnectingIP)
}

/**
 * Extrai informações do Cloudflare da requisição.
 */
export function getCloudflareInfo(request: NextRequest): CloudflareInfo {
  const headers = request.headers
  
  const cfRay = headers.get('cf-ray')
  const cfConnectingIP = headers.get('cf-connecting-ip')
  const cfCountry = headers.get('cf-ipcountry')
  const cfVisitor = headers.get('cf-visitor')
  const cfBot = headers.get('cf-bot')
  
  const isCloudflare = !!(cfRay || cfConnectingIP)
  
  if (!isCloudflare) {
    return { isCloudflare: false }
  }
  
  // Extrair protocolo do CF-Visitor
  let protocol: 'http' | 'https' | undefined
  if (cfVisitor) {
    try {
      const visitor = JSON.parse(cfVisitor)
      protocol = visitor.scheme === 'https' ? 'https' : 'http'
    } catch {
      // Ignorar erro de parsing
    }
  }
  
  return {
    isCloudflare: true,
    realIP: cfConnectingIP || undefined,
    country: cfCountry || undefined,
    rayID: cfRay || undefined,
    protocol,
    isBot: cfBot === '1' || cfBot === 'true',
  }
}

/**
 * Obtém o IP real do cliente considerando Cloudflare.
 * 
 * Prioriza CF-Connecting-IP quando disponível, caso contrário
 * usa headers padrão de proxy.
 */
export function getRealClientIP(request: NextRequest): string {
  const headers = request.headers
  
  // Priorizar Cloudflare
  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }
  
  // Headers padrão de proxy
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Valida se o país do cliente está em uma lista permitida.
 * 
 * Útil para bloquear requisições de países específicos.
 */
export function isCountryAllowed(
  request: NextRequest,
  allowedCountries: string[]
): boolean {
  const cfInfo = getCloudflareInfo(request)
  
  if (!cfInfo.country) {
    // Se não temos informação do país, permitir (pode não estar usando Cloudflare)
    return true
  }
  
  return allowedCountries.includes(cfInfo.country.toUpperCase())
}

/**
 * Verifica se a requisição é de um bot conhecido do Cloudflare.
 */
export function isCloudflareBot(request: NextRequest): boolean {
  const cfInfo = getCloudflareInfo(request)
  return cfInfo.isBot === true
}

/**
 * Obtém informações de segurança do Cloudflare.
 */
export function getCloudflareSecurityInfo(request: NextRequest): {
  threatScore?: number
  isVerifiedBot?: boolean
  isTor?: boolean
  isProxy?: boolean
} {
  const headers = request.headers
  
  const threatScore = headers.get('cf-threat-score')
  const verifiedBot = headers.get('cf-verified-bot')
  const isTor = headers.get('cf-tor')
  const isProxy = headers.get('cf-proxy')
  
  return {
    threatScore: threatScore ? parseInt(threatScore, 10) : undefined,
    isVerifiedBot: verifiedBot === '1' || verifiedBot === 'true',
    isTor: isTor === '1' || isTor === 'true',
    isProxy: isProxy === '1' || isProxy === 'true',
  }
}

/**
 * Valida se a requisição deve ser bloqueada baseado em informações do Cloudflare.
 */
export function shouldBlockRequest(request: NextRequest): {
  block: boolean
  reason?: string
} {
  const securityInfo = getCloudflareSecurityInfo(request)
  
  // Bloquear se threat score muito alto
  if (securityInfo.threatScore !== undefined && securityInfo.threatScore > 50) {
    return {
      block: true,
      reason: `Threat score alto: ${securityInfo.threatScore}`,
    }
  }
  
  // Bloquear Tor (opcional - descomente se necessário)
  // if (securityInfo.isTor) {
  //   return {
  //     block: true,
  //     reason: 'Requisição de rede Tor detectada',
  //   }
  // }
  
  return { block: false }
}

