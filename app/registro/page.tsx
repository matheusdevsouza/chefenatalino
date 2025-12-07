'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, ArrowLeft, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/Button'

/**
 * Componente interno da página de registro
 */

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = () => {
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    if (name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      return false
    }

    if (!email.trim()) {
      setError('Email é obrigatório')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido')
      return false
    }

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

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erro ao criar conta. Tente novamente.')
        setLoading(false)
        return
      }

      // Salva os dados do usuário no localStorage
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user_id', data.user.id)
        localStorage.setItem('user_email', data.user.email)
        localStorage.setItem('user_name', data.user.name)
      }

      // Redireciona para checkout se houver plano selecionado, senão para home
      if (planSlug) {
        router.push(`/checkout?plan=${planSlug}`)
        router.refresh()
      } else {
        router.push('/')
        router.refresh()
      }
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
              Crie sua conta
            </h1>
            <p 
              className={`text-lg lg:text-xl text-white/90 leading-relaxed transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Comece agora a planejar o Natal perfeito da sua família com nossa plataforma inteligente
            </p>
          </div>

          {/* Benefícios do cadastro */}
          <div 
            className={`mt-12 space-y-4 text-white/90 text-left w-full max-w-sm transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">IA Inteligente</div>
                <div className="text-sm">Sugestões personalizadas de receitas e presentes</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Organização Completa</div>
                <div className="text-sm">Cronograma, lista de compras e gestão de convidados</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Natal Perfeito</div>
                <div className="text-sm">Garantia de um Natal memorável para toda família</div>
              </div>
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
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Crie sua conta</h2>
            <p className="text-slate-600">Comece a planejar seu Natal perfeito agora</p>
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Cadastro</h3>
              <p className="text-slate-600 text-sm">Preencha os dados abaixo para criar sua conta</p>
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
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome completo
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
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
                className={`transition-all duration-700 delay-600 ${
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
                    placeholder="Mínimo 6 caracteres"
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
                className={`transition-all duration-700 delay-700 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-red-600 z-10 transition-colors"
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

              <div 
                className={`transition-all duration-700 delay-800 ${
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
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Criar conta
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div 
              className={`mt-6 pt-6 border-t border-slate-200 text-center transition-all duration-700 delay-900 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm text-slate-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          <div 
            className={`mt-6 text-center transition-all duration-700 delay-1000 ${
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

/**
 * Página de registro com wrapper Suspense
 */

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
