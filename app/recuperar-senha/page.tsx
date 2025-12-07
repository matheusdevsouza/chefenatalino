'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, KeyRound, Shield, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

/**
 * Página de recuperação de senha do usuário
 */

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erro ao enviar email de recuperação. Tente novamente.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError('Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-24 sm:pt-28">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div 
            className={`text-center mb-8 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-2xl">
                <KeyRound className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold text-slate-900 mb-3">Recuperar senha</h1>
            <p className="text-lg text-slate-600">
              Digite seu email para receber as instruções de recuperação
            </p>
          </div>

          {/* Card do Formulário */}
          <div 
            className={`bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {success ? (
              <div 
                className={`text-center py-6 transition-all duration-700 ${
                  mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-3">Email enviado!</h2>
                <p className="text-slate-600 mb-2">
                  Enviamos as instruções para redefinir sua senha para:
                </p>
                <p className="text-slate-900 font-semibold mb-6 break-all">{email}</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Verifique sua caixa de entrada</p>
                      <p>Não recebeu? Verifique também a pasta de spam ou lixo eletrônico.</p>
                    </div>
                  </div>
                </div>
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Voltar para Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div 
                  className={`mb-6 transition-all duration-700 delay-300 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Esqueceu sua senha?</h3>
                  <p className="text-slate-600 text-sm">
                    Não se preocupe! Digite seu email e enviaremos um link para você redefinir sua senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                      Endereço de Email
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
                    <p className="mt-2 text-xs text-slate-500">
                      Digite o email associado à sua conta
                    </p>
                  </div>

                  <div 
                    className={`transition-all duration-700 delay-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Enviar instruções de recuperação
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Informações úteis */}
                <div 
                  className={`mt-8 pt-6 border-t border-slate-200 transition-all duration-700 delay-600 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                        <Clock className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Tempo de entrega</p>
                        <p className="text-xs text-slate-600">
                          O email geralmente chega em alguns minutos. Se não aparecer, aguarde até 15 minutos.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                        <Shield className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Segurança</p>
                        <p className="text-xs text-slate-600">
                          O link de recuperação expira em 1 hora por questões de segurança.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                        <HelpCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Precisa de ajuda?</p>
                        <p className="text-xs text-slate-600">
                          Se você não tem acesso ao email ou precisa de assistência, entre em contato conosco.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Links de navegação */}
          <div 
            className={`mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Lembrou sua senha? Voltar para Login</span>
            </Link>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link 
              href="/" 
              className="text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
