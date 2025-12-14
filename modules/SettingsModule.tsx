'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useTheme } from '@/context/ThemeContext'
import { useApp } from '@/context/AppContext'
import {
  Settings,
  User,
  Mail,
  Lock,
  Moon,
  Sun,
  Bell,
  Shield,
  Save,
  Loader2,
  CreditCard,
  FileText,
  Download,
} from 'lucide-react'

interface UserSettings {
  id: string
  email: string
  name: string
  phone: string
  avatar_url?: string
  created_at?: string
}

interface SettingsData {
  language: string
  timezone: string
  theme: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  preferences?: Record<string, any>
}

export function SettingsModule() {
  const router = useRouter()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { isPaid } = useApp()

  // State
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [settingsData, setSettingsData] = useState<SettingsData>({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'system',
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
  })

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window === 'undefined') return

      const uid = localStorage.getItem('user_id')
      if (!uid) {
        router.push('/login')
        return
      }

      setUserId(uid)

      try {
        // Fetch settings
        const settingsRes = await fetch('/api/user/settings')
        if (settingsRes.ok) {
          const settingsJSON = await settingsRes.json()
          if (settingsJSON.success) {
            setFormData({
              name: settingsJSON.user.name,
              email: settingsJSON.user.email,
              phone: settingsJSON.user.phone,
            })
            setSettingsData(settingsJSON.settings)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const saveProfile = async () => {
    try {
      setSaving(true)

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          language: settingsData.language,
          timezone: settingsData.timezone,
          theme: settingsData.theme,
          email_notifications: settingsData.email_notifications,
          push_notifications: settingsData.push_notifications,
          marketing_emails: settingsData.marketing_emails,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          alert('Configurações atualizadas com sucesso!')
        } else {
          alert('Erro ao salvar: ' + (json.error || 'Desconhecido'))
        }
      } else {
        alert('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Configurações
              </h1>
            </div>
            <p className="text-slate-600 dark:text-[#a3a3a3] mt-2">
              Personalize sua conta, preferências e segurança.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Full width content area */}
          <div className="space-y-6">
            {/* Profile Card */}
            <section className="bg-white dark:bg-[#2e2e2e] rounded-2xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                    <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-sans text-lg font-bold text-slate-900 dark:text-[#f5f5f5]">
                      {formData.name || 'Usuário'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                      Como você se identifica na plataforma
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                  Membro desde {new Date().getFullYear()}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={formData.name}
                  onChange={(v) => setFormData((s) => ({ ...s, name: v }))}
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    readOnly
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#888] cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 dark:text-[#888] mt-1">
                    O email não pode ser alterado. Abra um ticket de suporte se precisar mudar.
                  </p>
                </div>
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(v) => setFormData((s) => ({ ...s, phone: v }))}
                />
                <div className="flex items-end">
                  <Button onClick={saveProfile} variant="primary" className="w-full">
                    {saving ? 'Salvando...' : 'Salvar Perfil'}
                  </Button>
                </div>
              </div>
            </section>

            {/* Preferences & Theme Settings */}
            <section className="bg-white dark:bg-[#2e2e2e] rounded-2xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5]">Preferências</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                    Idioma
                  </label>
                  <select 
                    value={settingsData.language}
                    onChange={(e) => setSettingsData(s => ({ ...s, language: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-600"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="pt-PT">Português (Portugal)</option>
                    <option value="en-US">English (USA)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                    Fuso Horário
                  </label>
                  <select 
                    value={settingsData.timezone}
                    onChange={(e) => setSettingsData(s => ({ ...s, timezone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-600"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                    <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                    <option value="America/Recife">Recife (GMT-3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                    Tema
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSettingsData(s => ({ ...s, theme: 'light' }))}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        settingsData.theme === 'light'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-slate-300 dark:border-[#3a3a3a]'
                      }`}
                    >
                      <Sun className="w-5 h-5 mx-auto mb-2 text-yellow-600" />
                      <span className="text-sm">Claro</span>
                    </button>
                    <button
                      onClick={() => setSettingsData(s => ({ ...s, theme: 'dark' }))}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        settingsData.theme === 'dark'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-slate-300 dark:border-[#3a3a3a]'
                      }`}
                    >
                      <Moon className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                      <span className="text-sm">Escuro</span>
                    </button>
                    <button
                      onClick={() => setSettingsData(s => ({ ...s, theme: 'system' }))}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        settingsData.theme === 'system'
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-slate-300 dark:border-[#3a3a3a]'
                      }`}
                    >
                      <Settings className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                      <span className="text-sm">Sistema</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Notification Settings */}
            <section className="bg-white dark:bg-[#2e2e2e] rounded-2xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5]">Notificações</h3>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsData.email_notifications}
                    onChange={(e) => setSettingsData(s => ({ ...s, email_notifications: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-[#f5f5f5]">
                      Notificações por Email
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                      Receba atualizações importantes sobre sua conta
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsData.push_notifications}
                    onChange={(e) => setSettingsData(s => ({ ...s, push_notifications: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-[#f5f5f5]">
                      Notificações Push
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                      Receba notificações em tempo real no navegador
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsData.marketing_emails}
                    onChange={(e) => setSettingsData(s => ({ ...s, marketing_emails: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-[#f5f5f5]">
                      Emails de Marketing
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                      Fique informado sobre novos recursos e promoções
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Privacy & Data */}
            <section className="bg-white dark:bg-[#2e2e2e] rounded-2xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5]">Privacidade & Dados</h3>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => alert('Download de dados em desenvolvimento')}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Meus Dados
                </Button>
                <Button
                  onClick={() => alert('Exportar dados em desenvolvimento')}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar para CSV
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Tem certeza? Esta ação é irreversível.')) {
                      alert('Conta deletada em desenvolvimento')
                    }
                  }}
                  variant="secondary"
                  className="w-full justify-start text-red-600"
                >
                  🗑️ Deletar Conta
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
