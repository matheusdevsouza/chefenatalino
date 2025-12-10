import nodemailer from 'nodemailer'

/**
 * Configuração do transporter SMTP usando variáveis de ambiente.
 * 
 * Variáveis necessárias:
 * - SMTP_HOST: Host do servidor SMTP (ex: smtp.hostinger.com)
 * - SMTP_PORT: Porta SMTP (ex: 465 para SSL, 587 para TLS)
 * - SMTP_SECURE: 'true' para SSL (porta 465), 'false' para TLS (porta 587)
 * - SMTP_USER: Email de autenticação SMTP
 * - SMTP_PASSWORD: Senha do email SMTP
 * - EMAIL_FROM: Email remetente (pode ser o mesmo que SMTP_USER)
 * - EMAIL_FROM_NAME: Nome do remetente
 */
function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  if (!host || !user || !password) {
    console.warn('[SMTP] Variáveis de ambiente não configuradas. Emails não serão enviados.')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure, // true para porta 465, false para outras portas
    auth: {
      user,
      pass: password,
    },
    // Configurações adicionais para melhor compatibilidade
    tls: {
      rejectUnauthorized: false, // Aceita certificados auto-assinados (útil para desenvolvimento)
    },
  })
}

/**
 * Envia um email usando SMTP.
 * 
 * @param to Email do destinatário
 * @param subject Assunto do email
 * @param html Conteúdo HTML do email
 * @param text Versão texto do email (opcional)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  const transporter = createTransporter()

  if (!transporter) {
    // Em desenvolvimento, apenas logar
    if (process.env.NODE_ENV === 'development') {
      console.log('[EMAIL] (SMTP não configurado)')
      console.log(`Para: ${to}`)
      console.log(`Assunto: ${subject}`)
      console.log(`Conteúdo: ${text || html.substring(0, 100)}...`)
    }
    throw new Error('SMTP não configurado. Configure as variáveis de ambiente SMTP_*')
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER
  const fromName = process.env.EMAIL_FROM_NAME || 'Nome do Projeto'

  if (!fromEmail) {
    throw new Error('EMAIL_FROM não configurado')
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Remove tags HTML se text não fornecido
    })

    console.log('[EMAIL] Enviado com sucesso:', {
      messageId: info.messageId,
      to,
      subject,
    })
  } catch (error: any) {
    console.error('[EMAIL] Erro ao enviar:', error)
    throw new Error(`Erro ao enviar email: ${error.message}`)
  }
}

/**
 * Verifica a conexão SMTP.
 * Útil para testar configurações.
 */
export async function verifySMTPConnection(): Promise<boolean> {
  const transporter = createTransporter()

  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    console.log('[SMTP] Conexão verificada com sucesso')
    return true
  } catch (error: any) {
    console.error('[SMTP] Erro na verificação:', error)
    return false
  }
}

