import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'
import { generateTOTPSetup } from '@/lib/security/totp'
import { getUser2FA, updateUser2FA } from '@/lib/db/queries-2fa'
import { securityLogger } from '@/lib/security/logger'
import { getClientIdentifier } from '@/lib/security/rateLimiter'

/**
 * Inicia configuração de 2FA. Gera secret TOTP e QR Code.
 * 
 * NOTA: Em produção, considere Redis com TTL curto para secrets temporários.
 */
export async function POST(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {

        const current2FA = await getUser2FA(user.id)
        
        if (current2FA?.two_factor_enabled) {
          const response = NextResponse.json(
            { 
              error: '2FA já está ativado. Desative antes de configurar novamente.',
              success: false 
            },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        const totpSetup = await generateTOTPSetup(user.email)

        await updateUser2FA(user.id, false, totpSetup.secret)

        const clientIp = getClientIdentifier(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'

        securityLogger.log({
          type: 'suspicious_activity',
          ip: clientIp,
          endpoint: '/api/auth/2fa/setup',
          details: `Usuário ${user.id} iniciou configuração de 2FA`,
          userAgent,
        })

        const response = NextResponse.json({
          success: true,
          secret: totpSetup.secret, 
          qrCode: totpSetup.qrCodeDataUrl,
          otpauthUrl: totpSetup.otpauthUrl,
          message: 'Escaneie o QR Code com seu app de autenticação e confirme com um código de 6 dígitos',
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao configurar 2FA:', error)
        const response = NextResponse.json(
          { error: 'Erro ao configurar 2FA. Tente novamente.', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

