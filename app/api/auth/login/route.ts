import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Email e senha são obrigatórios', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const user = await getUserByEmail(email.trim().toLowerCase())

    if (!user) {
      const response = NextResponse.json(
        { error: 'Email ou senha incorretos', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    if (!user.is_active) {
      const response = NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o suporte.', success: false },
        { status: 403 }
      )
      return setAPIHeaders(response)
    }

    const passwordCheck = await query(
      'SELECT crypt($1, $2) = $2 as is_valid',
      [password, user.password_hash]
    )

    let isValid = false
    
    if (user.password_hash) {
      if (passwordCheck.rows[0]?.is_valid) {
        isValid = true
      } else {
        isValid = password === user.password_hash
      }
    }

    if (!isValid) {
      const response = NextResponse.json(
        { error: 'Email ou senha incorretos', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    const { password_hash: _, ...userData } = user

    const response = NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Login realizado com sucesso'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao fazer login:', error)
    const response = NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

