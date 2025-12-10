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
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSubscription = async () => {
    const isAuthenticated = await checkAuth()
    
    if (!isAuthenticated) {
      setIsPaid(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/subscription', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsPaid(data.isPaid || false)
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

