import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { sendPasswordResetEmail } from '@/lib/email/password-reset'
import { sanitizeEmail } from '@/lib/security/clientInputSanitizer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      const response = NextResponse.json(
        { error: 'Email é obrigatório', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    // Sanitizar email
    const sanitizedEmail = sanitizeEmail(email.trim().toLowerCase())
    if (!sanitizedEmail) {
      const response = NextResponse.json(
        { error: 'Email inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    // Buscar usuário por email (já descriptografado pela função getUserByEmail)
    const user = await getUserByEmail(sanitizedEmail)

    // Sempre retornar sucesso (security best practice - não revelar se email existe)
    // Mas só enviar email se usuário existir e estiver ativo
    if (user && user.is_active) {
      try {
        // getUserByEmail já retorna email e name descriptografados
        await sendPasswordResetEmail(user.id, user.email, user.name)
      } catch (emailError: any) {
        console.error('Erro ao enviar email de recuperação:', emailError)
        // Não expor erro ao usuário por segurança
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções.'
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao processar recuperação de senha:', error)
    const response = NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções.'
    })
    return setAPIHeaders(response)
  }
}

