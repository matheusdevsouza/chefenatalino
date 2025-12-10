import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { verifyEmailToken, resendVerificationEmail } from '@/lib/email/verification'
import { getAuthenticatedUser } from '@/lib/security/auth'

/**
 * Endpoint GET para verificar email usando token.
 * 
 * Valida formato (hex 64 chars) e verifica no banco antes de marcar como verificado.
 */
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

    /**
     * Token deve ser hex de 64 caracteres (SHA-256 hash).
     */
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      const response = NextResponse.json(
        { error: 'Token inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const result = await verifyEmailToken(token)

    if (!result.valid) {
      const response = NextResponse.json(
        { error: result.error || 'Token inválido ou expirado', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso!'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao verificar email:', error)
    const response = NextResponse.json(
      { error: 'Erro ao verificar email. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

/**
 * Endpoint POST para reenviar email de verificação.
 * 
 * Com JWT: usa userId do token (mais seguro).
 * Sem JWT: aceita email no corpo e busca por hash.
 * Previne reenvio se email já está verificado.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const user = await getAuthenticatedUser(request)

    /**
     * Com JWT: mais seguro (não expõe email na requisição).
     */
    if (user) {
      await resendVerificationEmail(user.userId, false)
      
      const response = NextResponse.json({
        success: true,
        message: 'Email de verificação reenviado com sucesso!'
      })
      return setAPIHeaders(response)
    }

    const { email } = body

    if (!email || typeof email !== 'string') {
      const response = NextResponse.json(
        { error: 'Email não fornecido ou inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      const response = NextResponse.json(
        { error: 'Formato de email inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    /**
     * Busca por hash previne timing attacks e mantém privacidade (email não fica em logs).
     */
    const { createSearchableHash } = await import('@/lib/security/encryption')
    const emailHash = createSearchableHash(email.trim().toLowerCase())

    try {
      await resendVerificationEmail(emailHash, true)
    } catch (resendError: any) {
      console.error('[VERIFY-EMAIL] Erro ao reenviar:', {
        email: email.substring(0, 5) + '***',
        error: resendError.message,
        stack: resendError.stack
      })
      throw resendError
    }

    const response = NextResponse.json({
      success: true,
      message: 'Email de verificação reenviado com sucesso!'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao reenviar email de verificação:', error)
    
    /**
     * Mensagens específicas: diferencia não encontrado, já verificado e erros SMTP.
     */
    let errorMessage = 'Erro ao reenviar email. Tente novamente.'
    let statusCode = 500

    if (error.message === 'Usuário não encontrado') {
      errorMessage = 'Email não encontrado. Verifique se o email está correto.'
      statusCode = 404
    } else if (error.message === 'Email já está verificado') {
      errorMessage = 'Este email já foi verificado. Você pode fazer login normalmente.'
      statusCode = 400
    } else if (error.message.includes('SMTP')) {
      errorMessage = 'Erro ao enviar email. Tente novamente mais tarde.'
      statusCode = 500
    } else if (error.message) {
      errorMessage = error.message
    }

    const response = NextResponse.json(
      { error: errorMessage, success: false },
      { status: statusCode }
    )
    return setAPIHeaders(response)
  }
}

