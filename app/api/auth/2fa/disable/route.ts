import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'
import { verifyTOTP, isValidTOTPFormat } from '@/lib/security/totp'
import { getUser2FA, updateUser2FA, deleteAllBackupCodes } from '@/lib/db/queries-2fa'
import { securityLogger } from '@/lib/security/logger'
import { getClientIdentifier } from '@/lib/security/rateLimiter'

/**
 * Endpoint para desativar 2FA.
 * 
 * Requer código TOTP válido para confirmar que o usuário tem acesso
 * ao app de autenticação antes de desativar.
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
            { error: 'Código TOTP é obrigatório para desativar 2FA', success: false },
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

        // Verificar se 2FA está ativado
        const twoFA = await getUser2FA(user.id)

        if (!twoFA?.two_factor_enabled || !twoFA.two_factor_secret) {
          const response = NextResponse.json(
            { error: '2FA não está ativado', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Verificar código TOTP
        const isValid = verifyTOTP(twoFA.two_factor_secret, code)

        if (!isValid) {
          const clientIp = getClientIdentifier(request)
          const userAgent = request.headers.get('user-agent') || 'unknown'

          securityLogger.log({
            type: 'suspicious_activity',
            ip: clientIp,
            endpoint: '/api/auth/2fa/disable',
            details: `Tentativa de desativar 2FA com código inválido para usuário ${user.id}`,
            userAgent,
          })

          const response = NextResponse.json(
            { error: 'Código inválido. Não foi possível desativar 2FA.', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Desativar 2FA e remover códigos de backup
        await updateUser2FA(user.id, false, null)
        await deleteAllBackupCodes(user.id)

        const clientIp = getClientIdentifier(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'

        securityLogger.log({
          type: 'suspicious_activity',
          ip: clientIp,
          endpoint: '/api/auth/2fa/disable',
          details: `2FA desativado para usuário ${user.id}`,
          userAgent,
        })

        const response = NextResponse.json({
          success: true,
          message: '2FA desativado com sucesso',
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao desativar 2FA:', error)
        const response = NextResponse.json(
          { error: 'Erro ao desativar 2FA. Tente novamente.', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

