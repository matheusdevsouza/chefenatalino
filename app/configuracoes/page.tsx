'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SettingsModule } from '@/modules/SettingsModule'

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a]">
      <Header />
      <SettingsModule />
      <Footer />
    </div>
  )
}

