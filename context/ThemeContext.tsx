'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Gerencia tema (light/dark/system). Salva no localStorage e previne flash de conteúdo incorreto.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return themeValue
  }

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setResolvedTheme(newTheme)
  }

  /**
   * Carrega tema do localStorage ao montar o componente.
   * Usa 'light' como padrão se nenhum tema estiver salvo.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null
      const initialTheme = stored || 'light'
      setThemeState(initialTheme)
      
      const resolved = resolveTheme(initialTheme)
      applyTheme(resolved)
      setMounted(true)
    }
  }, [])

  /**
   * Escuta mudanças na preferência do sistema quando theme === 'system'.
   * Atualiza o tema automaticamente quando o usuário muda a preferência do sistema.
   */
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = resolveTheme('system')
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  /**
   * Atualiza o tema quando a prop theme mudar.
   * Só executa após o componente estar montado para evitar flash de conteúdo.
   */
  useEffect(() => {
    if (!mounted) return
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  const toggleTheme = () => {
    const currentResolved = resolveTheme(theme)
    const newTheme = currentResolved === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de tema.
 * 
 * @throws {Error} Se usado fora de um ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}

