import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import React from 'react'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { ModalProvider } from '@/context/ModalContext'
import { ThemeProvider } from '@/context/ThemeContext'
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
 * Layout raiz. Envolve com providers (Theme, App, Modal) e SmoothScrollWrapper.
 * suppressHydrationWarning previne warnings de hidratação relacionados ao tema.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AppProvider>
            <ModalProvider>
              <SmoothScrollWrapper>
                {children}
              </SmoothScrollWrapper>
            </ModalProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

