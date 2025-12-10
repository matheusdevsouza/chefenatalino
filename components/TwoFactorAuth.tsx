'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldOff, Copy, Check, AlertCircle, Download } from 'lucide-react'

/**
 * Gerencia 2FA: configuração (QR Code), verificação (TOTP), desativação e backup codes.
 */
interface TwoFactorAuthProps {
  userEmail: string
  isEnabled?: boolean
  onStatusChange?: (enabled: boolean) => void
}

export function TwoFactorAuth({ userEmail, isEnabled: initialEnabled, onStatusChange }: TwoFactorAuthProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled || false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'backup' | 'disable'>('idle')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)

  useEffect(() => {
    check2FAStatus()
  }, [])

  async function check2FAStatus() {
    try {
      const response = await fetch('/api/user/data', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setIsEnabled(data.user?.two_factor_enabled || false)
      }
    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error)
    }
  }

  async function handleSetup() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao configurar 2FA')
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setOtpauthUrl(data.otpauthUrl)
      setStep('verify')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!code || code.length !== 6) {
      setError('Digite um código de 6 dígitos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido')
      }

      setBackupCodes(data.backupCodes || [])
      setStep('backup')
      setIsEnabled(true)
      onStatusChange?.(true)
      setSuccess('2FA ativado com sucesso!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable() {
    if (!code || code.length !== 6) {
      setError('Digite um código de 6 dígitos para confirmar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao desativar 2FA')
      }

      setIsEnabled(false)
      setStep('idle')
      setCode('')
      onStatusChange?.(false)
      setSuccess('2FA desativado com sucesso')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateBackupCodes() {
    if (!code || code.length !== 6) {
      setError('Digite um código de 6 dígitos para confirmar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar códigos de backup')
      }

      setBackupCodes(data.backupCodes || [])
      setStep('backup')
      setCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyBackupCodes() {
    const text = backupCodes.join('\n')
    navigator.clipboard.writeText(text)
    setBackupCodesCopied(true)
    setTimeout(() => setBackupCodesCopied(false), 2000)
  }

  function downloadBackupCodes() {
    const text = `Códigos de Backup - Nome do Projeto\n\nSalve estes códigos em local seguro:\n\n${backupCodes.join('\n')}\n\nGerado em: ${new Date().toLocaleString('pt-BR')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-codes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (step === 'backup' && backupCodes.length > 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Códigos de Backup Gerados</h3>
              <p className="text-sm text-yellow-800">
                <strong>IMPORTANTE:</strong> Salve estes códigos em local seguro. Você precisará deles se perder acesso ao seu app de autenticação.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span className="text-gray-900">{code}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyBackupCodes}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {backupCodesCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Todos
              </>
            )}
          </button>
          <button
            onClick={downloadBackupCodes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar TXT
          </button>
        </div>

        <button
          onClick={() => {
            setStep('idle')
            setBackupCodes([])
            setCode('')
          }}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Concluir
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status atual do 2FA */}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <>
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">2FA Ativado</p>
                <p className="text-sm text-gray-600">Sua conta está protegida com autenticação de dois fatores</p>
              </div>
            </>
          ) : (
            <>
              <ShieldOff className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">2FA Desativado</p>
                <p className="text-sm text-gray-600">Ative para maior segurança da sua conta</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
          {success}
        </div>
      )}

      {/* Tela de setup/verificação com QR Code */}

      {step === 'setup' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Escaneie o QR Code abaixo com seu app de autenticação (Google Authenticator, Authy, etc.)
          </p>
          {qrCode && (
            <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
              <img src={qrCode} alt="QR Code 2FA" className="w-64 h-64" />
            </div>
          )}
          {otpauthUrl && (
            <div className="text-xs text-gray-500 break-all">
              Ou copie manualmente: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
            </div>
          )}
        </div>
      )}

      {(step === 'verify' || step === 'setup') && (
        <div className="space-y-4">
          {qrCode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de 6 dígitos do seu app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verificando...' : 'Verificar e Ativar'}
              </button>
            </>
          )}
          {!qrCode && isEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite seu código de 6 dígitos para confirmar
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>
              <button
                onClick={handleGenerateBackupCodes}
                disabled={loading || code.length !== 6}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Gerando...' : 'Gerar Novos Códigos'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Tela de desativação do 2FA */}

      {step === 'disable' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digite seu código de 6 dígitos para confirmar
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="000000"
            />
          </div>
          <button
            onClick={handleDisable}
            disabled={loading || code.length !== 6}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Desativando...' : 'Desativar 2FA'}
          </button>
        </div>
      )}

      {/* Ações principais quando em estado idle */}

      {step === 'idle' && (
        <div className="space-y-3">
          {!isEnabled ? (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Shield className="w-5 h-5" />
              {loading ? 'Configurando...' : 'Ativar 2FA'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep('disable')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ShieldOff className="w-5 h-5" />
                Desativar 2FA
              </button>
              <button
                onClick={() => {
                  setStep('verify')
                  setCode('')
                  setQrCode(null)
                  setSecret(null)
                  setOtpauthUrl(null)
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Gerar Novos Códigos de Backup
              </button>
            </>
          )}
        </div>
      )}

    </div>
  )
}

