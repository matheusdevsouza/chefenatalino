'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { User, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

/**
 * Componente de login/perfil do usuário no header.
 * 
 * Mostra botão de Login quando não está logado. Mostra avatar e menu
 * dropdown quando está logado.
 */

export function UserProfile() {
  const { isPaid, isLoading, refreshSubscription } = useApp()
  const [userId, setUserId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState<{ name?: string; email?: string; avatar_url?: string | null } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id')
      const storedUserEmail = localStorage.getItem('user_email')
      
      if (storedUserId && storedUserEmail) {
        setUserId(storedUserId)
        fetchUserData(storedUserId)
      } else {
        setUserId(null)
        setUserData(null)
      }
    }
  }, [])

  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/data?userId=${uid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserData({
            name: data.user.name,
            email: data.user.email,
            avatar_url: data.user.avatar_url
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_name')
      setUserId(null)
      setUserData(null)
      setIsDropdownOpen(false)
      await refreshSubscription()
      router.push('/')
      router.refresh()
    }
  }

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null
  const isLoggedIn = userId && userEmail

  if (!isLoading && !isLoggedIn) {
    return (
      <Link href="/login">
        <Button 
          variant="ghost" 
          className="hidden sm:flex items-center gap-2 rounded-full border border-red-600 text-red-600 hover:bg-red-50 px-4 sm:px-6 py-2 text-sm sm:text-base transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden lg:inline">Entrar</span>
        </Button>
      </Link>
    )
  }

  if (!isLoading && isLoggedIn) {
    const displayName = userData?.name || 'Usuário'
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          aria-label="Menu do usuário"
        >
          {userData?.avatar_url ? (
            <img 
              src={userData.avatar_url} 
              alt={displayName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow border-2 border-white"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow text-xs sm:text-sm font-semibold">
              {initials}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
              {/* Info do usuário */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{userData?.email || ''}</p>
                {isPaid && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full">
                    Plano Ativo
                  </span>
                )}
              </div>
              
              {isPaid && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <div className="border-t border-slate-100 my-1" />
                </>
              )}
              
              {!isPaid && (
                <>
                  <Link
                    href="/#precos"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Ver Planos</span>
                  </Link>
                  
                  <div className="border-t border-slate-100 my-1" />
                </>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}

