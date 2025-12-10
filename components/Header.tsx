'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserProfile } from '@/components/UserProfile'
import { DemoButton } from '@/components/DemoButton'

/**
 * Header reutilizável para todas as páginas.
 * 
 * Características:
 * - Posição fixa no topo com z-index alto (z-50)
 * - Design glassmorphism com backdrop blur
 * - Navegação responsiva (oculta em telas pequenas)
 * - Integra UserProfile e DemoButton
 * - Links de navegação para seções da página inicial
 */

export function Header() {
  return (
    <nav className="fixed w-full z-50 top-0 pt-3 sm:pt-4 px-4 sm:px-6 md:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-panel rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center shadow-lg pointer-events-auto bg-white/40 dark:bg-[#2e2e2e]/40 backdrop-blur-xl border border-white/20 dark:border-[#3a3a3a]/20">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Chefe Natalino"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            priority
          />
          <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-[#f5f5f5]">Chefe Natalino</span>
        </Link>
        
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium text-slate-600 dark:text-[#d4d4d4]">
          <Link href="/#como-funciona" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Como Funciona</Link>
          <Link href="/#demo" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Funcionalidades</Link>
          <Link href="/#depoimentos" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Depoimentos</Link>
          <Link href="/#precos" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Preços</Link>
          <Link href="/#faq" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <UserProfile />
          <DemoButton />
        </div>
      </div>
    </nav>
  )
}

