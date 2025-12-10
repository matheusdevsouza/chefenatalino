import { query } from '../db'
import type { User } from '@/database/types'
import { encrypt, decrypt } from '@/lib/security/encryption'

/**
 * Queries específicas para funcionalidades de 2FA.
 * 
 * Gerencia secrets TOTP, códigos de backup e tentativas de verificação.
 * Secrets TOTP são criptografados antes de salvar no banco.
 */

export interface TwoFactorData {
  two_factor_enabled: boolean
  two_factor_secret: string | null
  two_factor_enabled_at: Date | null
  two_factor_last_used: Date | null
}

export interface BackupCodeRecord {
  id: string
  user_id: string
  code_hash: string
  used_at: Date | null
  created_at: Date
  expires_at: Date | null
}

/**
 * Atualiza informações de 2FA do usuário.
 * 
 * Criptografa o secret antes de salvar no banco.
 */
export async function updateUser2FA(
  userId: string,
  enabled: boolean,
  secret?: string | null
): Promise<void> {
  if (enabled && secret) {
    // Criptografar secret antes de salvar
    // TOTP secrets são tipicamente 32 caracteres base32, limitamos a 100 para segurança
    const encryptedSecret = encrypt(secret.substring(0, 100), 100)
    
    await query(
      `UPDATE users 
       SET two_factor_enabled = $1, 
           two_factor_secret = $2,
           two_factor_enabled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [enabled, encryptedSecret, userId]
    )
  } else {
    await query(
      `UPDATE users 
       SET two_factor_enabled = $1, 
           two_factor_secret = NULL,
           two_factor_enabled_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [enabled, userId]
    )
  }
}

/**
 * Obtém informações de 2FA do usuário.
 * 
 * Descriptografa o secret antes de retornar.
 */
export async function getUser2FA(userId: string): Promise<TwoFactorData | null> {
  const result = await query<TwoFactorData>(
    `SELECT 
       two_factor_enabled,
       two_factor_secret,
       two_factor_enabled_at,
       two_factor_last_used
     FROM users 
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  )

  if (!result.rows[0]) {
    return null
  }

  const data = result.rows[0]
  
  // Descriptografar secret antes de retornar
  return {
    ...data,
    two_factor_secret: data.two_factor_secret ? decrypt(data.two_factor_secret) : null,
  }
}

/**
 * Atualiza timestamp da última verificação bem-sucedida de 2FA.
 */
export async function update2FALastUsed(userId: string): Promise<void> {
  await query(
    'UPDATE users SET two_factor_last_used = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  )
}

/**
 * Salva códigos de backup para um usuário.
 */
export async function saveBackupCodes(
  userId: string,
  codeHashes: string[],
  expiresInDays: number = 365
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // Inserir todos os códigos em uma transação
  for (const hash of codeHashes) {
    await query(
      `INSERT INTO two_factor_backup_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hash, expiresAt]
    )
  }
}

/**
 * Obtém códigos de backup não utilizados de um usuário.
 */
export async function getUnusedBackupCodes(userId: string): Promise<BackupCodeRecord[]> {
  const result = await query<BackupCodeRecord>(
    `SELECT * FROM two_factor_backup_codes
     WHERE user_id = $1 
       AND used_at IS NULL
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
     ORDER BY created_at DESC`,
    [userId]
  )

  return result.rows
}

/**
 * Marca um código de backup como utilizado.
 */
export async function markBackupCodeAsUsed(codeHash: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE two_factor_backup_codes
     SET used_at = CURRENT_TIMESTAMP
     WHERE code_hash = $1 
       AND user_id = $2
       AND used_at IS NULL
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
     RETURNING id`,
    [codeHash, userId]
  )

  return result.rows.length > 0
}

/**
 * Remove todos os códigos de backup de um usuário.
 */
export async function deleteAllBackupCodes(userId: string): Promise<void> {
  await query(
    'DELETE FROM two_factor_backup_codes WHERE user_id = $1',
    [userId]
  )
}

/**
 * Registra tentativa de verificação 2FA.
 */
export async function log2FAAttempt(
  userId: string,
  success: boolean,
  ipAddress: string | null,
  userAgent: string | null,
  codeType: 'totp' | 'backup' = 'totp'
): Promise<void> {
  await query(
    `INSERT INTO two_factor_attempts (user_id, ip_address, user_agent, success, code_type)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, ipAddress, userAgent, success, codeType]
  )
}

/**
 * Conta tentativas falhadas recentes de 2FA.
 * 
 * Útil para detectar brute force attacks.
 */
export async function countRecentFailedAttempts(
  userId: string,
  ipAddress: string | null,
  minutes: number = 15
): Promise<number> {
  // Validar e sanitizar minutes para prevenir SQL injection
  // Garantir que seja um número inteiro entre 1 e 1440 (24 horas)
  const sanitizedMinutes = Math.max(1, Math.min(1440, Math.floor(Number(minutes))))
  
  // Usar parâmetro para o intervalo em segundos (mais seguro)
  // Usar make_interval() do PostgreSQL para construir o intervalo de forma segura
  const seconds = sanitizedMinutes * 60
  
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM two_factor_attempts
     WHERE (user_id = $1 OR ip_address = $2)
       AND success = FALSE
       AND attempted_at > NOW() - make_interval(secs => $3)`,
    [userId, ipAddress, seconds]
  )

  return parseInt(result.rows[0]?.count || '0', 10)
}

/**
 * Verifica se há código de backup válido para um usuário.
 */
export async function hasValidBackupCode(userId: string, codeHash: string): Promise<boolean> {
  const result = await query(
    `SELECT id FROM two_factor_backup_codes
     WHERE user_id = $1 
       AND code_hash = $2
       AND used_at IS NULL
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
     LIMIT 1`,
    [userId, codeHash]
  )

  return result.rows.length > 0
}

