'use client'

import { sanitizeInput } from './validation'

/**
 * Valida e sanitiza entrada do usuário no lado do cliente.
 * 
 * Aplica validações específicas conforme o tipo de campo e sanitiza
 * o conteúdo para prevenir injeção de código. Retorna informações
 * detalhadas sobre a validação incluindo mensagens de erro.
 */

export function validateClientInput(input: string, type: 'text' | 'number' | 'email'): {
  valid: boolean
  error?: string
  sanitized?: string
} {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'Campo obrigatório' }
  }

  const sanitized = sanitizeInput(input)

  switch (type) {
    case 'number':
      if (!/^\d+(\.\d{1,2})?$/.test(input)) {
        return { valid: false, error: 'Deve ser um número válido' }
      }
      const num = parseFloat(input)
      if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Número inválido' }
      }
      return { valid: true, sanitized: input }

    case 'text':
      if (input.length < 2) {
        return { valid: false, error: 'Mínimo de 2 caracteres' }
      }
      if (input.length > 500) {
        return { valid: false, error: 'Máximo de 500 caracteres' }
      }
      if (/<script|javascript:|onerror=|onload=/i.test(input)) {
        return { valid: false, error: 'Caracteres inválidos detectados' }
      }
      return { valid: true, sanitized }

    default:
      return { valid: true, sanitized }
  }
}

/**
 * Valida o formato de uma string de horário no padrão HH:MM.
 * 
 * Verifica se corresponde ao formato de 24 horas válido,
 * aceitando valores de 00:00 até 23:59.
 */

export function validateTimeInput(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

/**
 * Valida se um número está dentro de uma faixa especificada.
 * 
 * Verifica se o valor está entre os limites mínimo e máximo inclusivos.
 */

export function validateNumberRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

