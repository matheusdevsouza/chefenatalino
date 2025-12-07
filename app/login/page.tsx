'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/Button'

/**
 * Página de login do usuário
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erro ao fazer login. Tente novamente.')
        setLoading(false)
        return
      }

      // Salva os dados do usuário no localStorage
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user_id', data.user.id)
        localStorage.setItem('user_email', data.user.email)
        localStorage.setItem('user_name', data.user.name)
      }

      // Redireciona para a home
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError('Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col lg:flex-row">
      {/* Seção esquerda - Branding */}
      <div 
        className={`hidden lg:flex lg:w-[45%] bg-gradient-to-br from-red-600 via-red-700 to-red-600 relative overflow-hidden transition-all duration-1000 ${
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
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta!</h2>
            <p className="text-slate-600">Entre na sua conta para continuar</p>
          </div>

          {/* Card do formulário */}
          <div 
            className={`bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div 
              className={`mb-6 transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Entrar</h3>
              <p className="text-slate-600 text-sm">Preencha seus dados para acessar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm animate-fadeIn">
                  {error}
                </div>
              )}

              <div 
                className={`transition-all duration-700 delay-400 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              <div 
                className={`transition-all duration-700 delay-500 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Senha
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-red-600 z-10 transition-colors"
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
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                    Lembrar-me
                  </label>
                </div>

                <Link href="/recuperar-senha" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
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

            <div 
              className={`mt-6 pt-6 border-t border-slate-200 text-center transition-all duration-700 delay-800 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm text-slate-600">
                Não tem uma conta?{' '}
                <Link href="/registro" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
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
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
