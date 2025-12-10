'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, ArrowLeft, Eye, EyeOff, User, Phone } from 'lucide-react'
import { Button } from '@/components/Button'
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/security/clientInputSanitizer'

/**
 * Componente interno da página de registro
 */

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
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

    // Validação opcional de telefone (formato brasileiro)
    if (phone.trim() && phone.trim().length > 0) {
      const phoneRegex = /^[\d\s\(\)\-\+]+$/
      const cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        setError('Telefone inválido. Use o formato (00) 00000-0000 ou similar')
        return false
      }
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

    // Sanitizar todos os inputs antes de enviar
    const sanitizedName = sanitizeString(name.trim())
    const sanitizedEmail = sanitizeEmail(email.trim().toLowerCase())
    const sanitizedPhone = phone.trim() ? sanitizePhone(phone.trim()) : null
    
    if (!sanitizedName || sanitizedName.length < 2) {
      setError('Nome inválido')
      setLoading(false)
      return
    }

    if (!sanitizedEmail) {
      setError('Email inválido')
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erro ao criar conta. Tente novamente.')
        setLoading(false)
        return
      }

      // Se requer verificação de email, salvar email e redirecionar
      if (data.requiresEmailVerification) {
        // Salvar email temporariamente para reenvio
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending_verification_email', sanitizedEmail)
        }
        router.push(`/verificar-email?email=${encodeURIComponent(sanitizedEmail)}`)
        return
      }

      // Salva os dados do usuário no localStorage (para compatibilidade)
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
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Crie sua conta</h2>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Comece a planejar seu Natal perfeito agora</p>
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
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Cadastro</h3>
              <p className="text-slate-600 dark:text-[#d4d4d4] text-sm">Preencha os dados abaixo para criar sua conta</p>
            </div>

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
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Nome completo
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3] group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
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
                className={`transition-all duration-700 delay-550 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Telefone <span className="text-slate-400 dark:text-[#a3a3a3] font-normal">(opcional)</span>
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Phone className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3] group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-slate-50 dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:bg-white dark:focus:bg-[#3a3a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              <div 
                className={`transition-all duration-700 delay-600 ${
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
                    placeholder="Mínimo 6 caracteres"
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
                className={`transition-all duration-700 delay-700 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Confirmar senha
                </label>
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-400 dark:text-[#a3a3a3] group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-slate-50 dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:bg-white dark:focus:bg-[#3a3a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 z-10 transition-colors"
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-[#3a3a3a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-[#2e2e2e] text-slate-500 dark:text-[#a3a3a3]">ou continue com</span>
                </div>
              </div>

              <div 
                className={`grid grid-cols-3 gap-3 transition-all duration-700 delay-900 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <button
                  type="button"
                  onClick={() => window.location.href = '/api/auth/google'}
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-50 dark:hover:bg-[#3a3a3a]/80 hover:border-red-500 dark:hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  title="Entrar com Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => window.location.href = '/api/auth/github'}
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-50 dark:hover:bg-[#3a3a3a]/80 hover:border-red-500 dark:hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  title="Entrar com GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => window.location.href = '/api/auth/facebook'}
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-50 dark:hover:bg-[#3a3a3a]/80 hover:border-red-500 dark:hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  title="Entrar com Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
            </form>

            <div 
              className={`mt-6 pt-6 border-t border-slate-200 dark:border-[#3a3a3a] text-center transition-all duration-700 delay-900 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm text-slate-600 dark:text-[#d4d4d4]">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
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

/**
 * Página de registro com wrapper Suspense
 */

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a] flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-[#d4d4d4]">Carregando...</p>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
