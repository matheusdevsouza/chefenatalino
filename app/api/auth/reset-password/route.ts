import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * API Route para redefinir senha usando token de recuperação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      const response = NextResponse.json(
        { error: 'Token e senha são obrigatórios', success: false },
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

    const tokenResult = await query(
      `SELECT prt.user_id 
       FROM password_reset_tokens prt
       INNER JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 
         AND prt.expires_at > CURRENT_TIMESTAMP
         AND prt.used_at IS NULL
         AND u.is_active = TRUE
         AND u.deleted_at IS NULL`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      const response = NextResponse.json(
        { error: 'Token inválido ou expirado', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const userId = tokenResult.rows[0].user_id

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

    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [password_hash, userId]
    )

    await query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    )

    const response = NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error)
    const response = NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

