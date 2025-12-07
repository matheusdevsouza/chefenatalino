import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      const response = NextResponse.json(
        { error: 'Email é obrigatório', success: false },
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

    const user = await getUserByEmail(email.trim().toLowerCase())

    if (!user) {
      const response = NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá as instruções.'
      })
      return setAPIHeaders(response)
    }

    if (!user.is_active) {
      const response = NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá as instruções.'
      })
      return setAPIHeaders(response)
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL',
      [user.id]
    )

    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    )

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/redefinir-senha?token=${token}`
    
    console.log(`[FORGOT PASSWORD] Reset link for ${email}: ${resetLink}`)

    const response = NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções.'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao processar recuperação de senha:', error)
    const response = NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

