import { query } from '../db'

/**
 * Extrai o identificador do cliente (helper local para evitar importar rateLimiter).
 */
function getClientIdentifier(request: Request | { headers: Headers }): string {
  const headers = request.headers
  const cfConnectingIp = headers.get('cf-connecting-ip')
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  
  return cfConnectingIp || 
         (forwarded ? forwarded.split(',')[0].trim() : null) || 
         realIp || 
         'unknown'
}

/**
 * Sistema avançado de logging de auditoria.
 * 
 * Salva logs diretamente no banco de dados para persistência e análise.
 * Complementa o SecurityLogger em memória com armazenamento permanente.
 */

/**
 * Registra um log de segurança no banco de dados.
 */
export async function logSecurityEvent(
  event: {
    type: string
    ip?: string | null
    endpoint?: string | null
    details?: string | null
    userId?: string | null
    userAgent?: string | null
    severity?: 'info' | 'warning' | 'error' | 'critical'
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    await query(
      `INSERT INTO security_logs (
        user_id, event_type, ip_address, user_agent, endpoint, 
        details, severity, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        event.userId || null,
        event.type,
        event.ip || null,
        event.userAgent || null,
        event.endpoint || null,
        event.details || null,
        event.severity || 'info',
        JSON.stringify(event.metadata || {}),
      ]
    )
  } catch (error) {
    // Não falhar silenciosamente em produção, mas não bloquear requisição
    console.error('Erro ao salvar log de segurança:', error)
  }
}

/**
 * Registra um log de auditoria no banco de dados.
 */
export async function logAuditEvent(
  event: {
    userId?: string | null
    tableName: string
    recordId: string
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues?: Record<string, any> | null
    newValues?: Record<string, any> | null
    ip?: string | null
    userAgent?: string | null
  }
): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (
        user_id, table_name, record_id, action, 
        old_values, new_values, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        event.userId || null,
        event.tableName,
        event.recordId,
        event.action,
        event.oldValues ? JSON.stringify(event.oldValues) : null,
        event.newValues ? JSON.stringify(event.newValues) : null,
        event.ip || null,
        event.userAgent || null,
      ]
    )
  } catch (error) {
    console.error('Erro ao salvar log de auditoria:', error)
  }
}

/**
 * Helper para criar log de auditoria a partir de uma requisição.
 */
export async function logAuditFromRequest(
  request: Request | { headers: Headers },
  event: {
    userId?: string | null
    tableName: string
    recordId: string
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues?: Record<string, any> | null
    newValues?: Record<string, any> | null
  }
): Promise<void> {
  const ip = getClientIdentifier(request)
  const userAgent = request.headers.get('user-agent') || null

  await logAuditEvent({
    ...event,
    ip,
    userAgent,
  })
}

