import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'
import { verifyTOTP, generateBackupCodes, isValidTOTPFormat } from '@/lib/security/totp'
import { getUser2FA, updateUser2FA, saveBackupCodes } from '@/lib/db/queries-2fa'
import { securityLogger } from '@/lib/security/logger'
import { getClientIdentifier } from '@/lib/security/rateLimiter'

/**
 * Endpoint para verificar e ativar 2FA após configuração inicial.
 * 
 * Valida código TOTP fornecido pelo usuário e ativa 2FA permanentemente.
 * Gera códigos de backup que devem ser salvos pelo usuário.
 */
export async function POST(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const body = await request.json()
        const { code } = body

        if (!code) {
          const response = NextResponse.json(
            { error: 'Código TOTP é obrigatório', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        if (!isValidTOTPFormat(code)) {
          const response = NextResponse.json(
            { error: 'Código inválido. Deve ter 6 dígitos numéricos.', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Obter secret temporário salvo em setup
        const current2FA = await getUser2FA(user.id)

        if (!current2FA?.two_factor_secret) {
          const response = NextResponse.json(
            { error: 'Configuração de 2FA não encontrada. Inicie a configuração novamente.', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        if (current2FA.two_factor_enabled) {
          const response = NextResponse.json(
            { error: '2FA já está ativado', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Verificar código TOTP
        const isValid = verifyTOTP(current2FA.two_factor_secret, code)

        if (!isValid) {
          const clientIp = getClientIdentifier(request)
          const userAgent = request.headers.get('user-agent') || 'unknown'

          securityLogger.log({
            type: 'suspicious_activity',
            ip: clientIp,
            endpoint: '/api/auth/2fa/verify-setup',
            details: `Tentativa de ativação 2FA com código inválido para usuário ${user.id}`,
            userAgent,
          })

          const response = NextResponse.json(
            { error: 'Código inválido. Verifique seu app de autenticação e tente novamente.', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Ativar 2FA permanentemente
        await updateUser2FA(user.id, true, current2FA.two_factor_secret)

        // Gerar códigos de backup
        const backupCodes = generateBackupCodes(10)
        const codeHashes = backupCodes.map(bc => bc.hashed)
        await saveBackupCodes(user.id, codeHashes)

        // Retornar códigos de backup (mostrar apenas uma vez!)
        const backupCodesList = backupCodes.map(bc => bc.code)

        const clientIp = getClientIdentifier(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'

        securityLogger.log({
          type: 'suspicious_activity',
          ip: clientIp,
          endpoint: '/api/auth/2fa/verify-setup',
          details: `2FA ativado com sucesso para usuário ${user.id}`,
          userAgent,
        })

        const response = NextResponse.json({
          success: true,
          message: '2FA ativado com sucesso!',
          backupCodes: backupCodesList,
          warning: 'IMPORTANTE: Salve estes códigos de backup em local seguro. Você precisará deles se perder acesso ao seu app de autenticação.',
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao verificar setup 2FA:', error)
        const response = NextResponse.json(
          { error: 'Erro ao ativar 2FA. Tente novamente.', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

