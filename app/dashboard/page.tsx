'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ChefHat,
  Wine,
  MessageSquare,
  Dices,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CreditCard,
  ChevronDown,
  Download,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { CeiaInteligente } from '@/modules/CeiaInteligente'
import { CalculadoraBebidas } from '@/modules/CalculadoraBebidas'
import { MensagensMagicas } from '@/modules/MensagensMagicas'
import { SecretSantaModule } from '@/modules/SecretSantaModule'

type Tab = 'home' | 'ceia' | 'bebidas' | 'mensagens' | 'sorteio' | 'usage' | 'payments'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  description: string
}

interface Stats {
  ceias: number
  bebidas: number
  mensagens: number
  sorteios: number
}

interface AIMetrics {
  calls_month: number
  calls_remaining: number
  tokens_used_month: number
  estimated_cost_month: number
  last_reset_at: string
}

interface Payment {
  id: string
  amount: number
  payment_method: string
  status: 'completed' | 'pending' | 'failed'
  plan_name: string
  created_at: string
}

interface Subscription {
  id: string
  plan: string
  status: 'active' | 'past_due' | 'cancelled'
  nextBilling: string
  price: string
}

export default function Dashboard() {
  const router = useRouter()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Usuário')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ ceias: 0, bebidas: 0, mensagens: 0, sorteios: 0 })
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    home: true,
    modules: true,
    tools: true,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window === 'undefined') return

      const uid = localStorage.getItem('user_id')
      if (!uid) {
        router.push('/login')
        return
      }

      try {
        setUserId(uid)
        const storedName = localStorage.getItem('user_name')
        if (storedName) setUserName(storedName)

        try {
          const res = await fetch('/api/user/settings', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.user) {
              const decryptedName = data.user.name || ''
              if (decryptedName && decryptedName.trim().length > 0) {
                setUserName(decryptedName)
                localStorage.setItem('user_name', decryptedName)
              }
            }
          }
        } catch (err) {
          console.warn('user/settings failed', err)
        }

        try {
          const over = await fetch('/api/dashboard/overview', { credentials: 'include' })
          if (over.ok) {
            const ov = await over.json()
            if (ov.success) {
              setStats({
                ceias: ov.stats.ceias || 0,
                bebidas: ov.stats.bebidas || 0,
                mensagens: ov.stats.mensagens || 0,
                sorteios: ov.stats.sorteios || 0,
              })
              setRecentActivity(ov.recentActivity || [])
            }
          }
        } catch (e) {
          console.warn('Failed to fetch dashboard overview', e)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const sidebarWidthClass = sidebarCollapsed ? 'w-20' : 'w-64'

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      description: 'Resumo de atividades',
    },
    {
      id: 'ceia',
      label: 'Ceia Inteligente',
      icon: ChefHat,
      description: 'Planeje seu cardápio',
    },
    {
      id: 'bebidas',
      label: 'Calculadora Bebidas',
      icon: Wine,
      description: 'Calcule suas bebidas',
    },
    {
      id: 'mensagens',
      label: 'Mensagens Mágicas',
      icon: MessageSquare,
      description: 'Mensagens personalizadas',
    },
    {
      id: 'sorteio',
      label: 'Amigo Secreto',
      icon: Dices,
      description: 'Gerencie sorteios',
    },
    {
      id: 'usage',
      label: 'Monitoramento',
      icon: BarChart3,
      description: 'Veja seu uso',
    },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: CreditCard,
      description: 'Histórico de pagamentos',
    },
  ]

  const navCategories = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: LayoutDashboard,
      items: ['home'],
    },
    {
      id: 'modules',
      label: 'Módulos',
      icon: ChefHat,
      items: ['ceia', 'bebidas', 'mensagens', 'sorteio'],
    },
    {
      id: 'tools',
      label: 'Ferramentas',
      icon: BarChart3,
      items: ['usage', 'payments'],
    },
  ]

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_name')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#1a1a1a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <p className="text-slate-600 dark:text-[#a3a3a3]">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#1a1a1a] relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 ${sidebarWidthClass} h-screen bg-white dark:bg-[#2e2e2e] border-r border-slate-200 dark:border-[#3a3a3a] transform transition-all duration-300 flex flex-col justify-between lg:relative lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-[#3a3a3a] flex items-center justify-center">
          <img src="/logo.png" alt="Chefe Natalino" className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} object-contain`} />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navCategories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] rounded-lg transition group"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{category.label}</span>}
                </div>
                {!sidebarCollapsed && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openCategories[category.id] ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {openCategories[category.id] && !sidebarCollapsed && (
                <div className="ml-0 mt-2 space-y-1.5 border-l-2 border-slate-400/40 dark:border-slate-600/40 pl-4">
                  {category.items.map((itemId) => {
                    const item = navItems.find((i) => i.id === itemId)
                    if (!item) return null
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id as Tab)
                          setSidebarOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          currentTab === item.id
                            ? 'text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-700/30'
                            : 'text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-700/20'
                        }`}
                      >
                        <item.icon className="w-4 h-4 inline mr-2.5" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#3a3a3a] space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!sidebarCollapsed && (resolvedTheme === 'dark' ? 'Light' : 'Dark')}
          </button>
          <button
            onClick={() => router.push('/configuracoes')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition"
          >
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && 'Configurações'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && 'Sair'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-white dark:bg-[#2e2e2e] border-b border-slate-200 dark:border-[#3a3a3a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] p-2 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5]">
              Bem-vindo, {userName}!
            </h1>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex text-slate-700 dark:text-[#d4d4d4] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] p-2 rounded-lg"
          >
            {sidebarCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'home' && <HomeTab stats={stats} recentActivity={recentActivity} />}
          {currentTab === 'ceia' && <CeiaInteligente />}
          {currentTab === 'bebidas' && <CalculadoraBebidas />}
          {currentTab === 'mensagens' && <MensagensMagicas />}
          {currentTab === 'sorteio' && <SecretSantaModule />}
          {currentTab === 'usage' && <UsageAndAITab />}
          {currentTab === 'payments' && <PaymentsAndSubscriptionsTab />}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

function HomeTab({ stats, recentActivity }: { stats: Stats; recentActivity: any[] }) {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-4xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Bem-vindo!</h2>
        <p className="text-slate-600 dark:text-[#a3a3a3]">Aqui você pode gerenciar todos os seus módulos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ceias Criadas" value={stats.ceias} icon={ChefHat} trend="+5 este mês" />
        <StatCard title="Bebidas Calculadas" value={stats.bebidas} icon={Wine} trend="+12 este mês" />
        <StatCard title="Mensagens Geradas" value={stats.mensagens} icon={MessageSquare} trend="+8 este mês" />
        <StatCard title="Sorteios Realizados" value={stats.sorteios} icon={Dices} trend="+2 este mês" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5]">Atividade Recente</h3>
            <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">Seus usos mais recentes</p>
          </div>
          <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#3a3a3a] transition">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">{activity.description}</p>
                  <p className="text-xs text-slate-500 dark:text-[#888]">{new Date(activity.timestamp).toLocaleDateString('pt-BR')}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-[#a3a3a3] text-center py-8">Nenhuma atividade ainda. Comece usando um dos módulos!</p>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: number
  icon: React.ComponentType<any>
  trend: string
}) {
  return (
    <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
      <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">{value}</p>
      <p className="text-xs text-green-600 dark:text-green-400">{trend}</p>
    </div>
  )
}

function UsageAndAITab() {
  const [aiUsage, setAiUsage] = useState<AIMetrics>({
    calls_month: 0,
    calls_remaining: 1000,
    tokens_used_month: 0,
    estimated_cost_month: 0,
    last_reset_at: new Date().toISOString(),
  })
  const [usageLoading, setUsageLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/user/ai-usage', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.metrics) {
            setAiUsage(data.metrics)
          }
        }
      } catch (error) {
        console.error('Error fetching AI usage:', error)
      } finally {
        setUsageLoading(false)
      }
    }
    fetchData()
  }, [])

  if (usageLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Monitoramento de Uso</h2>
        <p className="text-slate-600 dark:text-[#a3a3a3]">Acompanhe seu histórico de uso e estatísticas de IA</p>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Período</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-[#3a3a3a] p-2.5 bg-white dark:bg-[#2e2e2e] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-600">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
        <div></div>
        <div className="flex items-end">
          <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* AI Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#2e2e2e] rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mb-1">Chamadas este mês</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-[#f5f5f5]">{aiUsage.calls_month}</p>
        </div>

        <div className="bg-white dark:bg-[#2e2e2e] rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mb-1">Tokens usados</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-[#f5f5f5]">{aiUsage.tokens_used_month}</p>
        </div>

        <div className="bg-white dark:bg-[#2e2e2e] rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mb-1">Custo estimado</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-[#f5f5f5]">R$ {aiUsage.estimated_cost_month.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow p-6 h-80 flex items-center justify-center">
        <p className="text-slate-500 dark:text-[#a3a3a3]">Gráfico de uso (em desenvolvimento)</p>
      </div>
    </div>
  )
}

function PaymentsAndSubscriptionsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payments
        const paymentsRes = await fetch('/api/user/payments?limit=20', { credentials: 'include' })
        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          if (data.success && data.data?.payments) {
            setPayments(data.data.payments)
          }
        }

        // Fetch subscriptions
        const subRes = await fetch('/api/user/current-plan', { credentials: 'include' })
        if (subRes.ok) {
          const data = await subRes.json()
          if (data.subscription) {
            setSubscriptions([
              {
                id: data.subscription.id,
                plan: data.subscription.plan_name || 'Plano',
                status: data.subscription.status as any,
                nextBilling: data.subscription.expires_at || new Date().toISOString(),
                price: data.subscription.plan_price ? `R$ ${data.subscription.plan_price}` : '—',
              },
            ])
          }
        }
      } catch (error) {
        console.error('Error fetching payment data:', error)
      } finally {
        setPaymentsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    )
  }

  const totalSpent = payments.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-2">Pagamentos e Assinaturas</h2>
        <p className="text-slate-600 dark:text-[#a3a3a3]">Gerencie seus pagamentos e planos de assinatura</p>
      </div>

      {/* Current Subscription */}
      {subscriptions.length > 0 && (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-[#3a3a3a]">
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3] mb-1">Plano Ativo</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-3">{sub.plan}</p>
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">{sub.price}/mês</p>
              <p className="text-xs text-slate-500 dark:text-[#888] mt-2">
                Próxima cobrança: {new Date(sub.nextBilling).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Status</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-[#3a3a3a] p-2.5 bg-white dark:bg-[#2e2e2e] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-600">
            <option value="all">Todos os status</option>
            <option value="completed">Concluídos</option>
            <option value="pending">Pendentes</option>
            <option value="failed">Falhados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Período</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-[#3a3a3a] p-2.5 bg-white dark:bg-[#2e2e2e] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-red-600">
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#3a3a3a] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f5f5f5]">Histórico de Pagamentos</h3>
          <span className="text-sm text-slate-600 dark:text-[#a3a3a3]">Total: R$ {totalSpent.toFixed(2)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#3a3a3a] border-b border-slate-200 dark:border-[#3a3a3a]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">Data</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">Plano</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">Valor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#3a3a3a]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-[#a3a3a3]">
                    Nenhum pagamento registrado
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-[#3a3a3a] transition">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-[#f5f5f5]">
                      {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-[#f5f5f5]">{payment.plan_name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600 dark:text-red-400">
                      R$ {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {payment.status === 'completed' ? 'Concluído' : payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-[#f5f5f5] capitalize">
                      {payment.payment_method || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

