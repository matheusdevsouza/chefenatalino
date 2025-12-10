/**
 * Estrutura de um evento de segurança registrado.
 */

interface SecurityEvent {
  type: 'rate_limit' | 'invalid_input' | 'suspicious_activity' | 'api_error' | 'unauthorized'
  ip: string
  endpoint: string
  details: string
  timestamp: Date
  userAgent?: string
}

/**
 * Classe responsável pelo registro e gerenciamento de eventos de segurança.
 * 
 * Mantém histórico de eventos em memória e pode enviar notificações para
 * serviços externos em produção. Implementa métodos para consulta e filtragem
 * de eventos por tipo ou origem.
 */

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000

  /**
   * Registra um novo evento de segurança no sistema de logging.
   * 
   * Adiciona o evento ao histórico em memória e, em produção, envia
   * notificação para serviço externo configurado. Em desenvolvimento,
   * exibe o evento no console para depuração.
   */

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    }

    // Sanitiza detalhes para não expor dados sensíveis
    const sanitizedDetails = this.sanitizeLogDetails(event.details)

    this.events.push(securityEvent)
    
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // NÃO salvar no banco quando executado no middleware (Edge Runtime)
    // O middleware roda no Edge Runtime que não tem acesso a módulos Node.js como 'pg'
    // O salvamento será feito apenas nas rotas de API (Node.js Runtime)
    // Para evitar problemas, não tentamos salvar aqui - apenas log em memória
    
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService({
        ...securityEvent,
        details: sanitizedDetails,
      })
    } else {
      console.warn('[SECURITY EVENT]', {
        type: securityEvent.type,
        ip: this.maskIP(securityEvent.ip),
        endpoint: securityEvent.endpoint,
        details: sanitizedDetails,
        timestamp: securityEvent.timestamp.toISOString(),
      })
    }
  }

  // Função saveToDatabase removida - não usada no middleware (Edge Runtime)
  // O salvamento no banco será feito apenas nas rotas de API quando necessário

  /**
   * Mapeia tipo de evento para severidade.
   */
  private getSeverityFromType(type: string): 'info' | 'warning' | 'error' | 'critical' {
    if (type === 'rate_limit' || type === 'suspicious_activity') {
      return 'warning'
    }
    if (type === 'unauthorized' || type === 'api_error') {
      return 'error'
    }
    return 'info'
  }

  /**
   * Sanitiza detalhes de log removendo informações sensíveis.
   */
  private sanitizeLogDetails(details: string): string {
    // Remove emails
    let sanitized = details.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    
    // Remove tokens (hex strings longos)
    sanitized = sanitized.replace(/[a-f0-9]{32,}/gi, '[TOKEN]')
    
    // Remove senhas potenciais
    sanitized = sanitized.replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
    
    return sanitized
  }

  /**
   * Mascara IP para privacidade (últimos octetos).
   */
  private maskIP(ip: string): string {
    if (ip === 'unknown') return ip
    
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`
    }
    
    return ip
  }

  private sendToExternalService(event: SecurityEvent) {
    if (process.env.SECURITY_WEBHOOK_URL) {
      fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
      })
    }
  }

  /**
   * Retorna os eventos mais recentes do histórico.
   */

  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Filtra eventos por tipo específico.
   */

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter((e) => e.type === type)
  }

  /**
   * Filtra eventos por endereço IP de origem.
   */

  getEventsByIP(ip: string): SecurityEvent[] {
    return this.events.filter((e) => e.ip === ip)
  }
}

/**
 * Instância singleton do logger de segurança.
 * 
 * Disponibiliza acesso global ao sistema de logging de segurança
 * em toda a aplicação.
 */

export const securityLogger = new SecurityLogger()

