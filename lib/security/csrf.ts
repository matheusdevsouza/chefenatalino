import { NextRequest } from 'next/server'
import crypto from 'crypto'

/**
 * Gera um token CSRF criptograficamente seguro.
 * 
 * Cria um token aleatório de 64 caracteres hexadecimais usando
 * geração criptográfica segura para prevenir ataques CSRF.
 */

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Valida um token CSRF comparando-o com o token armazenado em cookie.
 * 
 * Usa comparação segura contra timing attacks para verificar se o token
 * fornecido corresponde ao token armazenado no cookie da requisição.
 */

export function validateCSRFToken(request: NextRequest, token: string): boolean {
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  if (!cookieToken || !token) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(token)
  )
}

/**
 * Valida a origem de uma requisição para prevenir ataques CSRF.
 * 
 * Compara o header Origin ou Referer com o host da aplicação, garantindo
 * que a requisição seja originada do mesmo domínio. Em desenvolvimento,
 * a validação é sempre permitida para facilitar testes locais.
 */

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (process.env.NODE_ENV === 'development') {
    return true
  }

  if (origin && host) {
    try {
      const originUrl = new URL(origin)
      return originUrl.hostname === host || originUrl.hostname.endsWith(`.${host}`)
    } catch {
      return false
    }
  }

  if (referer && host) {
    try {
      const refererUrl = new URL(referer)
      return refererUrl.hostname === host || refererUrl.hostname.endsWith(`.${host}`)
    } catch {
      return false
    }
  }

  return false
}

