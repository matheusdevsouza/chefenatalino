'use client'

import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { UserProfile } from '@/components/UserProfile'
import { DemoButton } from '@/components/DemoButton'

/**
 * Header reutilizável para todas as páginas
 */

export function Header() {
  return (
    <nav className="fixed w-full z-50 top-0 pt-3 sm:pt-4 px-4 sm:px-6 md:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-panel rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center shadow-lg pointer-events-auto bg-white/40 backdrop-blur-xl border border-white/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-1 sm:p-1.5 rounded-lg">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-slate-900">Chefe Natalino</span>
        </Link>
        
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <a href="/#como-funciona" className="hover:text-red-600 transition-colors">Como Funciona</a>
          <a href="/#demo" className="hover:text-red-600 transition-colors">Funcionalidades</a>
          <a href="/#depoimentos" className="hover:text-red-600 transition-colors">Depoimentos</a>
          <a href="/#precos" className="hover:text-red-600 transition-colors">Preços</a>
          <a href="/#faq" className="hover:text-red-600 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <UserProfile />
          <DemoButton />
        </div>
      </div>
    </nav>
  )
}

