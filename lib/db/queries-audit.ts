import { query } from '../db'
import type { SecurityLog, AuditLog } from '@/database/types'

/**
 * Queries específicas para logs de auditoria e segurança.
 * 
 * Fornece funções para buscar, filtrar e analisar logs de forma eficiente.
 */

export interface LogFilters {
  eventType?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  userId?: string
  ipAddress?: string
  tableName?: string
  action?: 'INSERT' | 'UPDATE' | 'DELETE'
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Busca logs de segurança com filtros e paginação.
 */
export async function getSecurityLogs(
  filters: LogFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<PaginatedResult<SecurityLog>> {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.eventType) {
    conditions.push(`event_type = $${paramIndex++}`)
    params.push(filters.eventType)
  }

  if (filters.severity) {
    conditions.push(`severity = $${paramIndex++}`)
    params.push(filters.severity)
  }

  if (filters.userId) {
    conditions.push(`user_id = $${paramIndex++}`)
    params.push(filters.userId)
  }

  if (filters.ipAddress) {
    conditions.push(`ip_address = $${paramIndex++}`)
    params.push(filters.ipAddress)
  }

  if (filters.startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(filters.startDate)
  }

  if (filters.endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(filters.endDate)
  }

  if (filters.search) {
    conditions.push(`(
      details ILIKE $${paramIndex} OR 
      endpoint ILIKE $${paramIndex} OR
      event_type ILIKE $${paramIndex}
    )`)
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Contar total
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM security_logs ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0]?.count || '0', 10)

  // Buscar dados
  params.push(limit, offset)
  const dataResult = await query<SecurityLog>(
    `SELECT * FROM security_logs 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  )

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Busca logs de auditoria com filtros e paginação.
 */
export async function getAuditLogs(
  filters: LogFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<PaginatedResult<AuditLog>> {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.tableName) {
    conditions.push(`table_name = $${paramIndex++}`)
    params.push(filters.tableName)
  }

  if (filters.action) {
    conditions.push(`action = $${paramIndex++}`)
    params.push(filters.action)
  }

  if (filters.userId) {
    conditions.push(`user_id = $${paramIndex++}`)
    params.push(filters.userId)
  }

  if (filters.ipAddress) {
    conditions.push(`ip_address = $${paramIndex++}`)
    params.push(filters.ipAddress)
  }

  if (filters.startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(filters.startDate)
  }

  if (filters.endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(filters.endDate)
  }

  if (filters.search) {
    conditions.push(`(
      table_name ILIKE $${paramIndex} OR 
      record_id::text ILIKE $${paramIndex}
    )`)
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Contar total
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0]?.count || '0', 10)

  // Buscar dados
  params.push(limit, offset)
  const dataResult = await query<AuditLog>(
    `SELECT * FROM audit_logs 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  )

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Obtém estatísticas de logs de segurança.
 */
export async function getSecurityLogStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number
  bySeverity: Record<string, number>
  byEventType: Record<string, number>
  byDay: Array<{ date: string; count: number }>
  topIPs: Array<{ ip: string; count: number }>
  topUsers: Array<{ userId: string; count: number }>
}> {
  // Construir filtro de data usando parâmetros para prevenir SQL injection
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(startDate)
  }

  if (endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(endDate)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Total
  const totalResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM security_logs ${whereClause}`,
    params
  )
  const total = parseInt(totalResult.rows[0]?.count || '0', 10)

  // Por severidade
  const severityResult = await query<{ severity: string; count: string }>(
    `SELECT severity, COUNT(*) as count 
     FROM security_logs 
     ${whereClause}
     GROUP BY severity`,
    params
  )
  const bySeverity: Record<string, number> = {}
  severityResult.rows.forEach((row) => {
    bySeverity[row.severity] = parseInt(row.count, 10)
  })

  // Por tipo de evento
  const eventTypeResult = await query<{ event_type: string; count: string }>(
    `SELECT event_type, COUNT(*) as count 
     FROM security_logs 
     ${whereClause}
     GROUP BY event_type 
     ORDER BY count DESC 
     LIMIT 20`,
    params
  )
  const byEventType: Record<string, number> = {}
  eventTypeResult.rows.forEach((row) => {
    byEventType[row.event_type] = parseInt(row.count, 10)
  })

  // Por dia (últimos 30 dias)
  const dayConditions = [...conditions]
  const dayParams = [...params]
  let dayParamIndex = paramIndex
  
  dayConditions.push(`created_at >= NOW() - INTERVAL '30 days'`)
  const dayWhereClause = dayConditions.length > 0 ? `WHERE ${dayConditions.join(' AND ')}` : ''
  
  const byDayResult = await query<{ date: string; count: string }>(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM security_logs
     ${dayWhereClause}
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    dayParams
  )
  const byDay = byDayResult.rows.map((row) => ({
    date: row.date,
    count: parseInt(row.count, 10),
  }))

  // Top IPs
  const ipConditions = [...conditions]
  ipConditions.push('ip_address IS NOT NULL')
  const ipWhereClause = ipConditions.length > 0 ? `WHERE ${ipConditions.join(' AND ')}` : ''
  
  const topIPsResult = await query<{ ip_address: string; count: string }>(
    `SELECT ip_address, COUNT(*) as count
     FROM security_logs
     ${ipWhereClause}
     GROUP BY ip_address
     ORDER BY count DESC
     LIMIT 10`,
    params
  )
  const topIPs = topIPsResult.rows.map((row) => ({
    ip: row.ip_address || 'unknown',
    count: parseInt(row.count, 10),
  }))

  // Top usuários
  const userConditions = [...conditions]
  userConditions.push('user_id IS NOT NULL')
  const userWhereClause = userConditions.length > 0 ? `WHERE ${userConditions.join(' AND ')}` : ''
  
  const topUsersResult = await query<{ user_id: string; count: string }>(
    `SELECT user_id, COUNT(*) as count
     FROM security_logs
     ${userWhereClause}
     GROUP BY user_id
     ORDER BY count DESC
     LIMIT 10`,
    params
  )
  const topUsers = topUsersResult.rows.map((row) => ({
    userId: row.user_id || 'unknown',
    count: parseInt(row.count, 10),
  }))

  return {
    total,
    bySeverity,
    byEventType,
    byDay,
    topIPs,
    topUsers,
  }
}

/**
 * Obtém estatísticas de logs de auditoria.
 */
export async function getAuditLogStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number
  byAction: Record<string, number>
  byTable: Record<string, number>
  byDay: Array<{ date: string; count: number }>
  topUsers: Array<{ userId: string; count: number }>
}> {
  // Construir filtro de data usando parâmetros para prevenir SQL injection
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(startDate)
  }

  if (endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(endDate)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Total
  const totalResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
    params
  )
  const total = parseInt(totalResult.rows[0]?.count || '0', 10)

  // Por ação
  const actionResult = await query<{ action: string; count: string }>(
    `SELECT action, COUNT(*) as count 
     FROM audit_logs 
     ${whereClause}
     GROUP BY action`,
    params
  )
  const byAction: Record<string, number> = {}
  actionResult.rows.forEach((row) => {
    byAction[row.action] = parseInt(row.count, 10)
  })

  // Por tabela
  const tableResult = await query<{ table_name: string; count: string }>(
    `SELECT table_name, COUNT(*) as count 
     FROM audit_logs 
     ${whereClause}
     GROUP BY table_name 
     ORDER BY count DESC`,
    params
  )
  const byTable: Record<string, number> = {}
  tableResult.rows.forEach((row) => {
    byTable[row.table_name] = parseInt(row.count, 10)
  })

  // Por dia (últimos 30 dias)
  const dayConditions = [...conditions]
  const dayParams = [...params]
  
  dayConditions.push(`created_at >= NOW() - INTERVAL '30 days'`)
  const dayWhereClause = dayConditions.length > 0 ? `WHERE ${dayConditions.join(' AND ')}` : ''
  
  const byDayResult = await query<{ date: string; count: string }>(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM audit_logs
     ${dayWhereClause}
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    dayParams
  )
  const byDay = byDayResult.rows.map((row) => ({
    date: row.date,
    count: parseInt(row.count, 10),
  }))

  // Top usuários
  const userConditions = [...conditions]
  userConditions.push('user_id IS NOT NULL')
  const userWhereClause = userConditions.length > 0 ? `WHERE ${userConditions.join(' AND ')}` : ''
  
  const topUsersResult = await query<{ user_id: string; count: number }>(
    `SELECT user_id, COUNT(*)::int as count
     FROM audit_logs
     ${userWhereClause}
     GROUP BY user_id
     ORDER BY count DESC
     LIMIT 10`,
    params
  )
  const topUsers = topUsersResult.rows.map((row) => ({
    userId: row.user_id || 'unknown',
    count: row.count,
  }))

  return {
    total,
    byAction,
    byTable,
    byDay,
    topUsers,
  }
}

/**
 * Exporta logs para CSV.
 */
export async function exportSecurityLogsToCSV(filters: LogFilters = {}): Promise<string> {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.eventType) {
    conditions.push(`event_type = $${paramIndex++}`)
    params.push(filters.eventType)
  }

  if (filters.severity) {
    conditions.push(`severity = $${paramIndex++}`)
    params.push(filters.severity)
  }

  if (filters.startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(filters.startDate)
  }

  if (filters.endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(filters.endDate)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await query<SecurityLog>(
    `SELECT * FROM security_logs 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT 10000`,
    params
  )

  // Gerar CSV
  const headers = ['ID', 'Data', 'Tipo', 'Severidade', 'IP', 'Endpoint', 'Usuário', 'Detalhes']
  const rows = result.rows.map((log) => [
    log.id,
    log.created_at.toISOString(),
    log.event_type,
    log.severity,
    log.ip_address || '',
    log.endpoint || '',
    log.user_id || '',
    (log.details || '').replace(/"/g, '""'),
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csv
}

/**
 * Exporta logs de auditoria para CSV.
 */
export async function exportAuditLogsToCSV(filters: LogFilters = {}): Promise<string> {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.tableName) {
    conditions.push(`table_name = $${paramIndex++}`)
    params.push(filters.tableName)
  }

  if (filters.action) {
    conditions.push(`action = $${paramIndex++}`)
    params.push(filters.action)
  }

  if (filters.startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(filters.startDate)
  }

  if (filters.endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(filters.endDate)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await query<AuditLog>(
    `SELECT * FROM audit_logs 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT 10000`,
    params
  )

  // Gerar CSV
  const headers = ['ID', 'Data', 'Tabela', 'Ação', 'Record ID', 'Usuário', 'IP', 'Valores Antigos', 'Valores Novos']
  const rows = result.rows.map((log) => [
    log.id,
    log.created_at.toISOString(),
    log.table_name,
    log.action,
    log.record_id,
    log.user_id || '',
    log.ip_address || '',
    JSON.stringify(log.old_values || {}),
    JSON.stringify(log.new_values || {}),
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return csv
}

