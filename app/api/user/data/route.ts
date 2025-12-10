import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Busca dados do usuário autenticado. Verifica ownership e remove password_hash.
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const requestedUserId = request.nextUrl.searchParams.get('userId') || user.id

        if (requestedUserId !== user.id) {
          const response = NextResponse.json(
            { error: 'Acesso negado', success: false },
            { status: 403 }
          )
          return setAPIHeaders(response)
        }

        const dbUser = await getUserById(user.id)
        
        if (!dbUser) {
          const response = NextResponse.json(
            { error: 'Usuário não encontrado', success: false },
            { status: 404 }
          )
          return setAPIHeaders(response)
        }

        const { password_hash, ...userData } = dbUser

        const response = NextResponse.json({ 
          success: true, 
          user: userData
        })
        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar dados do usuário:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar dados do usuário', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

