import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      const response = NextResponse.json(
        { error: 'Token não fornecido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const result = await query(
      `SELECT prt.*, u.email 
       FROM password_reset_tokens prt
       INNER JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 
         AND prt.expires_at > CURRENT_TIMESTAMP
         AND prt.used_at IS NULL
         AND u.is_active = TRUE
         AND u.deleted_at IS NULL`,
      [token]
    )

    if (result.rows.length === 0) {
      const response = NextResponse.json(
        { error: 'Token inválido ou expirado', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Token válido'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao validar token:', error)
    const response = NextResponse.json(
      { error: 'Erro ao validar token', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

