'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/context/ThemeContext'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/Button'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { isPaid } = useApp()
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ 
    name?: string
    email?: string
    phone?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notifications: true,
    emailNotifications: true,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id')
      if (!storedUserId) {
        router.push('/login')
        return
      }
      setUserId(storedUserId)
      fetchUserData(storedUserId)
    }
  }, [router])

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/data?userId=${uid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserData({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone
          })
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            notifications: true,
            emailNotifications: true,
          })
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) return
    
    try {
      setSaving(true)
      /**
       * Simular atualização dos dados do usuário.
       * 
       * TODO: Implementar endpoint real para atualizar dados do usuário.
       * Por enquanto, apenas atualiza dados locais.
       */
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      /**
       * Atualizar dados locais após "salvamento".
       */
      setUserData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })
      
      alert('Configurações salvas com sucesso!')
      setSaving(false)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a]">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1a1a1a] dark:via-[#2e2e2e] dark:to-[#1a1a1a]">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Configurações
              </h1>
            </div>
            <p className="text-slate-600 dark:text-[#a3a3a3]">
              Gerencie suas preferências e informações da conta
            </p>
          </div>

          {/* Perfil */}
          <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Informações do Perfil
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d4d4d4] mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Preferências
              </h2>
            </div>

            <div className="space-y-4">
              {/* Tema */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#3a3a3a]">
                <div className="flex items-center gap-3">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-[#f5f5f5]">Tema</p>
                    <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                      {resolvedTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                    </p>
                  </div>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              {/* Notificações */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#3a3a3a]">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-[#f5f5f5]">Notificações</p>
                    <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                      Receber notificações do sistema
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-[#3a3a3a] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#3a3a3a] peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Notificações por Email */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#3a3a3a]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-[#f5f5f5]">Notificações por Email</p>
                    <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                      Receber atualizações por email
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-[#3a3a3a] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#3a3a3a] peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Segurança
              </h2>
            </div>

            <div className="space-y-4">
              <Link
                href="/redefinir-senha"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#3a3a3a] hover:bg-slate-50 dark:hover:bg-[#3a3a3a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-[#f5f5f5]">Alterar Senha</p>
                    <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                      Atualize sua senha regularmente
                    </p>
                  </div>
                </div>
                <span className="text-red-600 dark:text-red-400">→</span>
              </Link>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

