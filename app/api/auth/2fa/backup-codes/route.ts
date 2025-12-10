import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'
import { verifyTOTP, generateBackupCodes, isValidTOTPFormat } from '@/lib/security/totp'
import { getUser2FA, saveBackupCodes, deleteAllBackupCodes } from '@/lib/db/queries-2fa'
import { securityLogger } from '@/lib/security/logger'
import { getClientIdentifier } from '@/lib/security/rateLimiter'

/**
 * Endpoint para gerar novos códigos de backup.
 * 
 * Requer código TOTP válido para confirmar identidade antes de gerar
 * novos códigos. Códigos antigos são invalidados automaticamente.
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
            { error: 'Código TOTP é obrigatório para gerar novos códigos de backup', success: false },
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
            endpoint: '/api/auth/2fa/backup-codes',
            details: `Tentativa de gerar backup codes com código inválido para usuário ${user.id}`,
            userAgent,
          })

          const response = NextResponse.json(
            { error: 'Código inválido', success: false },
            { status: 400 }
          )
          return setAPIHeaders(response)
        }

        // Remover códigos antigos e gerar novos
        await deleteAllBackupCodes(user.id)

        const backupCodes = generateBackupCodes(10)
        const codeHashes = backupCodes.map(bc => bc.hashed)
        await saveBackupCodes(user.id, codeHashes)

        const backupCodesList = backupCodes.map(bc => bc.code)

        const clientIp = getClientIdentifier(request)
        const userAgent = request.headers.get('user-agent') || 'unknown'

        securityLogger.log({
          type: 'suspicious_activity',
          ip: clientIp,
          endpoint: '/api/auth/2fa/backup-codes',
          details: `Novos backup codes gerados para usuário ${user.id}`,
          userAgent,
        })

        const response = NextResponse.json({
          success: true,
          backupCodes: backupCodesList,
          message: 'Novos códigos de backup gerados com sucesso',
          warning: 'IMPORTANTE: Salve estes códigos em local seguro. Códigos antigos foram invalidados.',
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao gerar backup codes:', error)
        const response = NextResponse.json(
          { error: 'Erro ao gerar códigos de backup. Tente novamente.', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

/**
 * Endpoint para obter quantidade de códigos de backup disponíveis.
 * 
 * Não retorna os códigos em si, apenas a quantidade disponível.
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const { getUnusedBackupCodes } = await import('@/lib/db/queries-2fa')
        const backupCodes = await getUnusedBackupCodes(user.id)

        const response = NextResponse.json({
          success: true,
          count: backupCodes.length,
          message: backupCodes.length > 0 
            ? `Você tem ${backupCodes.length} código(s) de backup disponível(is)`
            : 'Nenhum código de backup disponível. Gere novos códigos.',
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao verificar backup codes:', error)
        const response = NextResponse.json(
          { error: 'Erro ao verificar códigos de backup', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

