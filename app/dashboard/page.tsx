'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useApp } from '@/context/AppContext'
import { 
  LayoutDashboard, 
  ChefHat, 
  Wine, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { isPaid, isLoading } = useApp()
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null)
  const [stats, setStats] = useState({
    ceias: 0,
    bebidas: 0,
    mensagens: 0,
    totalPlanejamentos: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id')
      if (!storedUserId) {
        router.push('/login')
        return
      }
      setUserId(storedUserId)
      fetchUserData(storedUserId)
      fetchStats(storedUserId)
    }
  }, [router])

  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/data?userId=${uid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserData({
            name: data.user.name,
            email: data.user.email
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  /**
   * Busca estatísticas do usuário.
   * 
   * Por enquanto usa dados mockados.
   * TODO: Implementar endpoints reais para buscar estatísticas do banco de dados.
   */
  const fetchStats = async (uid: string) => {
    try {
      setLoading(true)
      setTimeout(() => {
        setStats({
          ceias: 5,
          bebidas: 3,
          mensagens: 12,
          totalPlanejamentos: 20
        })
        setRecentActivity([
          { type: 'ceia', title: 'Ceia de Natal 2024', date: new Date(), status: 'completed' },
          { type: 'bebidas', title: 'Cálculo de Bebidas', date: new Date(Date.now() - 86400000), status: 'completed' },
          { type: 'mensagem', title: 'Mensagem Mágica Criada', date: new Date(Date.now() - 172800000), status: 'completed' },
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      setLoading(false)
    }
  }

  if (isLoading || loading) {
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
        <div className="max-w-7xl mx-auto">
          {/* Header do Dashboard */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-8 h-8 text-red-600 dark:text-red-400" />
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-[#f5f5f5]">
                Dashboard
              </h1>
            </div>
            <p className="text-slate-600 dark:text-[#a3a3a3]">
              Bem-vindo de volta, {userData?.name || 'Usuário'}! Aqui está um resumo das suas atividades.
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <ChefHat className="w-8 h-8 text-red-600 dark:text-red-400" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-1">{stats.ceias}</h3>
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">Ceias Planejadas</p>
            </div>

            <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Wine className="w-8 h-8 text-red-600 dark:text-red-400" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-1">{stats.bebidas}</h3>
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">Cálculos de Bebidas</p>
            </div>

            <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-1">{stats.mensagens}</h3>
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">Mensagens Criadas</p>
            </div>

            <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-red-600 dark:text-red-400" />
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-1">{stats.totalPlanejamentos}</h3>
              <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">Total de Planejamentos</p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/ceia-inteligente"
                className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-all hover:border-red-500 dark:hover:border-red-400 group"
              >
                <ChefHat className="w-8 h-8 text-red-600 dark:text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-2">Ceia Inteligente</h3>
                <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">
                  Planeje sua ceia perfeita com IA
                </p>
              </Link>

              <Link
                href="/calculadora-bebidas"
                className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-all hover:border-red-500 dark:hover:border-red-400 group"
              >
                <Wine className="w-8 h-8 text-red-600 dark:text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-2">Calculadora de Bebidas</h3>
                <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">
                  Calcule quantas bebidas você precisa
                </p>
              </Link>

              <Link
                href="/mensagens-magicas"
                className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] p-6 hover:shadow-xl transition-all hover:border-red-500 dark:hover:border-red-400 group"
              >
                <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-2">Mensagens Mágicas</h3>
                <p className="text-sm text-slate-600 dark:text-[#a3a3a3]">
                  Crie mensagens personalizadas para o Natal
                </p>
              </Link>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-4">
              Atividades Recentes
            </h2>
            <div className="bg-white dark:bg-[#2e2e2e] rounded-xl shadow-lg border border-slate-200 dark:border-[#3a3a3a] overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-[#a3a3a3]">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-[#3a3a3a]">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-[#3a3a3a]/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {activity.type === 'ceia' && <ChefHat className="w-5 h-5 text-red-600 dark:text-red-400" />}
                          {activity.type === 'bebidas' && <Wine className="w-5 h-5 text-red-600 dark:text-red-400" />}
                          {activity.type === 'mensagem' && <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />}
                          <div>
                            <p className="font-medium text-slate-900 dark:text-[#f5f5f5]">{activity.title}</p>
                            <p className="text-sm text-slate-500 dark:text-[#a3a3a3]">
                              {activity.date.toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        {activity.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

