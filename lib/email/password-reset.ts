import { query } from '@/lib/db'
import crypto from 'crypto'
import { sendEmail } from './smtp'

/**
 * Sistema de envio de emails de recuperação de senha.
 * 
 * Usa SMTP configurado via variáveis de ambiente.
 */

/**
 * Gera um token de recuperação de senha e envia email.
 */
export async function sendPasswordResetEmail(userId: string, email: string, name: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Token válido por 1 hora

  // Invalidar tokens anteriores não utilizados
  await query(
    'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  )

  // Inserir novo token
  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetLink = `${appUrl}/redefinir-senha?token=${token}`

  const subject = 'Redefinir sua senha - Nome do Projeto'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinir Senha</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Nome do Projeto</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Olá, ${name}!</h2>
        
        <p style="color: #4b5563; font-size: 16px;">
          Recebemos uma solicitação para redefinir a senha da sua conta no Nome do Projeto. 
          Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; 
                    border-radius: 6px; font-weight: bold; font-size: 16px;">
            Redefinir Senha
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Ou copie e cole este link no seu navegador:
        </p>
        <p style="color: #9ca3af; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
          ${resetLink}
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          <strong>Importante:</strong> Este link expira em 1 hora. Se você não solicitou a redefinição de senha, 
          pode ignorar este email com segurança. Sua senha não será alterada.
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
    
    Recebemos uma solicitação para redefinir a senha da sua conta no Nome do Projeto. 
    Se você fez esta solicitação, acesse o link abaixo para criar uma nova senha:
    
    ${resetLink}
    
    Este link expira em 1 hora. Se você não solicitou a redefinição de senha, 
    pode ignorar este email com segurança. Sua senha não será alterada.
    
    © ${new Date().getFullYear()} Nome do Projeto. Todos os direitos reservados.
  `

  try {
    await sendEmail(email, subject, html, text)
    return token
  } catch (error: any) {
    // Em desenvolvimento, logar o link mesmo se SMTP falhar
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PASSWORD RESET] (SMTP falhou, logando link)`)
      console.log(`Link para ${email}:`)
      console.log(resetLink)
    }
    throw error
  }
}

