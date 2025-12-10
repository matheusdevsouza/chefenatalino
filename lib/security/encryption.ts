import crypto from 'crypto'

/**
 * Sistema avançado de criptografia para dados sensíveis de usuários.
 * 
 * Usa AES-256-GCM (Galois/Counter Mode) para criptografia autenticada.
 * GCM fornece tanto confidencialidade quanto autenticidade dos dados.
 * 
 * IMPORTANTE: Dados são criptografados antes de salvar no banco e
 * descriptografados apenas quando necessário para o usuário autenticado.
 * Nunca descriptografar no banco de dados.
 */

/**
 * Constantes de configuração de criptografia.
 * 
 * AES-256-GCM: algoritmo de criptografia autenticada
 * IV: 16 bytes (128 bits) - Initialization Vector
 * SALT: 64 bytes (512 bits) - Salt para derivação de chave
 * TAG: 16 bytes (128 bits) - Authentication tag do GCM
 * KEY: 32 bytes (256 bits) - Tamanho da chave AES-256
 * ITERATIONS: 100000 - Iterações do PBKDF2 para derivação de chave
 */
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const ITERATIONS = 100000

/**
 * Obtém a chave de criptografia a partir da variável de ambiente.
 * 
 * Se não configurada, gera uma chave temporária (NUNCA usar em produção).
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY não configurada. Configure antes de usar em produção!')
    }
    /**
     * Em desenvolvimento, usar chave temporária.
     * 
     * AVISO: NUNCA usar em produção. Configure ENCRYPTION_KEY adequadamente.
     */
    console.warn('⚠️ ENCRYPTION_KEY não configurada. Usando chave temporária. Configure ENCRYPTION_KEY para produção!')
    return crypto.scryptSync('temporary-dev-key-change-in-production', 'salt', KEY_LENGTH)
  }
  
  /**
   * Se a chave está em formato hex (64 caracteres), converter diretamente.
   * Caso contrário, derivar chave usando PBKDF2.
   */
  if (key.length === KEY_LENGTH * 2) {
    return Buffer.from(key, 'hex')
  }
  
  return crypto.pbkdf2Sync(key, 'encryption-salt', ITERATIONS, KEY_LENGTH, 'sha256')
}

/**
 * Criptografa um valor usando AES-256-GCM.
 * 
 * Retorna string no formato: iv:salt:tag:encryptedData (tudo em base64)
 * 
 * IMPORTANTE: Dados criptografados são aproximadamente 8-10x maiores que o original.
 * Exemplo: telefone de 20 caracteres = ~162 caracteres criptografados
 * 
 * @param text - Texto a ser criptografado
 * @param maxOriginalLength - Tamanho máximo permitido do texto original (opcional, para validação)
 * @returns String criptografada em formato base64
 */
export function encrypt(text: string | null | undefined, maxOriginalLength?: number): string | null {
  if (!text) {
    return null
  }

  if (maxOriginalLength !== undefined && text.length > maxOriginalLength) {
    throw new Error(`Texto muito longo para criptografia. Máximo: ${maxOriginalLength} caracteres`)
  }

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)
    
    /**
     * Salt único por valor garante que valores iguais produzam criptografias diferentes.
     */
    const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256')
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    const tag = cipher.getAuthTag()
    
    /**
     * Formato: iv:salt:tag:encryptedData (tudo em base64).
     */
    const encryptedString = `${iv.toString('base64')}:${salt.toString('base64')}:${tag.toString('base64')}:${encrypted}`
    
    if (process.env.NODE_ENV === 'development') {
      const expansionRatio = encryptedString.length / text.length
      if (expansionRatio > 10) {
        console.warn(`⚠️ Criptografia expandiu texto de ${text.length} para ${encryptedString.length} caracteres (${expansionRatio.toFixed(1)}x)`)
      }
    }
    
    return encryptedString
  } catch (error: any) {
    console.error('Erro ao criptografar:', error.message)
    throw new Error('Erro ao criptografar dados')
  }
}

/**
 * Descriptografa um valor usando AES-256-GCM.
 * 
 * Espera string no formato: iv:salt:tag:encryptedData (tudo em base64)
 * 
 * @param encryptedText - Texto criptografado em formato base64
 * @returns Texto descriptografado ou null se inválido
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) {
    return null
  }

  /**
   * Compatibilidade: dados antigos podem estar em texto plano (sem formato iv:salt:tag:data).
   */
  if (!encryptedText.includes(':')) {
    return encryptedText
  }

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 4) {
      console.error('Formato de dados criptografados inválido')
      return null
    }

    const [ivBase64, saltBase64, tagBase64, encrypted] = parts
    
    const key = getEncryptionKey()
    const iv = Buffer.from(ivBase64, 'base64')
    const salt = Buffer.from(saltBase64, 'base64')
    const tag = Buffer.from(tagBase64, 'base64')
    const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error: any) {
    console.error('Erro ao descriptografar:', error.message)
    /**
     * Retorna null em vez de lançar erro para não quebrar a aplicação
     * com dados corrompidos ou inválidos.
     */
    return null
  }
}

/**
 * Criptografa múltiplos campos de um objeto.
 * 
 * @param data - Objeto com dados a serem criptografados
 * @param fields - Array de nomes de campos a criptografar
 * @param maxLengths - Objeto opcional com limites máximos por campo
 * @returns Objeto com campos criptografados
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[],
  maxLengths?: Partial<Record<keyof T, number>>
): T {
  const encrypted = { ...data }
  
  for (const field of fields) {
    if (encrypted[field] !== null && encrypted[field] !== undefined) {
      const maxLength = maxLengths?.[field]
      const value = String(encrypted[field])
      const valueToEncrypt = maxLength ? value.substring(0, maxLength) : value
      encrypted[field] = encrypt(valueToEncrypt, maxLength) as any
    }
  }
  
  return encrypted
}

/**
 * Descriptografa múltiplos campos de um objeto.
 * 
 * @param data - Objeto com dados criptografados
 * @param fields - Array de nomes de campos a descriptografar
 * @returns Objeto com campos descriptografados
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const decrypted = { ...data }
  
  for (const field of fields) {
    if (decrypted[field] !== null && decrypted[field] !== undefined) {
      decrypted[field] = decrypt(String(decrypted[field])) as any
    }
  }
  
  return decrypted
}

/**
 * Cria hash determinístico de um valor (para busca sem descriptografar).
 * 
 * Útil para campos como email que precisam ser pesquisáveis mas também protegidos.
 * 
 * @param text - Texto a ser hasheado
 * @returns Hash SHA-256 em hex
 */
export function createSearchableHash(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex')
}

/**
 * Verifica se um hash corresponde a um texto.
 * 
 * @param text - Texto original
 * @param hash - Hash a verificar
 * @returns true se corresponder
 */
export function verifySearchableHash(text: string, hash: string): boolean {
  const textHash = createSearchableHash(text)
  return crypto.timingSafeEqual(Buffer.from(textHash), Buffer.from(hash))
}

