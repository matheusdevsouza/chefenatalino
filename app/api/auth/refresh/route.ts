import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, createAccessToken } from '@/lib/security/auth'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * Renova access token usando refresh token (sem exigir novo login).
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      const response = NextResponse.json(
        { error: 'Refresh token não encontrado', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    const payload = await verifyToken(refreshToken)

    if (!payload) {
      const response = NextResponse.json(
        { error: 'Refresh token inválido ou expirado', success: false },
        { status: 401 }
      )
      
      response.cookies.delete('access-token')
      response.cookies.delete('refresh-token')
      
      return setAPIHeaders(response)
    }

    // Buscar dados atualizados do usuário para incluir na resposta
    const { getUserById } = await import('@/lib/db/queries')
    const updatedUser = await getUserById(payload.userId)

    const newAccessToken = await createAccessToken({
      userId: payload.userId,
      email: payload.email,
    })

    const remember = payload.remember === true

    const responseData: any = {
      success: true,
      message: 'Token renovado com sucesso'
    }

    // Incluir dados atualizados do usuário na resposta (name, email, etc)
    // para o cliente poder atualizar o localStorage
    if (updatedUser) {
      responseData.user = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar_url: updatedUser.avatar_url,
      }
    }

    const response = NextResponse.json(responseData)

    const isProduction = process.env.NODE_ENV === 'production'
    
    response.cookies.set('access-token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    /**
     * Reutiliza mesmo refresh token mas atualiza maxAge baseado em remember.
     */
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
      path: '/',
    })

    return setAPIHeaders(response)
  } catch (error: any) {
    const response = NextResponse.json(
      { error: 'Erro ao renovar token', success: false },
      { status: 500 }
    )
    
    response.cookies.delete('access-token')
    response.cookies.delete('refresh-token')
    
    return setAPIHeaders(response)
  }
}

