import { z } from 'zod'
import { sanitizeInput, detectSQLInjection, detectNoSQLInjection } from './validation'

/**
 * Sistema rigoroso de validação e sanitização de inputs.
 * 
 * Garante que TODOS os dados que entram no sistema sejam validados,
 * sanitizados e verificados contra injeção SQL, NoSQL e XSS antes
 * de serem processados ou salvos no banco de dados.
 */

/**
 * Schema de validação para registro de usuário.
 * Extremamente rigoroso para prevenir qualquer tipo de ataque.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(500, 'Nome muito longo')
    .refine((val) => {
      const trimmed = val.trim()
      if (trimmed.length < 2) return false
      if (detectSQLInjection(trimmed)) return false
      if (detectNoSQLInjection(trimmed)) return false
      // Verificar caracteres perigosos
      if (/[<>\"'`;\\]/.test(trimmed)) return false
      return true
    }, { message: 'Nome contém caracteres inválidos ou padrões suspeitos' })
    .transform((val) => sanitizeInput(val.trim())),
  
  email: z
    .string()
    .email('Email inválido')
    .max(320, 'Email muito longo')
    .refine((val) => {
      const trimmed = val.trim().toLowerCase()
      if (detectSQLInjection(trimmed)) return false
      if (detectNoSQLInjection(trimmed)) return false
      // Validar formato de email rigorosamente
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
      return emailRegex.test(trimmed)
    }, { message: 'Email inválido ou contém padrões suspeitos' })
    .transform((val) => val.trim().toLowerCase()),
  
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa')
    .refine((val) => {
      if (detectSQLInjection(val)) return false
      if (detectNoSQLInjection(val)) return false
      return true
    }, { message: 'Senha contém padrões suspeitos' }),
  
  phone: z
    .string()
    .max(20, 'Telefone muito longo')
    .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone contém caracteres inválidos')
    .refine((val) => {
      const trimmed = val.trim()
      if (trimmed.length === 0) return true // Opcional
      if (detectSQLInjection(trimmed)) return false
      if (detectNoSQLInjection(trimmed)) return false
      // Remover caracteres não numéricos e verificar tamanho
      const digitsOnly = trimmed.replace(/\D/g, '')
      return digitsOnly.length >= 10 && digitsOnly.length <= 15
    }, { message: 'Telefone inválido ou contém padrões suspeitos' })
    .transform((val) => val.trim())
    .optional()
    .nullable(),
})

/**
 * Schema de validação para login.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(320, 'Email muito longo')
    .refine((val) => {
      const trimmed = val.trim().toLowerCase()
      if (detectSQLInjection(trimmed)) return false
      if (detectNoSQLInjection(trimmed)) return false
      return true
    }, { message: 'Email inválido ou contém padrões suspeitos' })
    .transform((val) => val.trim().toLowerCase()),
  
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa')
    .refine((val) => {
      if (detectSQLInjection(val)) return false
      if (detectNoSQLInjection(val)) return false
      return true
    }, { message: 'Senha contém padrões suspeitos' }),
  
  remember: z
    .boolean()
    .optional()
    .default(false),
})

/**
 * Schema de validação para reset de senha.
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(32, 'Token inválido')
    .max(500, 'Token muito longo')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Token contém caracteres inválidos')
    .refine((val) => {
      if (detectSQLInjection(val)) return false
      if (detectNoSQLInjection(val)) return false
      return true
    }, { message: 'Token contém padrões suspeitos' }),
  
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa')
    .refine((val) => {
      if (detectSQLInjection(val)) return false
      if (detectNoSQLInjection(val)) return false
      return true
    }, { message: 'Senha contém padrões suspeitos' }),
})

/**
 * Schema de validação para forgot password.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(320, 'Email muito longo')
    .refine((val) => {
      const trimmed = val.trim().toLowerCase()
      if (detectSQLInjection(trimmed)) return false
      if (detectNoSQLInjection(trimmed)) return false
      return true
    }, { message: 'Email inválido ou contém padrões suspeitos' })
    .transform((val) => val.trim().toLowerCase()),
})

/**
 * Schema de validação para UUID.
 */
export const uuidSchema = z
  .string()
  .uuid('ID inválido')
  .refine((val) => {
    if (detectSQLInjection(val)) return false
    if (detectNoSQLInjection(val)) return false
    return true
  }, { message: 'ID contém padrões suspeitos' })

/**
 * Schema de validação para TOTP code.
 */
export const totpCodeSchema = z
  .string()
  .length(6, 'Código deve ter 6 dígitos')
  .regex(/^\d{6}$/, 'Código deve conter apenas números')
  .refine((val) => {
    if (detectSQLInjection(val)) return false
    if (detectNoSQLInjection(val)) return false
    return true
  }, { message: 'Código contém padrões suspeitos' })

/**
 * Schema de validação para backup code.
 */
export const backupCodeSchema = z
  .string()
  .length(8, 'Código de backup deve ter 8 caracteres')
  .regex(/^[A-Z0-9]{8}$/, 'Código de backup inválido')
  .refine((val) => {
    if (detectSQLInjection(val)) return false
    if (detectNoSQLInjection(val)) return false
    return true
  }, { message: 'Código de backup contém padrões suspeitos' })

/**
 * Valida e sanitiza um objeto de entrada usando um schema Zod.
 * 
 * Retorna o objeto validado e sanitizado ou lança um erro se inválido.
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ')
      throw new Error(`Validação falhou: ${messages}`)
    }
    throw error
  }
}

/**
 * Valida múltiplos campos de uma vez.
 */
export function validateFields<T extends Record<string, z.ZodSchema>>(
  schemas: T,
  data: Record<string, unknown>
): { [K in keyof T]: z.infer<T[K]> } {
  const result: any = {}
  
  for (const [key, schema] of Object.entries(schemas)) {
    try {
      result[key] = schema.parse(data[key])
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(', ')
        throw new Error(`Campo "${key}": ${messages}`)
      }
      throw error
    }
  }
  
  return result
}

/**
 * Sanitiza um objeto completo recursivamente.
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar chave também
      const sanitizedKey = sanitizeInput(String(key))
      sanitized[sanitizedKey] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}

