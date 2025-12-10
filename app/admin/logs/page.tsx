'use client'

import { useState, useEffect } from 'react'
import { Shield, FileText, Download, Filter, Search, Calendar, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'
import { sanitizeSearchQuery } from '@/lib/security/clientInputSanitizer'
import { useModal } from '@/context/ModalContext'

/**
 * Painel administrativo de logs de auditoria.
 * 
 * Visualização completa de logs de segurança e auditoria com:
 * - Filtros avançados
 * - Busca em tempo real
 * - Paginação
 * - Exportação CSV
 * - Estatísticas e gráficos
 */

interface SecurityLog {
  id: string
  user_id?: string | null
  event_type: string
  ip_address?: string | null
  user_agent?: string | null
  endpoint?: string | null
  details?: string | null
  severity: 'info' | 'warning' | 'error' | 'critical'
  metadata: Record<string, any>
  created_at: string
}

interface AuditLog {
  id: string
  user_id?: string | null
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

type LogType = 'security' | 'audit'

export default function AdminLogsPage() {
  const { showModal } = useModal()
  const [logType, setLogType] = useState<LogType>('security')
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    severity: '',
    eventType: '',
    tableName: '',
    action: '',
    startDate: '',
    endDate: '',
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [logType, page, filters])

  async function loadLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.eventType) params.append('eventType', filters.eventType)
      if (filters.tableName) params.append('tableName', filters.tableName)
      if (filters.action) params.append('action', filters.action)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const endpoint = logType === 'security' 
        ? `/api/admin/logs/security?${params}`
        : `/api/admin/logs/audit?${params}`

      const response = await fetch(endpoint, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 403) {
          showModal({
            type: 'error',
            message: 'Acesso negado: você precisa ser administrador',
            title: 'Acesso Negado',
          })
          return
        }
        throw new Error('Erro ao carregar logs')
      }

      const data = await response.json()

      if (logType === 'security') {
        setSecurityLogs(data.data || [])
      } else {
        setAuditLogs(data.data || [])
      }

      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      showModal({
        type: 'error',
        message: 'Erro ao carregar logs. Tente novamente.',
        title: 'Erro',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    const params = new URLSearchParams({
      export: 'csv',
    })

    if (filters.search) params.append('search', filters.search)
    if (filters.severity) params.append('severity', filters.severity)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const endpoint = logType === 'security'
      ? `/api/admin/logs/security?${params}`
      : `/api/admin/logs/audit?${params}`

    window.open(endpoint, '_blank')
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-[#2e2e2e] rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f5f5f5] flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Logs de Auditoria
              </h1>
              <p className="text-gray-600 dark:text-[#d4d4d4] mt-2">Visualize e gerencie logs de segurança e auditoria do sistema</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-[#3a3a3a]">
            <button
              onClick={() => {
                setLogType('security')
                setPage(1)
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                logType === 'security'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5]'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Logs de Segurança ({total})
            </button>
            <button
              onClick={() => {
                setLogType('audit')
                setPage(1)
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                logType === 'audit'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5]'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Logs de Auditoria ({total})
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2e2e2e] rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#a3a3a3]" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => {
                      const sanitized = sanitizeSearchQuery(e.target.value, 100)
                      setFilters({ ...filters, search: sanitized })
                    }}
                    placeholder="Buscar em logs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {logType === 'security' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Severidade</label>
                    <select
                      value={filters.severity}
                      onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Tipo de Evento</label>
                    <input
                      type="text"
                      value={filters.eventType}
                      onChange={(e) => {
                        const sanitized = sanitizeSearchQuery(e.target.value, 50)
                        setFilters({ ...filters, eventType: sanitized })
                      }}
                      placeholder="Ex: rate_limit, suspicious_activity"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Tabela</label>
                    <input
                      type="text"
                      value={filters.tableName}
                      onChange={(e) => {
                        const sanitized = sanitizeSearchQuery(e.target.value, 50)
                        setFilters({ ...filters, tableName: sanitized })
                      }}
                      placeholder="Ex: users, subscriptions"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Ação</label>
                    <select
                      value={filters.action}
                      onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      <option value="INSERT">INSERT</option>
                      <option value="UPDATE">UPDATE</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Data Inicial</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">Data Final</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      severity: '',
                      eventType: '',
                      tableName: '',
                      action: '',
                      startDate: '',
                      endDate: '',
                    })
                    setPage(1)
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-[#3a3a3a] text-gray-800 dark:text-[#f5f5f5] rounded-lg hover:bg-gray-300 dark:hover:bg-[#3a3a3a]/80 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#2e2e2e] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-[#3a3a3a]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-gray-600 dark:text-[#d4d4d4]">Carregando logs...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#3a3a3a] border-b border-gray-200 dark:border-[#3a3a3a]">
                    <tr>
                      {logType === 'security' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Severidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">IP</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Endpoint</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Detalhes</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Ação</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Tabela</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Record ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Usuário</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">IP</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#2e2e2e] divide-y divide-gray-200 dark:divide-[#3a3a3a]">
                    {logType === 'security' ? (
                      securityLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-[#a3a3a3]">
                            Nenhum log encontrado
                          </td>
                        </tr>
                      ) : (
                        securityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#3a3a3a]">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f5f5f5]">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(log.severity)}`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f5f5f5]">
                              {log.event_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#d4d4d4]">
                              {log.ip_address || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#d4d4d4]">
                              {log.endpoint || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#d4d4d4] max-w-md truncate">
                              {log.details || '-'}
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-[#a3a3a3]">
                            Nenhum log encontrado
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#3a3a3a]">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f5f5f5]">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f5f5f5]">
                              {log.table_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#d4d4d4] font-mono">
                              {log.record_id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#d4d4d4]">
                              {log.user_id ? log.user_id.substring(0, 8) + '...' : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#d4d4d4]">
                              {log.ip_address || '-'}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-[#3a3a3a] px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-[#3a3a3a]">
                  <div className="text-sm text-gray-700 dark:text-[#d4d4d4]">
                    Mostrando página {page} de {totalPages} ({total} registros)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3a3a3a]/80"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-[#f5f5f5] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3a3a3a]/80"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

