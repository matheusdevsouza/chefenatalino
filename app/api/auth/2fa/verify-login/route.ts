import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { verifyTOTP, verifyBackupCode, isValidTOTPFormat, isValidBackupCodeFormat } from '@/lib/security/totp'
import { getUser2FA, update2FALastUsed, markBackupCodeAsUsed, log2FAAttempt, countRecentFailedAttempts, hasValidBackupCode } from '@/lib/db/queries-2fa'
import { getUserByEmail } from '@/lib/db/queries'
import { securityLogger } from '@/lib/security/logger'
import { getClientIdentifier } from '@/lib/security/rateLimiter'
import { authRateLimiter, checkRateLimit } from '@/lib/security/rateLimiter'
import crypto from 'crypto'

/**
 * Endpoint para verificar código 2FA durante login.
 * 
 * Valida código TOTP ou código de backup fornecido pelo usuário.
 * Deve ser chamado após validação de senha bem-sucedida.
 * 
 * Requer email e código no body. Retorna tokens JWT se válido.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, useBackupCode, remember: rememberRaw } = body
    const remember = rememberRaw === true

    if (!email || !code) {
      const response = NextResponse.json(
        { error: 'Email e código são obrigatórios', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const clientIp = getClientIdentifier(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting para prevenir brute force
    const rateLimitCheck = await checkRateLimit(authRateLimiter, clientIp)
    
    if (!rateLimitCheck.allowed) {
      securityLogger.log({
        type: 'rate_limit',
        ip: clientIp,
        endpoint: '/api/auth/2fa/verify-login',
        details: 'Rate limit excedido em verificação 2FA',
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos.', success: false },
        { status: 429 }
      )
      response.headers.set('Retry-After', Math.ceil(rateLimitCheck.resetTime / 1000).toString())
      return setAPIHeaders(response)
    }

    // Buscar usuário
    const user = await getUserByEmail(email.trim().toLowerCase())

    if (!user) {
      // Não revelar se usuário existe ou não
      const response = NextResponse.json(
        { error: 'Código inválido', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    // Verificar se 2FA está ativado
    const twoFA = await getUser2FA(user.id)

    if (!twoFA?.two_factor_enabled || !twoFA.two_factor_secret) {
      const response = NextResponse.json(
        { error: '2FA não está ativado para esta conta', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    // Verificar tentativas recentes falhadas (proteção brute force)
    const recentFailures = await countRecentFailedAttempts(user.id, clientIp, 15)

    if (recentFailures >= 5) {
      securityLogger.log({
        type: 'suspicious_activity',
        ip: clientIp,
        endpoint: '/api/auth/2fa/verify-login',
        details: `Múltiplas tentativas falhadas de 2FA para usuário ${user.id}`,
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Muitas tentativas falhadas. Aguarde 15 minutos.', success: false },
        { status: 429 }
      )
      return setAPIHeaders(response)
    }

    let isValid = false
    let codeType: 'totp' | 'backup' = 'totp'

    if (useBackupCode) {
      // Verificar código de backup
      if (!isValidBackupCodeFormat(code)) {
        await log2FAAttempt(user.id, false, clientIp, userAgent, 'backup')
        const response = NextResponse.json(
          { error: 'Código de backup inválido', success: false },
          { status: 400 }
        )
        return setAPIHeaders(response)
      }

      // Buscar códigos de backup não utilizados
      const { getUnusedBackupCodes } = await import('@/lib/db/queries-2fa')
      const backupCodes = await getUnusedBackupCodes(user.id)
      const codeHashes = backupCodes.map(bc => bc.code_hash)

      isValid = verifyBackupCode(code, codeHashes)

      if (isValid) {
        // Encontrar hash correspondente e marcar como usado
        const codeHash = crypto
          .createHash('sha256')
          .update(code.toUpperCase())
          .digest('hex')

        await markBackupCodeAsUsed(codeHash, user.id)
        codeType = 'backup'
      }
    } else {
      // Verificar código TOTP
      if (!isValidTOTPFormat(code)) {
        await log2FAAttempt(user.id, false, clientIp, userAgent, 'totp')
        const response = NextResponse.json(
          { error: 'Código inválido. Deve ter 6 dígitos numéricos.', success: false },
          { status: 400 }
        )
        return setAPIHeaders(response)
      }

      isValid = verifyTOTP(twoFA.two_factor_secret, code)
      codeType = 'totp'
    }

    if (!isValid) {
      await log2FAAttempt(user.id, false, clientIp, userAgent, codeType)

      securityLogger.log({
        type: 'suspicious_activity',
        ip: clientIp,
        endpoint: '/api/auth/2fa/verify-login',
        details: `Código 2FA inválido para usuário ${user.id}`,
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Código inválido', success: false },
        { status: 401 }
      )
      return setAPIHeaders(response)
    }

    // Código válido - registrar sucesso e atualizar timestamp
    await log2FAAttempt(user.id, true, clientIp, userAgent, codeType)
    await update2FALastUsed(user.id)

    // Criar tokens JWT
    const { createAccessToken, createRefreshToken } = await import('@/lib/security/auth')
    
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
      usedBackupCode: useBackupCode,
    })

    // Configurar cookies HTTP-only e Secure
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
    console.error('Erro ao verificar 2FA no login:', error)
    const response = NextResponse.json(
      { error: 'Erro ao verificar código. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

