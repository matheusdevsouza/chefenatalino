const DANGEROUS_PATTERNS = [
  /ignore\s+(previous|all|above|instructions)/i,
  /forget\s+(previous|all|everything)/i,
  /system:\s*/i,
  /assistant:\s*/i,
  /you\s+are\s+now/i,
  /new\s+instructions/i,
  /disregard\s+(previous|all)/i,
  /override\s+(previous|system)/i,
  /bypass\s+(safety|security|filter)/i,
  
  /<script[\s>]/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /function\s*\(/i,
  /\.call\s*\(/i,
  /\.apply\s*\(/i,
  
  /process\.env/i,
  /__dirname/i,
  /__filename/i,
  /require\s*\(/i,
  /import\s+.*\s+from/i,
  
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
  /(\$where|\$ne|\$gt|\$lt)/i,
  
  /\.\.\//g,
  /\/etc\/passwd/i,
  /\/proc\/self/i,
  
  /bash\s+-i/i,
  /nc\s+-e/i,
  /python\s+-c/i,
  /perl\s+-e/i,
]

const SUSPICIOUS_PATTERNS = [
  /base64/i,
  /hex/i,
  /unicode/i,
  /obfuscat/i,
  /encod/i,
  /decod/i,
]

/**
 * Resultado do processo de sanitização de um prompt.
 */

export interface SanitizationResult {
  sanitized: string
  isSafe: boolean
  warnings: string[]
  blocked: boolean
}

/**
 * Sanitiza e valida um prompt para prevenir ataques de prompt injection.
 * 
 * Aplica análise profunda do conteúdo, detectando padrões perigosos e suspeitos
 * que possam manipular o comportamento do modelo de IA. Remove caracteres de
 * controle, normaliza espaços e valida a estrutura do prompt.
 */

export function sanitizePrompt(prompt: string): SanitizationResult {
  const warnings: string[] = []
  let sanitized = prompt
  let blocked = false

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      blocked = true
      warnings.push(`Padrão perigoso detectado: ${pattern.source}`)
      sanitized = sanitized.replace(pattern, '[BLOQUEADO]')
    }
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push(`Padrão suspeito detectado: ${pattern.source}`)
    }
  }

  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  sanitized = sanitized.replace(/\s{3,}/g, ' ')

  const MAX_LENGTH = 5000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
    warnings.push('Prompt truncado por exceder tamanho máximo')
  }

  const uniqueChars = new Set(sanitized).size
  if (uniqueChars < 5 && sanitized.length > 100) {
    blocked = true
    warnings.push('Padrão de repetição suspeito detectado')
  }

  return {
    sanitized: sanitized.trim(),
    isSafe: !blocked && warnings.length === 0,
    warnings,
    blocked,
  }
}

/**
 * Valida a estrutura básica de um prompt.
 * 
 * Verifica se o prompt possui características mínimas de um texto válido,
 * incluindo comprimento adequado e proporção razoável de caracteres alfanuméricos,
 * prevenindo tentativas de ataque através de prompts malformados.
 */

export function validatePromptStructure(prompt: string): boolean {
  if (prompt.length < 10) {
    return false
  }

  const alphanumericRatio = (prompt.match(/[a-zA-Z0-9]/g) || []).length / prompt.length
  if (alphanumericRatio < 0.3) {
    return false
  }

  return true
}

