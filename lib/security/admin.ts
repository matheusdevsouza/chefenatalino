import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from './auth'
import { query } from '@/lib/db'

/**
 * Sistema de autorização administrativa.
 * 
 * Verifica se o usuário autenticado tem permissões de administrador
 * antes de permitir acesso a recursos administrativos.
 */

/**
 * Verifica se o usuário autenticado é administrador.
 */
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean
  user?: {
    id: string
    email: string
  }
  error?: string
}> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return {
      authorized: false,
      error: 'Não autenticado',
    }
  }

  // Verificar se é admin no banco de dados
  try {
    const result = await query<{ is_admin: boolean }>(
      'SELECT is_admin FROM users WHERE id = $1 AND deleted_at IS NULL',
      [user.userId]
    )

    const userData = result.rows[0]

    if (!userData) {
      return {
        authorized: false,
        error: 'Usuário não encontrado',
      }
    }

    if (!userData.is_admin) {
      return {
        authorized: false,
        error: 'Acesso negado: requer permissões de administrador',
      }
    }

    return {
      authorized: true,
      user: {
        id: user.userId,
        email: user.email,
      },
    }
  } catch (error: any) {
    console.error('Erro ao verificar permissões de admin:', error)
    return {
      authorized: false,
      error: 'Erro ao verificar permissões',
    }
  }
}

/**
 * Middleware de autorização administrativa.
 * 
 * Wrapper que valida autenticação e permissões de admin antes de executar
 * handlers de API administrativos, retornando erro 401/403 se não autorizado.
 */
export async function withAdminAuth<T>(
  request: NextRequest,
  handler: (user: { id: string; email: string }) => Promise<T>
): Promise<T | Response> {
  const authResult = await requireAdmin(request)

  if (!authResult.authorized || !authResult.user) {
    return new Response(
      JSON.stringify({ 
        error: authResult.error || 'Acesso negado', 
        success: false,
        requiresAdmin: true,
      }),
      {
        status: authResult.error === 'Não autenticado' ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return handler(authResult.user)
}

