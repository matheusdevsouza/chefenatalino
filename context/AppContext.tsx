'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Define os dados disponíveis no contexto da aplicação.
 * 
 * Armazena informações sobre acesso premium do usuário e estado
 * de carregamento dessas informações.
 */
interface AppContextType {
  isPaid: boolean
  isLoading: boolean
  setIsPaid: (value: boolean) => void
  refreshSubscription: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Com JWT, cookies HTTP-only são gerenciados automaticamente - não precisa gerenciar userId manualmente.
 */
async function checkAuth(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const response = await fetch('/api/user/subscription', {
      credentials: 'include',
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Mantém estado de acesso premium. Componentes acessam via useApp.
 * 
 * Com remember-me ativado, o refresh token dura 30 dias. Para manter
 * dados de usuário sincronizados durante toda essa sessão, fazemos
 * refresh periódico (a cada 15 minutos) para refetch de dados do usuário
 * e validação contínua da assinatura.
 * 
 * Se token expirar e refresh falhar:
 * - COM remember-me: tenta refresh infinitamente
 * - SEM remember-me: fazer logout automático
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSubscription = async () => {
    const isAuthenticated = await checkAuth()
    
    if (!isAuthenticated) {
      setIsPaid(false)
      setIsLoading(false)
      
      // Se não está autenticado, fazer logout
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('user_id')
        if (userId) {
          // Estava autenticado mas agora não está - fazer logout automático
          localStorage.removeItem('user_id')
          localStorage.removeItem('user_email')
          localStorage.removeItem('user_name')
          localStorage.removeItem('user_avatar')
          localStorage.removeItem('is_authenticated')
          window.dispatchEvent(new Event('user-logged-out'))
        }
      }
      return
    }

    try {
      const response = await fetch('/api/user/subscription', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsPaid(data.isPaid || false)
      } else if (response.status === 401) {
        // Token expirou - fazer logout se remember-me não está ativado
        setIsPaid(false)
        
        if (typeof window !== 'undefined') {
          const rememberMe = localStorage.getItem('remember_me') === 'true'
          if (!rememberMe) {
            // Não tem remember-me, fazer logout automático
            localStorage.removeItem('user_id')
            localStorage.removeItem('user_email')
            localStorage.removeItem('user_name')
            localStorage.removeItem('user_avatar')
            localStorage.removeItem('is_authenticated')
            window.dispatchEvent(new Event('user-logged-out'))
          }
        }
      } else {
        setIsPaid(false)
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      setIsPaid(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshSubscription()
  }, [])

  // Refresh periódico a cada 15 minutos para manter dados sincronizados
  // Especialmente importante com remember-me ativado (30 dias de sessão)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSubscription()
      // Também trigger uma refetch de dados do usuário nos componentes
      // via dispatchEvent (veja UserProfile.tsx)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-data-refresh'))
      }
    }, 15 * 60 * 1000) // 15 minutos

    return () => clearInterval(interval)
  }, [])

  return (
    <AppContext.Provider value={{ isPaid, isLoading, setIsPaid, refreshSubscription }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook para acessar as informações do contexto da aplicação.
 * 
 * Use dentro de qualquer componente para saber se o usuário tem acesso
 * premium e atualizar esse status quando necessário.
 * 
 * Só funciona dentro de componentes que estão dentro do AppProvider.
 * 
 * @throws {Error} Se usado fora de um AppProvider
 */
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp precisa ser usado dentro de um AppProvider')
  }
  return context
}

