import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'

/**
 * Sistema avançado de autenticação de dois fatores (2FA) usando TOTP.
 * 
 * Implementa padrão RFC 6238 (TOTP) com suporte a:
 * - Google Authenticator
 * - Authy
 * - Microsoft Authenticator
 * - Qualquer app compatível com TOTP
 * 
 * Inclui geração de backup codes, validação segura e proteção contra ataques.
 */

export interface TOTPSecret {
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
}

export interface BackupCode {
  code: string
  hashed: string
}

/**
 * Gera um secret TOTP seguro para um usuário.
 * 
 * Cria um secret base32 de 32 caracteres, compatível com todos os
 * aplicativos de autenticação padrão. O secret é único por usuário.
 */
export function generateTOTPSecret(userEmail: string, serviceName: string = 'Nome do Projeto'): string {
  return speakeasy.generateSecret({
    name: `${serviceName} (${userEmail})`,
    length: 32,
  }).base32
}

/**
 * Gera URL otpauth para configuração em apps de autenticação.
 * 
 * Formato: otpauth://totp/ServiceName:email?secret=SECRET&issuer=ServiceName
 * Compatível com Google Authenticator, Authy, Microsoft Authenticator, etc.
 */
export function generateOTPAuthURL(
  secret: string,
  userEmail: string,
  serviceName: string = 'Nome do Projeto'
): string {
  return speakeasy.otpauthURL({
    secret,
    label: userEmail,
    issuer: serviceName,
    encoding: 'base32',
  })
}

/**
 * Gera QR Code em formato Data URL para exibição.
 * 
 * Retorna imagem PNG codificada em base64 que pode ser exibida
 * diretamente em uma tag <img> ou componente React.
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataUrl
  } catch (error: any) {
    throw new Error(`Erro ao gerar QR Code: ${error.message}`)
  }
}

/**
 * Gera secret completo com QR Code para configuração inicial.
 * 
 * Retorna objeto com secret, URL otpauth e QR Code pronto para uso.
 */
export async function generateTOTPSetup(
  userEmail: string,
  serviceName: string = 'Nome do Projeto'
): Promise<TOTPSecret> {
  const secret = generateTOTPSecret(userEmail, serviceName)
  const otpauthUrl = generateOTPAuthURL(secret, userEmail, serviceName)
  const qrCodeDataUrl = await generateQRCode(otpauthUrl)

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
  }
}

/**
 * Verifica se um código TOTP é válido.
 * 
 * Valida código de 6 dígitos contra o secret, considerando janela de tempo
 * para compensar diferenças de relógio entre servidor e dispositivo.
 * 
 * @param secret - Secret TOTP do usuário (base32)
 * @param token - Código de 6 dígitos fornecido pelo usuário
 * @param window - Janela de tempo em steps (padrão: 1 = ±30 segundos)
 * @returns true se válido, false caso contrário
 */
export function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false
  }

  try {
    return speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
      window,
      time: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    return false
  }
}

/**
 * Gera códigos de backup seguros para recuperação de conta.
 * 
 * Cria 10 códigos únicos de 8 caracteres cada, com hash SHA-256
 * para armazenamento seguro no banco de dados.
 * 
 * @returns Array de objetos com código original e hash
 */
export function generateBackupCodes(count: number = 10): BackupCode[] {
  const codes: BackupCode[] = []

  for (let i = 0; i < count; i++) {
    /**
     * crypto.randomBytes garante aleatoriedade criptográfica.
     */
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    
    /**
     * Apenas hash é armazenado - código original nunca fica no banco.
     */
    const hashed = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex')

    codes.push({
      code,
      hashed,
    })
  }

  return codes
}

/**
 * Verifica código de backup usando comparação segura contra timing attacks.
 */
export function verifyBackupCode(code: string, storedHashes: string[]): boolean {
  if (!code || code.length !== 8 || !/^[A-Z0-9]{8}$/.test(code.toUpperCase())) {
    return false
  }

  const codeHash = crypto
    .createHash('sha256')
    .update(code.toUpperCase())
    .digest('hex')

  /**
   * Comparação segura contra timing attacks.
   * 
   * Usa crypto.timingSafeEqual para prevenir timing attacks
   * que poderiam revelar qual hash corresponde ao código.
   */
  for (const storedHash of storedHashes) {
    if (crypto.timingSafeEqual(
      Buffer.from(codeHash),
      Buffer.from(storedHash)
    )) {
      return true
    }
  }

  return false
}

/**
 * Valida formato de código TOTP antes de verificação.
 * 
 * Verifica se o código tem formato válido (6 dígitos numéricos).
 */
export function isValidTOTPFormat(token: string): boolean {
  return /^\d{6}$/.test(token) && token.length === 6
}

/**
 * Valida formato de código de backup antes de verificação.
 * 
 * Verifica se o código tem formato válido (8 caracteres alfanuméricos).
 */
export function isValidBackupCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{8}$/i.test(code) && code.length === 8
}

/**
 * Gera código TOTP atual para um secret (útil para testes).
 * 
 * ATENÇÃO: Use apenas para desenvolvimento/testes. Nunca exponha isso em produção.
 */
export function getCurrentTOTP(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  })
}

/**
 * Verifica se um secret TOTP tem formato válido.
 */
export function isValidSecretFormat(secret: string): boolean {
  if (!secret || secret.length < 16) {
    return false
  }
  
  /**
   * Base32 deve conter apenas A-Z, 2-7.
   * 
   * Valida formato base32 padrão usado por TOTP.
   */
  return /^[A-Z2-7]+$/.test(secret.toUpperCase())
}

