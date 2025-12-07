import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      const response = NextResponse.json(
        { error: 'User ID não fornecido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const user = await getUserById(userId)
    
    if (!user) {
      const response = NextResponse.json(
        { error: 'Usuário não encontrado', success: false },
        { status: 404 }
      )
      return setAPIHeaders(response)
    }

    const { password_hash, ...userData } = user

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

