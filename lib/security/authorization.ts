import { NextRequest } from 'next/server'
import { getAuthenticatedUser, isValidUUID } from './auth'
import { query } from '@/lib/db'

/**
 * Resultado de uma verificação de autorização.
 */
export interface AuthorizationResult {
  authorized: boolean
  user?: {
    id: string
    email: string
  }
  error?: string
}

/**
 * Verifica se o usuário está autenticado e autorizado a acessar um recurso.
 * 
 * Valida autenticação através de token JWT e verifica ownership do recurso
 * antes de permitir acesso. Previne acesso não autorizado a dados de outros usuários.
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthorizationResult> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return {
      authorized: false,
      error: 'Não autenticado',
    }
  }

  if (!isValidUUID(user.userId)) {
    return {
      authorized: false,
      error: 'ID de usuário inválido',
    }
  }

  return {
    authorized: true,
    user: {
      id: user.userId,
      email: user.email,
    },
  }
}

/**
 * Verifica se o usuário autenticado é o dono de um recurso específico.
 * 
 * Compara o userId do token com o userId do recurso, garantindo que
 * apenas o proprietário possa acessar seus próprios dados.
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string | null | undefined
): Promise<AuthorizationResult> {
  const authResult = await requireAuth(request)

  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  if (!resourceUserId) {
    return {
      authorized: true,
      user: authResult.user,
    }
  }

  if (!isValidUUID(resourceUserId)) {
    return {
      authorized: false,
      error: 'ID de recurso inválido',
    }
  }

  if (authResult.user.id !== resourceUserId) {
    return {
      authorized: false,
      error: 'Acesso negado: recurso não pertence ao usuário',
    }
  }

  return {
    authorized: true,
    user: authResult.user,
  }
}

/**
 * Verifica se o usuário tem assinatura ativa.
 * 
 * Consulta o banco de dados para verificar se o usuário possui
 * uma assinatura válida antes de permitir acesso a recursos premium.
 */
export async function requireSubscription(
  userId: string
): Promise<boolean> {
  if (!isValidUUID(userId)) {
    return false
  }

  try {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = $1
          AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
      ) as has_subscription`,
      [userId]
    )

    return result.rows[0]?.has_subscription === true
  } catch {
    return false
  }
}

/**
 * Middleware de autorização para rotas protegidas.
 * 
 * Wrapper que valida autenticação e ownership antes de executar
 * handlers de API, retornando erro 401/403 se não autorizado.
 */
export async function withAuthorization<T>(
  request: NextRequest,
  handler: (user: { id: string; email: string }) => Promise<T>,
  options?: {
    requireOwnershipOf?: string | null
    requireSubscription?: boolean
  }
): Promise<T | Response> {
  const authResult = await requireAuth(request)

  if (!authResult.authorized || !authResult.user) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Não autorizado', success: false }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (options?.requireOwnershipOf !== undefined) {
    const ownershipResult = await requireOwnership(request, options.requireOwnershipOf)

    if (!ownershipResult.authorized) {
      return new Response(
        JSON.stringify({ error: ownershipResult.error || 'Acesso negado', success: false }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  if (options?.requireSubscription) {
    const hasSubscription = await requireSubscription(authResult.user.id)

    if (!hasSubscription) {
      return new Response(
        JSON.stringify({ error: 'Assinatura requerida', success: false }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  return handler(authResult.user)
}

