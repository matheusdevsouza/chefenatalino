import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import React from 'react'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import SmoothScrollWrapper from '@/components/SmoothScrollWrapper'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chefe Natalino - Sua Ceia Perfeita',
  description: 'Planejamento inteligente de ceia de Natal com IA',
}

/**
 * Layout raiz da aplicação.
 * 
 * Configura estrutura HTML base, carrega fontes do Google Fonts
 * (Outfit e Playfair Display) e envolve toda a aplicação com o
 * AppProvider para gerenciamento de estado global. Aplica classes
 * de tipografia e antialiasing para melhor renderização.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${playfair.variable} font-sans antialiased`}>
        <AppProvider>
          <SmoothScrollWrapper>
            {children}
          </SmoothScrollWrapper>
        </AppProvider>
      </body>
    </html>
  )
}

