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

function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  let userId = localStorage.getItem('user_id')
  
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('user_id', userId)
    
    fetch('/api/user/create', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).catch(err => console.error('Erro ao criar usuário:', err))
  }
  
  return userId
}

/**
 * Provider que mantém o estado de acesso premium em toda a aplicação.
 * 
 * Ao carregar, busca automaticamente se o usuário tem assinatura ativa.
 * Componentes filhos acessam essa info usando o hook useApp.
 */

export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSubscription = async () => {
    const userId = getUserId()
    if (!userId) {
      setIsPaid(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/subscription', {
        headers: {
          'x-user-id': userId,
        },
      })
      const data = await response.json()
      setIsPaid(data.isPaid || false)
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
 */

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp precisa ser usado dentro de um AppProvider')
  }
  return context
}

