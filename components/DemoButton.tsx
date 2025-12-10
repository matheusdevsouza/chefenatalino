'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'

/**
 * Botão "Ver Demo" no header.
 * Só aparece quando o usuário não está logado.
 */

export function DemoButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('user_id')
      const userEmail = localStorage.getItem('user_email')
      setIsLoggedIn(!!(userId && userEmail))
      setIsLoading(false)
    }
  }, [])

  if (isLoading || isLoggedIn) {
    return null
  }

  return (
    <Link href="/#demo">
      <Button variant="primary" className="hidden sm:flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base transition-all">
        <span className="hidden lg:inline">Ver Demo</span>
        <span className="lg:hidden">Demo</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Link>
  )
}

