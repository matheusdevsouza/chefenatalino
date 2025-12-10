import { query } from '@/lib/db'
import crypto from 'crypto'
import { decrypt } from '@/lib/security/encryption'
import { sendEmail } from './smtp'

/**
 * Sistema de envio de emails de verificação.
 * 
 * Usa SMTP configurado via variáveis de ambiente.
 */

/**
 * Gera um token de verificação de email para um usuário.
 */
export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  /**
   * Invalidar tokens anteriores não utilizados.
   * 
   * Previne uso de tokens antigos e mantém apenas o token mais recente válido.
   */
  await query(
    'UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  )

  /**
   * Inserir novo token de verificação.
   */
  await query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  )

  return token
}

/**
 * Envia email de verificação para o usuário.
 * 
 * Usa SMTP configurado via variáveis de ambiente.
 */
export async function sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
  const token = await generateEmailVerificationToken(userId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationLink = `${appUrl}/verificar-email?token=${token}`

  const subject = 'Verifique seu email - Nome do Projeto'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificação de Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Nome do Projeto</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Olá, ${name}!</h2>
        
        <p style="color: #4b5563; font-size: 16px;">
          Obrigado por se cadastrar no Nome do Projeto! Para completar seu cadastro e começar a usar nossa plataforma, 
          por favor, verifique seu endereço de email clicando no botão abaixo:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; 
                    border-radius: 6px; font-weight: bold; font-size: 16px;">
            Verificar Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Ou copie e cole este link no seu navegador:
        </p>
        <p style="color: #9ca3af; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
          ${verificationLink}
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Este link expira em 24 horas. Se você não criou uma conta, pode ignorar este email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Nome do Projeto. Todos os direitos reservados.
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
    Olá, ${name}!
    
    Obrigado por se cadastrar no Nome do Projeto! Para completar seu cadastro, verifique seu email acessando o link abaixo:
    
    ${verificationLink}
    
    Este link expira em 24 horas. Se você não criou uma conta, pode ignorar este email.
    
    © ${new Date().getFullYear()} Nome do Projeto. Todos os direitos reservados.
  `

  try {
    await sendEmail(email, subject, html, text)
  } catch (error: any) {
    /**
     * Em desenvolvimento: loga link para facilitar testes sem SMTP.
     */
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL VERIFICATION] (SMTP falhou, logando link)`)
      console.log(`Link para ${email}:`)
      console.log(verificationLink)
    }
    throw error
  }
}

/**
 * Verifica token e marca email como verificado.
 * 
 * Se token já usado mas email já verificado, retorna sucesso (permite múltiplos cliques no link).
 */
export async function verifyEmailToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const result = await query<{ user_id: string; expires_at: Date; used_at: Date | null }>(
    `SELECT user_id, expires_at, used_at 
     FROM email_verification_tokens 
     WHERE token = $1`,
    [token]
  )

  if (result.rows.length === 0) {
    return { valid: false, error: 'Token inválido' }
  }

  const tokenData = result.rows[0]

  /**
   * Verifica email antes do token para permitir múltiplos cliques no link sem erro.
   */
  const userResult = await query<{ email_verified: boolean }>(
    'SELECT email_verified FROM users WHERE id = $1',
    [tokenData.user_id]
  )

  if (userResult.rows.length > 0 && userResult.rows[0].email_verified) {
    return { valid: true, userId: tokenData.user_id }
  }

  if (tokenData.used_at) {
    return { valid: false, error: 'Token já foi utilizado' }
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    return { valid: false, error: 'Token expirado' }
  }

  /**
   * Transação garante atomicidade: token usado + email verificado na mesma operação.
   * Previne race conditions.
   */
  const { getClient } = await import('@/lib/db')
  const client = await getClient()
  
  try {
    await client.query('BEGIN')
    
    /**
     * Marcar token como usado (com verificação para evitar race conditions).
     * 
     * Usa WHERE used_at IS NULL para garantir que apenas uma requisição
     * possa marcar o token como usado.
     */
    const tokenUpdate = await client.query(
      'UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1 AND used_at IS NULL RETURNING user_id',
      [token]
    )

    if (tokenUpdate.rowCount === 0) {
      /**
       * Token já foi usado por outra requisição simultânea.
       * 
       * Verificar novamente se email está verificado para retornar sucesso
       * se já foi verificado pela outra requisição.
       */
      const recheckUser = await client.query<{ email_verified: boolean }>(
        'SELECT email_verified FROM users WHERE id = $1',
        [tokenData.user_id]
      )
      
      if (recheckUser.rows.length > 0 && recheckUser.rows[0].email_verified) {
        await client.query('COMMIT')
        return { valid: true, userId: tokenData.user_id }
      }
      
      await client.query('ROLLBACK')
      return { valid: false, error: 'Token já foi utilizado' }
    }

    await client.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           email_verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND email_verified = FALSE`,
      [tokenData.user_id]
    )

    await client.query('COMMIT')
    return { valid: true, userId: tokenData.user_id }
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Erro ao verificar token:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Reenvia email de verificação para um usuário.
 * 
 * Pode ser chamado com userId ou email.
 */
export async function resendVerificationEmail(userIdOrEmailHash: string, byEmail: boolean = false): Promise<void> {
  let userId: string
  let email: string
  let name: string
  let emailVerified: boolean

  if (byEmail) {
    /**
     * Busca por hash previne timing attacks e mantém privacidade.
     */
    const userResult = await query<{ id: string; email: string; name: string; email_verified: boolean }>(
      `SELECT id, email, name, email_verified 
       FROM users 
       WHERE email_hash = $1 AND deleted_at IS NULL`,
      [userIdOrEmailHash]
    )

    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado')
    }

    const user = userResult.rows[0]
    userId = user.id
    
    /**
     * Compatibilidade: dados antigos podem não estar criptografados.
     */
    try {
      email = decrypt(user.email) || user.email
    } catch {
      email = user.email
    }
    
    try {
      name = decrypt(user.name) || user.name
    } catch {
      name = user.name || 'Usuário'
    }
    
    emailVerified = user.email_verified
  } else {
    const userResult = await query<{ email: string; name: string; email_verified: boolean }>(
      'SELECT email, name, email_verified FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userIdOrEmailHash]
    )

    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado')
    }

    const user = userResult.rows[0]
    userId = userIdOrEmailHash
    
    /**
     * Compatibilidade: dados antigos podem não estar criptografados.
     */
    try {
      email = decrypt(user.email) || user.email
    } catch {
      email = user.email
    }
    
    try {
      name = decrypt(user.name) || user.name
    } catch {
      name = user.name || 'Usuário'
    }
    
    emailVerified = user.email_verified
  }

  if (!email || !email.includes('@')) {
    throw new Error('Email inválido ou não encontrado')
  }

  if (!name || name.trim().length === 0) {
    name = 'Usuário'
  }

  if (emailVerified) {
    throw new Error('Email já está verificado')
  }

  await sendVerificationEmail(userId, email, name)
}

