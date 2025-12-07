import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Schema de validação para prompts enviados à API do Gemini.
 * 
 * Valida tamanho, estrutura e conteúdo do prompt, detectando padrões
 * suspeitos que possam indicar tentativas de prompt injection ou outros
 * ataques contra o modelo de IA.
 */

export const geminiPromptSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt deve ter no mínimo 10 caracteres')
    .max(5000, 'Prompt excede o tamanho máximo de 5000 caracteres')
    .refine(
      (val) => {
        const lower = val.toLowerCase()
        const dangerousPatterns = [
          'ignore previous',
          'forget all',
          'system:',
          'assistant:',
          'you are now',
          'new instructions',
          'disregard',
          'override',
          'bypass',
          'hack',
          'exploit',
          '<script',
          'javascript:',
          'onerror=',
          'onload=',
          'eval(',
          'exec(',
          'function(',
        ]
        return !dangerousPatterns.some((pattern) => lower.includes(pattern))
      },
      { message: 'Prompt contém padrões suspeitos' }
    )
    .refine(
      (val) => {
        const uniqueChars = new Set(val).size
        return uniqueChars > 5 || val.length < 100
      },
      { message: 'Prompt inválido' }
    ),
})

/**
 * Schema de validação para os dados de entrada do módulo Ceia Inteligente.
 * 
 * Valida e transforma os valores de entrada, garantindo que estejam dentro
 * dos limites aceitáveis e no formato correto antes do processamento.
 */

export const ceiaInputSchema = z.object({
  adultos: z
    .string()
    .regex(/^\d+$/, 'Deve ser um número')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  criancas: z
    .string()
    .regex(/^\d+$/, 'Deve ser um número')
    .transform(Number)
    .pipe(z.number().int().min(0).max(100)),
  orcamento: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Formato inválido')
    .transform(Number)
    .pipe(z.number().min(0).max(100000)),
  horario: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
  restricoes: z
    .string()
    .max(500, 'Restrições muito longas')
    .optional()
    .default(''),
})

/**
 * Schema de validação para os dados de entrada do módulo Mensagens Mágicas.
 * 
 * Valida destinatário e tom da mensagem, sanitizando o conteúdo
 * para prevenir injeção de código ou caracteres maliciosos.
 */

export const mensagensInputSchema = z.object({
  destinatario: z
    .string()
    .min(2, 'Destinatário deve ter no mínimo 2 caracteres')
    .max(100, 'Destinatário muito longo')
    .refine(
      (val) => {
        const sanitized = DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
        return sanitized === val
      },
      { message: 'Caracteres inválidos detectados' }
    ),
  tom: z.enum(['formal', 'engracado', 'emocionante'], {
    errorMap: () => ({ message: 'Tom inválido' }),
  }),
})

/**
 * Schema de validação para os dados de entrada do módulo Calculadora de Bebidas.
 * 
 * Valida valores numéricos de pessoas e duração, garantindo que estejam
 * dentro de faixas razoáveis para cálculos precisos.
 */

export const bebidasInputSchema = z.object({
  bebem: z
    .string()
    .regex(/^\d+$/, 'Deve ser um número')
    .transform(Number)
    .pipe(z.number().int().min(0).max(1000)),
  naoBebem: z
    .string()
    .regex(/^\d+$/, 'Deve ser um número')
    .transform(Number)
    .pipe(z.number().int().min(0).max(1000)),
  duracao: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Formato inválido')
    .transform(Number)
    .pipe(z.number().min(0.5).max(24)),
  nivel: z.enum(['moderado', 'alto'], {
    errorMap: () => ({ message: 'Nível inválido' }),
  }),
})

/**
 * Sanitiza uma string de entrada removendo caracteres perigosos e tags HTML/JavaScript.
 * 
 * Aplica múltiplas camadas de sanitização para prevenir ataques XSS e injeção
 * de código, removendo caracteres de controle, tags HTML e normalizando espaços.
 */

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '')
  
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
  
  sanitized = sanitized.trim().replace(/\s+/g, ' ')
  
  return sanitized
}

/**
 * Valida o tamanho de um payload JSON.
 * 
 * Verifica se o tamanho serializado do objeto não excede o limite máximo
 * permitido, prevenindo ataques de DoS através de payloads excessivamente grandes.
 */

export function validatePayloadSize(body: any, maxSize: number = 10000): boolean {
  try {
    const size = JSON.stringify(body).length
    return size <= maxSize
  } catch {
    return false
  }
}

/**
 * Detecta possíveis tentativas de injeção SQL em uma string.
 * 
 * Analisa o conteúdo em busca de padrões comuns de comandos SQL maliciosos,
 * incluindo palavras-chave de manipulação de banco de dados e caracteres especiais.
 */

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /('|(\\')|(;)|(\\)|(\/\*)|(\*\/)|(--)|(\+\+)|(\-\-))/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(UNION|JOIN)\b)/i,
  ]
  
  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Detecta possíveis tentativas de injeção NoSQL em uma string.
 * 
 * Identifica padrões específicos de operadores NoSQL que poderiam ser
 * utilizados para manipular consultas em bancos de dados não relacionais.
 */

export function detectNoSQLInjection(input: string): boolean {
  const nosqlPatterns = [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$gte/i,
    /\$lte/i,
    /\$in/i,
    /\$nin/i,
    /\$regex/i,
    /\$exists/i,
    /\$or/i,
    /\$and/i,
  ]
  
  return nosqlPatterns.some((pattern) => pattern.test(input))
}

