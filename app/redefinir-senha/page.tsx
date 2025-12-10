'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { sanitizeToken } from '@/lib/security/clientInputSanitizer'

/**
 * Componente interno da página de redefinição de senha
 */

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidToken(false)
        setValidating(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setValidToken(true)
        } else {
          setError(data.error || 'Token inválido ou expirado')
          setValidToken(false)
        }
      } catch (err) {
        setError('Erro ao validar token. Tente novamente.')
        setValidToken(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const validateForm = () => {
    if (!password) {
      setError('Senha é obrigatória')
      return false
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm() || !token) {
      return
    }

    setLoading(true)

    // Sanitizar token antes de enviar
    const sanitizedToken = sanitizeToken(token || '')
    if (!sanitizedToken) {
      setError('Token inválido')
      setLoading(false)
      return
    }

    // Password não precisa sanitização (será hasheado no backend)
    // Mas limitamos tamanho para prevenir DoS
    if (password.length > 1000) {
      setError('Senha muito longa')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: sanitizedToken,
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erro ao redefinir senha. Tente novamente.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError('Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
        <Header />
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Validando token...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
        <Header />
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-[#3a3a3a] text-center">
              <h1 className="font-serif text-2xl text-slate-900 dark:text-[#f5f5f5] mb-4">Link inválido ou expirado</h1>
              <p className="text-slate-600 dark:text-[#d4d4d4] mb-6">
                {error || 'O link de redefinição de senha é inválido ou expirou. Solicite um novo link.'}
              </p>
              
              <Link href="/recuperar-senha">
                <Button variant="primary" className="w-full">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
        <Header />
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-[#3a3a3a] text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="font-serif text-2xl text-slate-900 dark:text-[#f5f5f5] mb-2">Senha redefinida!</h1>
              <p className="text-slate-600 dark:text-[#d4d4d4] mb-6">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
              </p>
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  Ir para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] font-sans text-slate-900 dark:text-[#f5f5f5] selection:bg-vermelho-vibrante selection:text-white transition-colors duration-300">
      <Header />
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-slate-900 dark:text-[#f5f5f5] mb-2">Redefinir senha</h1>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Digite sua nova senha</p>
          </div>

        <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-[#3a3a3a]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                Nova senha
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-400 focus:border-red-600 dark:focus:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 dark:text-[#a3a3a3] hover:text-slate-600 dark:hover:text-[#d4d4d4] z-10"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                Confirmar nova senha
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3]" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-400 focus:border-red-600 dark:focus:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 dark:text-[#a3a3a3] hover:text-slate-600 dark:hover:text-[#d4d4d4] z-10"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Redefinir senha
                </>
              )}
            </Button>
          </form>
        </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-[#d4d4d4] hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Home</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

/**
 * Página de redefinição de senha com wrapper Suspense
 */

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-center px-4 py-12 transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Carregando...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
