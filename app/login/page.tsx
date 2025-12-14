'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/Button'
import { sanitizeEmail } from '@/lib/security/clientInputSanitizer'
import { TwoFactorLogin } from '@/components/TwoFactorLogin'
import { useModal } from '@/context/ModalContext'

/**
 * Página de login com suporte a 2FA e verificação de email. Sanitiza inputs no cliente.
 */
export default function LoginPage() {
  const router = useRouter()
  const { showModal } = useModal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const sanitizedEmail = sanitizeEmail(email)
    if (!sanitizedEmail) {
      setError('Email inválido')
      setLoading(false)
      return
    }

    /**
     * Limita tamanho para prevenir DoS (senha será hasheada no backend).
     */
    if (password.length > 1000) {
      setError('Senha muito longa')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password, remember }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (data.requiresEmailVerification) {
          setRequiresEmailVerification(true)
          setError(data.message || 'Por favor, verifique seu email antes de fazer login.')
        } else {
          setError(data.error || 'Erro ao fazer login. Tente novamente.')
        }
        setLoading(false)
        return
      }

      if (data.requires2FA && data.email) {
        setRequires2FA(true)
        setUserEmail(data.email)
        setLoading(false)
        return
      }

      /**
       * localStorage apenas para exibição - autenticação real via cookies HTTP-only.
       */
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user_id', data.user.id)
        localStorage.setItem('user_email', data.user.email)
        localStorage.setItem('user_name', data.user.name)
        if (data.user.avatar_url) localStorage.setItem('user_avatar', data.user.avatar_url)
        localStorage.setItem('is_authenticated', 'true')
        
        // IMPORTANTE: Salvar se "remember me" foi ativado
        // Isso é usado no apiRequest para decidir se faz logout automático
        localStorage.setItem('remember_me', remember ? 'true' : 'false')
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError('Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a] flex flex-col lg:flex-row transition-colors duration-300">
      <div 
        className={`hidden lg:flex lg:w-[45%] bg-gradient-to-br from-red-600 via-red-700 to-red-600 dark:from-red-700 dark:via-red-800 dark:to-red-700 relative overflow-hidden transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center justify-center p-12">
          {/* Conteúdo principal */}
          <div className="text-center text-white max-w-md">
            <h1 
              className={`font-serif text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Bem-vindo de volta!
            </h1>
            <p 
              className={`text-lg lg:text-xl text-white/90 leading-relaxed transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Entre na sua conta para continuar organizando o Natal perfeito da sua família
            </p>
          </div>

          {/* Estatísticas de uso */}
          <div 
            className={`mt-12 flex gap-8 text-white/80 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">+2.000</div>
              <div className="text-sm">Famílias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.8★</div>
              <div className="text-sm">Avaliação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm">Satisfação</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção direita - Formulário */}
      <div className="flex-1 lg:w-[55%] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Título para dispositivos móveis */}
          <div 
            className={`lg:hidden text-center mb-8 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Bem-vindo de volta!</h2>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Entre na sua conta para continuar</p>
          </div>

          <div 
            className={`bg-white dark:bg-[#2e2e2e] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#3a3a3a] p-8 sm:p-10 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div 
              className={`mb-6 transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Entrar</h3>
              <p className="text-slate-600 dark:text-[#d4d4d4] text-sm">Preencha seus dados para acessar</p>
            </div>

            {requires2FA ? (
              <TwoFactorLogin
                email={userEmail}
                remember={remember}
                onSuccess={() => {
                  router.push('/')
                  router.refresh()
                }}
                onError={(error) => {
                  setError(error)
                  setRequires2FA(false)
                }}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-r-lg text-sm animate-fadeIn">
                  {error}
                </div>
              )}

              <div 
                className={`transition-all duration-700 delay-400 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Email
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3] group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-slate-50 dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:bg-white dark:focus:bg-[#3a3a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              <div 
                className={`transition-all duration-700 delay-500 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Senha
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3] group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-slate-50 dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:bg-white dark:focus:bg-[#3a3a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 z-10 transition-colors"
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

              <div 
                className={`flex items-center justify-between pt-2 transition-all duration-700 delay-600 ${
                  mounted ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 dark:text-[#d4d4d4] cursor-pointer">
                    Lembrar-me
                  </label>
                </div>

                <Link href="/recuperar-senha" className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>

              <div 
                className={`transition-all duration-700 delay-700 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </div>
            </form>
            )}

            {requiresEmailVerification && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-r-lg text-sm">
                <p className="font-semibold mb-2">Email não verificado</p>
                <p className="mb-3">Verifique sua caixa de entrada ou spam para o link de verificação.</p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/verify-email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ email: email.trim() }),
                      })
                      const data = await response.json()
                      if (data.success) {
                        setError('')
                        setRequiresEmailVerification(false)
                        showModal({
                          type: 'success',
                          message: 'Email de verificação reenviado! Verifique sua caixa de entrada.',
                          title: 'Email Enviado',
                        })
                      } else {
                        setError(data.error || 'Erro ao reenviar email')
                      }
                    } catch (err) {
                      setError('Erro ao reenviar email. Tente novamente.')
                    }
                  }}
                  className="text-yellow-800 dark:text-yellow-200 underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium"
                >
                  Reenviar email de verificação
                </button>
              </div>
            )}

            <div 
              className={`mt-6 pt-6 border-t border-slate-200 dark:border-[#3a3a3a] text-center transition-all duration-700 delay-800 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm text-slate-600 dark:text-[#d4d4d4]">
                Não tem uma conta?{' '}
                <Link href="/registro" className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>
          </div>

          <div 
            className={`mt-6 text-center transition-all duration-700 delay-900 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
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
