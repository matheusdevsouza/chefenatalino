'use client'

/**
 * Sanitização de inputs no lado do cliente.
 * 
 * Esta é uma camada adicional de proteção que deve ser usada
 * ANTES de enviar dados para o servidor. A validação final sempre
 * acontece no servidor.
 */

/**
 * Sanitiza uma string removendo caracteres perigosos.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remover caracteres de controle
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Remover tags HTML/JavaScript básicas
  sanitized = sanitized
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
  
  // Normalizar espaços
  sanitized = sanitized.trim().replace(/\s+/g, ' ')
  
  return sanitized
}

/**
 * Sanitiza um email removendo caracteres inválidos.
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  // Remover espaços e converter para lowercase
  let sanitized = email.trim().toLowerCase()
  
  // Remover caracteres perigosos mas manter formato de email válido
  sanitized = sanitized.replace(/[^\w@.-]/g, '')
  
  // Validar formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return ''
  }
  
  return sanitized
}

/**
 * Sanitiza um telefone removendo caracteres não numéricos.
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return ''
  }

  // Remover tudo exceto números, espaços, parênteses, hífens e +
  let sanitized = phone.replace(/[^\d\s()+-]/g, '')
  
  // Limitar tamanho
  sanitized = sanitized.substring(0, 20)
  
  return sanitized.trim()
}

/**
 * Sanitiza um número garantindo que seja válido.
 */
export function sanitizeNumber(input: string, min?: number, max?: number): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remover tudo exceto números e ponto decimal
  let sanitized = input.replace(/[^\d.]/g, '')
  
  // Garantir apenas um ponto decimal
  const parts = sanitized.split('.')
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // Limitar casas decimais
  if (parts.length === 2 && parts[1].length > 2) {
    sanitized = parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  const num = parseFloat(sanitized)
  
  if (isNaN(num)) {
    return ''
  }
  
  if (min !== undefined && num < min) {
    return min.toString()
  }
  
  if (max !== undefined && num > max) {
    return max.toString()
  }
  
  return sanitized
}

/**
 * Sanitiza um horário no formato HH:MM.
 */
export function sanitizeTime(time: string): string {
  if (typeof time !== 'string') {
    return ''
  }

  // Remover tudo exceto números e dois pontos
  let sanitized = time.replace(/[^\d:]/g, '')
  
  // Validar formato HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(sanitized)) {
    return ''
  }
  
  return sanitized
}

/**
 * Valida e sanitiza um código TOTP (6 dígitos).
 */
export function sanitizeTOTPCode(code: string): string {
  if (typeof code !== 'string') {
    return ''
  }

  // Remover tudo exceto números
  let sanitized = code.replace(/\D/g, '')
  
  // Limitar a 6 dígitos
  sanitized = sanitized.substring(0, 6)
  
  return sanitized
}

/**
 * Sanitiza um código de backup (8 dígitos).
 */
export function sanitizeBackupCode(code: string): string {
  if (typeof code !== 'string') {
    return ''
  }

  // Remover tudo exceto números e letras
  let sanitized = code.replace(/[^a-zA-Z0-9]/g, '')
  
  // Limitar a 8 caracteres
  sanitized = sanitized.substring(0, 8).toUpperCase()
  
  return sanitized
}

/**
 * Sanitiza um token de reset de senha.
 */
export function sanitizeToken(token: string): string {
  if (typeof token !== 'string') {
    return ''
  }

  // Remover caracteres perigosos mas manter formato de token
  let sanitized = token.replace(/[^\w-]/g, '')
  
  // Limitar tamanho
  sanitized = sanitized.substring(0, 200)
  
  return sanitized
}

/**
 * Sanitiza um UUID.
 */
export function sanitizeUUID(uuid: string): string {
  if (typeof uuid !== 'string') {
    return ''
  }

  // Validar formato UUID básico
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return ''
  }
  
  return uuid.toLowerCase()
}

/**
 * Sanitiza um campo de busca/filtro.
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 100): string {
  if (typeof query !== 'string') {
    return ''
  }

  // Sanitizar string básica
  let sanitized = sanitizeString(query)
  
  // Limitar tamanho
  sanitized = sanitized.substring(0, maxLength)
  
  return sanitized
}

