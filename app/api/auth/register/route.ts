import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      const response = NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    if (name.trim().length < 2) {
      const response = NextResponse.json(
        { error: 'Nome deve ter pelo menos 2 caracteres', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim().toLowerCase())) {
      const response = NextResponse.json(
        { error: 'Email inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    if (password.length < 6) {
      const response = NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const existingUser = await getUserByEmail(email.trim().toLowerCase())
    if (existingUser) {
      const response = NextResponse.json(
        { error: 'Este email já está cadastrado', success: false },
        { status: 409 }
      )
      return setAPIHeaders(response)
    }
    
    const passwordHashResult = await query(
      'SELECT crypt($1, gen_salt(\'bf\')) as password_hash',
      [password]
    )

    const password_hash = passwordHashResult.rows[0]?.password_hash

    if (!password_hash) {
      const response = NextResponse.json(
        { error: 'Erro ao processar senha', success: false },
        { status: 500 }
      )
      return setAPIHeaders(response)
    }

    const result = await query(
      `INSERT INTO users (name, email, password_hash, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, avatar_url, email_verified, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        password_hash,
        true
      ]
    )

    const user = result.rows[0]

    if (!user) {
      const response = NextResponse.json(
        { error: 'Erro ao criar conta', success: false },
        { status: 500 }
      )
      return setAPIHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified
      },
      message: 'Conta criada com sucesso'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    
    if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.code === '23505') {
      const response = NextResponse.json(
        { error: 'Este email já está cadastrado', success: false },
        { status: 409 }
      )
      return setAPIHeaders(response)
    }

    const response = NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

