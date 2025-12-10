'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { User, LogOut, LogIn, LayoutDashboard, Settings, Moon, Sun, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

/**
 * Componente de perfil do usuário exibido no header.
 * 
 * Usa useLayoutEffect (não useEffect) para gerenciar cliques fora do dropdown.
 * Isso previne race conditions onde o clique de abertura fecha o menu imediatamente.
 * 
 * Proteção contra fechamento acidental: delay de 500ms após abertura antes de ativar listener.
 * Usa capture phase para interceptar eventos antes de outros handlers.
 */

export function UserProfile() {
  const { isPaid, isLoading, refreshSubscription } = useApp()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userData, setUserData] = useState<{ name?: string; email?: string; avatar_url?: string | null } | null>(null)
  const router = useRouter()
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clickHandlerRef = useRef<((event: MouseEvent) => void) | null>(null)
  const isOpeningRef = useRef(false)
  const openTimestampRef = useRef<number>(0)

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

  /**
   * useLayoutEffect garante que listeners sejam configurados antes de qualquer interação,
   * evitando race conditions onde o clique de abertura fecha o menu imediatamente.
   */
  useLayoutEffect(() => {
    if (!isDropdownOpen) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      if (clickHandlerRef.current) {
        document.removeEventListener('mousedown', clickHandlerRef.current, true)
        clickHandlerRef.current = null
      }
      isOpeningRef.current = false
      return
    }

    openTimestampRef.current = Date.now()
    isOpeningRef.current = true

    /**
     * Handler armazenado em ref para poder removê-lo no cleanup.
     * Ignora cliques dentro de 500ms após abertura para prevenir fechamento acidental.
     */
    clickHandlerRef.current = (event: MouseEvent) => {
      const target = event.target as Node
      const timeSinceOpen = Date.now() - openTimestampRef.current
      if (timeSinceOpen < 500 || isOpeningRef.current) {
        event.stopPropagation()
        event.preventDefault()
        return
      }

      if (buttonRef.current?.contains(target) || 
          dropdownRef.current?.contains(target) || 
          containerRef.current?.contains(target)) {
        return
      }

      setIsDropdownOpen(false)
      isOpeningRef.current = false
    }

    /**
     * Adiciona o event listener com delay para evitar capturar o clique de abertura.
     * 
     * requestAnimationFrame: garante que o DOM foi atualizado
     * setTimeout: adiciona delay de 500ms para proteção adicional
     * Capture phase (true): intercepta eventos antes de outros handlers
     */

    const rafId = requestAnimationFrame(() => {
      clickTimeoutRef.current = setTimeout(() => {
        if (clickHandlerRef.current && isDropdownOpen && !isOpeningRef.current) {
          document.addEventListener('mousedown', clickHandlerRef.current, true)
        }
      }, 500)
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      if (clickHandlerRef.current) {
        document.removeEventListener('mousedown', clickHandlerRef.current, true)
        clickHandlerRef.current = null
      }
    }
  }, [isDropdownOpen])

  const fetchUserData = useCallback(async (uid: string) => {
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
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
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
  }, [refreshSubscription, router])

  /**
   * Para propagação para evitar conflitos. Marca timestamp ao abrir para proteção de 500ms.
   */
  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation()
    }
    
    setIsDropdownOpen((prev) => {
      const newState = !prev
      if (newState) {
        openTimestampRef.current = Date.now()
        isOpeningRef.current = true
        setTimeout(() => {
          isOpeningRef.current = false
        }, 500)
      } else {
        isOpeningRef.current = false
      }
      return newState
    })
  }, [])

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  const userEmail = useMemo(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('user_email') : null
  }, [userId])

  const isLoggedIn = useMemo(() => {
    return !!(userId && userEmail)
  }, [userId, userEmail])

  if (!isLoading && !isLoggedIn) {
    return (
      <Link href="/login">
        <Button 
          variant="ghost" 
          className="hidden sm:flex items-center gap-2 rounded-full border-2 text-red-600 border-red-600 hover:bg-red-50 px-4 sm:px-6 py-2 text-sm sm:text-base transition-all"
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
      <div className="relative" ref={containerRef}>
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            toggleDropdown(e)
          }}
          onMouseDown={(e) => {
            /**
             * Previne que mousedown seja capturado pelo listener global e feche o menu antes de abrir.
             */
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
          }}
          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full hover:bg-white/50 dark:hover:bg-[#3a3a3a]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          aria-label="Menu do usuário"
          aria-expanded={isDropdownOpen}
          type="button"
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

        {/* 
         * Menu dropdown do usuário.
         * 
         * Características:
         * - z-index 60 para ficar acima do header (z-50)
         * - Backdrop blur para efeito glassmorphism
         * - Estilos inline para suportar temas dinâmicos
         * - Event handlers para prevenir propagação e fechamento acidental
         */}

        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-64 rounded-xl py-2 z-[60] shadow-lg backdrop-blur-xl"
            style={{
              animation: 'fadeIn 0.2s ease-out',
              background: resolvedTheme === 'dark' 
                ? 'rgba(46, 46, 46, 0.85)' 
                : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: resolvedTheme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.15)'
                : '1px solid rgba(255, 255, 255, 0.3)',
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
            onMouseUp={(e) => {
              e.stopPropagation()
            }}
          >
              <div className="px-4 py-3 border-b border-white/20 dark:border-white/10">
                <p className="font-semibold text-slate-900 dark:text-[#f5f5f5] text-sm truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-[#a3a3a3] truncate">{userData?.email || ''}</p>
                {isPaid && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/40 backdrop-blur-sm rounded-full">
                    Plano Ativo
                  </span>
                )}
              </div>
              
              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#d4d4d4] hover:bg-white/30 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </div>
              
              <div className="border-t border-white/20 dark:border-white/10 my-1" />
              
              {!isPaid && (
                <>
                  <Link
                    href="/#precos"
                    onClick={closeDropdown}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#d4d4d4] hover:bg-white/30 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Ver Planos</span>
                  </Link>
                  <div className="border-t border-white/20 dark:border-white/10 my-1" />
                </>
              )}
              
              <div className="py-1">
                <button
                  onClick={() => {
                    toggleTheme()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#d4d4d4] hover:bg-white/30 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left"
                  type="button"
                >
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      <span>Modo Escuro</span>
                    </>
                  )}
                </button>
                
                <Link
                  href="/configuracoes"
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#d4d4d4] hover:bg-white/30 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Link>
              </div>
              
              <div className="border-t border-white/20 dark:border-white/10 my-1" />
              
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-left"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
        )}
      </div>
    )
  }

  return null
}

