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

    this.events.push(securityEvent)
    
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
    
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(securityEvent)
    } else {
      console.warn('[SECURITY EVENT]', {
        type: securityEvent.type,
        ip: securityEvent.ip,
        endpoint: securityEvent.endpoint,
        details: securityEvent.details,
        timestamp: securityEvent.timestamp.toISOString(),
      })
    }
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

