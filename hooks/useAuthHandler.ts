/**
 * Hook para gerenciar autenticação e logout automático
 * 
 * Monitora o estado de autenticação e faz logout automático quando:
 * 1. Token expira E "remember me" não estava ativado
 * 2. Evento de logout é disparado
 * 3. Dados de usuário não estão mais disponíveis
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAuthHandler() {
  const router = useRouter()

  // Handler para quando usuário é deslogado
  const handleLogout = useCallback(() => {
    // Limpar dados locais
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_avatar')
      localStorage.removeItem('is_authenticated')
      
      // Redirecionar para home
      router.push('/')
      router.refresh()
    }
  }, [router])

  // Monitorar evento de logout
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listener para evento de logout automático
    const handleUserLoggedOut = () => {
      handleLogout()
    }

    window.addEventListener('user-logged-out', handleUserLoggedOut)
    
    return () => {
      window.removeEventListener('user-logged-out', handleUserLoggedOut)
    }
  }, [handleLogout])

  // Verificar periodicamente se ainda está autenticado
  // (útil para sincronizar entre abas do navegador)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkAuthStatus = () => {
      const userId = localStorage.getItem('user_id')
      const isAuthenticated = localStorage.getItem('is_authenticated')

      // Se não há dados de autenticação, fazer logout
      if (!userId || isAuthenticated !== 'true') {
        handleLogout()
      }
    }

    // Verificar a cada 30 segundos
    const interval = setInterval(checkAuthStatus, 30000)

    return () => clearInterval(interval)
  }, [handleLogout])

  return { handleLogout }
}
