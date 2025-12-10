import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { createAccessToken, createRefreshToken } from '@/lib/security/auth'
import { decrypt } from '@/lib/security/encryption'
import { loginSchema, validateInput } from '@/lib/security/inputValidator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    /**
     * Validação rigorosa usando Zod com detecção de SQL injection.
     * O validateInput também sanitiza e valida os dados de entrada.
     */
    let validatedData
    try {
      validatedData = validateInput(loginSchema, body)
    } catch (validationError: any) {
      const response = NextResponse.json(
        { error: validationError.message || 'Dados inválidos', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const { email, password, remember } = validatedData

    const user = await getUserByEmail(email)

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

    /**
     * Verificar se email está verificado.
     * Usuários com email não verificado não podem fazer login.
     */
    if (!user.email_verified) {
      const response = NextResponse.json({
        success: false,
        error: 'Email não verificado',
        requiresEmailVerification: true,
        message: 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada ou spam.'
      }, { status: 403 })
      return setAPIHeaders(response)
    }

    if (!user.password_hash) {
      console.error('[LOGIN] Password hash não encontrado para usuário:', user.id)
      const response = NextResponse.json(
        { error: 'Email ou senha incorretos', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    /**
     * Verificar senha usando pgcrypto.
     * 
     * crypt(password, hash) retorna um novo hash que deve ser igual ao hash original
     * se a senha estiver correta. Isso previne timing attacks.
     */
    const passwordCheck = await query<{ is_valid: boolean }>(
      'SELECT crypt($1, $2) = $2 as is_valid',
      [password, user.password_hash]
    )

    const isValid = passwordCheck.rows[0]?.is_valid === true

    if (!isValid) {
      console.error('[LOGIN] Senha inválida para usuário:', user.id)
      const response = NextResponse.json(
        { error: 'Email ou senha incorretos', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    /**
     * Se 2FA ativado, requer código TOTP antes de criar tokens JWT.
     */
    const { getUser2FA } = await import('@/lib/db/queries-2fa')
    const twoFA = await getUser2FA(user.id)

    if (twoFA?.two_factor_enabled) {
      await query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      )

      /**
       * Email descriptografado é necessário para exibir no componente TwoFactorLogin.
       */
      const decryptedEmail = decrypt(user.email) || user.email

      const response = NextResponse.json({
        success: true,
        requires2FA: true,
        message: 'Código de autenticação de dois fatores necessário',
        email: decryptedEmail, 
      })

      return setAPIHeaders(response)
    }

    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    /**
     * Access token: 15 minutos | Refresh token: 7 dias (ou 30 se remember = true)
     */
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
    })

    const refreshToken = await createRefreshToken(
      {
        userId: user.id,
        email: user.email,
        remember,
      },
      { remember }
    )

    const { password_hash: _, ...userData } = user

    const response = NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Login realizado com sucesso',
      requires2FA: false,
    })

    /**
     * Configurar cookies HTTP-only e Secure.
     * 
     * Cookies são HTTP-only para prevenir acesso via JavaScript (XSS).
     * Secure apenas em produção (HTTPS).
     * SameSite: 'lax' para prevenir CSRF mantendo usabilidade.
     */
    const isProduction = process.env.NODE_ENV === 'production'
    
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, 
      path: '/',
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}), 
      path: '/',
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

