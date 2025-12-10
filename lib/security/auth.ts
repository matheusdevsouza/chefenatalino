import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
)

const ACCESS_TOKEN_EXPIRY = '15m'
const DEFAULT_REFRESH_TOKEN_EXPIRY = '7d'
const REMEMBER_REFRESH_TOKEN_EXPIRY = '30d'

export interface JWTPayload {
  userId: string
  email: string
  remember?: boolean
  iat?: number
  exp?: number
  [key: string]: string | number | boolean | undefined
}

/**
 * Gera um token JWT de acesso para o usuário.
 * 
 * Token de curta duração (15 minutos) usado para autenticação
 * em requisições API. Armazenado em cookie HTTP-only seguro.
 */
export async function createAccessToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET_KEY)

  return token
}

/**
 * Gera um token JWT de refresh para o usuário.
 * 
 * Token de longa duração (7 dias) usado para renovar tokens de acesso
 * sem exigir novo login. Armazenado em cookie HTTP-only seguro.
 */
export async function createRefreshToken(
  payload: JWTPayload,
  options?: { remember?: boolean; expiresIn?: string }
): Promise<string> {
  const expiry = options?.expiresIn
    ? options.expiresIn
    : options?.remember
    ? REMEMBER_REFRESH_TOKEN_EXPIRY
    : DEFAULT_REFRESH_TOKEN_EXPIRY

  const token = await new SignJWT({
    ...payload,
    remember: options?.remember ?? payload.remember ?? false,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(SECRET_KEY)

  return token
}

/**
 * Verifica e decodifica um token JWT.
 * 
 * Valida assinatura, expiração e estrutura do token antes de retornar
 * o payload. Retorna null se o token for inválido ou expirado.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Obtém o usuário autenticado a partir dos cookies da requisição.
 * 
 * Verifica o token de acesso no cookie e retorna o payload se válido.
 * Retorna null se não houver token ou se for inválido.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('access-token')?.value

  if (!token) {
    return null
  }

  return await verifyToken(token)
}

/**
 * Valida se um userId pertence ao usuário autenticado.
 * 
 * Previne acesso não autorizado a dados de outros usuários através
 * de validação de ownership antes de operações sensíveis.
 */
export async function validateOwnership(
  request: NextRequest,
  targetUserId: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return false
  }

  if (!isValidUUID(targetUserId) || !isValidUUID(user.userId)) {
    return false
  }

  return user.userId === targetUserId
}

/**
 * Valida se uma string é um UUID válido.
 * 
 * Previne SQL injection e erros de banco através de validação
 * rigorosa de formato UUID antes de usar em queries.
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Gera um nonce criptograficamente seguro para CSP.
 * 
 * Usado para permitir scripts inline específicos sem usar
 * 'unsafe-inline', melhorando segurança do Content Security Policy.
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

