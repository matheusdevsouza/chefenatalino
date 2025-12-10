'use client'

import { useState } from 'react'
import { Shield, AlertCircle, Key } from 'lucide-react'

/**
 * Componente para verificação de 2FA durante login.
 * 
 * Exibido quando usuário com 2FA ativado faz login.
 * Permite inserir código TOTP ou código de backup.
 */
interface TwoFactorLoginProps {
  email: string
  remember: boolean
  onSuccess: () => void
  onError?: (error: string) => void
}

export function TwoFactorLogin({ email, remember, onSuccess, onError }: TwoFactorLoginProps) {
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify() {
    if (!code) {
      setError('Digite um código')
      return
    }

    if (!useBackupCode && code.length !== 6) {
      setError('Código TOTP deve ter 6 dígitos')
      return
    }

    if (useBackupCode && code.length !== 8) {
      setError('Código de backup deve ter 8 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: code.toUpperCase(),
          useBackupCode,
          remember,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido')
      }

      onSuccess()
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao verificar código'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Autenticação de Dois Fatores</h2>
        <p className="text-sm text-gray-600">
          Digite o código do seu app de autenticação ou código de backup
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {useBackupCode ? 'Código de Backup (8 caracteres)' : 'Código TOTP (6 dígitos)'}
          </label>
          <input
            type="text"
            inputMode={useBackupCode ? 'text' : 'numeric'}
            pattern={useBackupCode ? '[A-Z0-9]{8}' : '[0-9]{6}'}
            maxLength={useBackupCode ? 8 : 6}
            value={code}
            onChange={(e) => {
              const value = useBackupCode
                ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                : e.target.value.replace(/\D/g, '')
              setCode(value)
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleVerify()
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useBackupCode"
            checked={useBackupCode}
            onChange={(e) => {
              setUseBackupCode(e.target.checked)
              setCode('')
              setError(null)
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="useBackupCode" className="text-sm text-gray-700 cursor-pointer">
            Usar código de backup
          </label>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || !code || (useBackupCode ? code.length !== 8 : code.length !== 6)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Key className="w-5 h-5" />
          {loading ? 'Verificando...' : 'Verificar e Entrar'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Não tem acesso ao seu app? Use um código de backup ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}

