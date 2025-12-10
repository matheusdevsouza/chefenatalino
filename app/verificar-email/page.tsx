'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/Button'

/**
 * Componente interno da página de verificação de email
 */
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      setMessage('Token não fornecido')
      return
    }

    verifyEmail()
  }, [token])

  async function verifyEmail() {
    if (!token) return

    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage('Email verificado com sucesso! Você já pode fazer login.')
      } else {
        /**
         * Se o erro for "Token já foi utilizado", verificar se email está verificado.
         * 
         * Pode ser que o email já esteja verificado mas a página ainda mostre erro.
         * Nesse caso, informamos ao usuário que pode fazer login normalmente.
         */
        if (data.error === 'Token já foi utilizado') {
          setStatus('error')
          setMessage('Este link de verificação já foi usado. Se seu email já foi verificado, você pode fazer login normalmente.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Token inválido ou expirado')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro ao verificar email. Tente novamente.')
    }
  }

  /**
   * Tenta obter email do localStorage. Se não encontrar, pede via prompt.
   */
  async function handleResend() {
    setResending(true)
    try {
      let email = ''
      
      if (typeof window !== 'undefined') {
        const savedEmail = localStorage.getItem('pending_verification_email')
        if (savedEmail) {
          email = savedEmail
        }
      }

      if (!email) {
        const userEmail = prompt('Digite seu email para reenviar a verificação:')
        if (!userEmail) {
          setResending(false)
          return
        }
        email = userEmail.trim()
      }

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.')
        setStatus('success')
      } else {
        setMessage(data.error || 'Erro ao reenviar email')
        setStatus('error')
      }
    } catch (error) {
      setMessage('Erro ao reenviar email. Tente novamente.')
      setStatus('error')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#2e2e2e] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#3a3a3a] p-8 sm:p-10">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5]">Verificando email...</h2>
              <p className="text-slate-600 dark:text-[#d4d4d4]">Aguarde enquanto verificamos seu token.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5]">Email Verificado!</h2>
              <p className="text-slate-600 dark:text-[#d4d4d4]">{message}</p>
              <div className="pt-4">
                <Button
                  onClick={() => router.push('/login')}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5]">Erro na Verificação</h2>
              <p className="text-slate-600 dark:text-[#d4d4d4]">{message}</p>
              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleResend}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Reenviar Email de Verificação
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            </div>
          )}

          {status === 'no-token' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="w-16 h-16 text-slate-400 dark:text-[#a3a3a3]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5]">Token Não Fornecido</h2>
              <p className="text-slate-600 dark:text-[#d4d4d4]">
                Acesse o link de verificação enviado para seu email ou faça login para reenviar.
              </p>
              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleResend}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Reenviar Email de Verificação
                    </>
                  )}
                </Button>
                <Link href="/login">
                  <Button variant="ghost" size="lg" className="w-full">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#3a3a3a] text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-[#d4d4d4]">Carregando...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

