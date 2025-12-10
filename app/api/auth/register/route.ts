import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserByEmail } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { encrypt, createSearchableHash } from '@/lib/security/encryption'
import { registerSchema, validateInput } from '@/lib/security/inputValidator'
import { sendVerificationEmail } from '@/lib/email/verification'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    /**
     * Validação Zod com detecção de SQL injection e sanitização.
     */
    let validatedData
    try {
      validatedData = validateInput(registerSchema, body)
    } catch (validationError: any) {
      const response = NextResponse.json(
        { error: validationError.message || 'Dados inválidos', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const { name, email, password, phone } = validatedData

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      const response = NextResponse.json(
        { error: 'Este email já está cadastrado', success: false },
        { status: 409 }
      )
      return setAPIHeaders(response)
    }
    
    const passwordHashResult = await query(
      'SELECT crypt($1, gen_salt(\'bf\')) as password_hash',
      [password]
    )

    const password_hash = passwordHashResult.rows[0]?.password_hash

    if (!password_hash) {
      const response = NextResponse.json(
        { error: 'Erro ao processar senha', success: false },
        { status: 500 }
      )
      return setAPIHeaders(response)
    }

    /**
     * Tamanhos máximos: name (500), email (320), phone (20).
     */
    const encryptedName = encrypt(name, 500)
    const encryptedEmail = encrypt(email, 320) 
    const encryptedPhone = phone ? encrypt(phone.substring(0, 20), 20) : null 
    const emailHash = createSearchableHash(email)
    
    const result = await query(
      `INSERT INTO users (name, email, email_hash, phone, password_hash, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, avatar_url, email_verified, created_at`,
      [
        encryptedName,
        encryptedEmail,
        emailHash,
        encryptedPhone,
        password_hash,
        true
      ]
    )

    const user = result.rows[0]

    if (!user) {
      const response = NextResponse.json(
        { error: 'Erro ao criar conta', success: false },
        { status: 500 }
      )
      return setAPIHeaders(response)
    }

    /**
     * Não falha o registro se email falhar - usuário pode solicitar reenvio depois.
     */
    try {
      await sendVerificationEmail(user.id, email, name)
    } catch (emailError) {
      console.error('Erro ao enviar email de verificação:', emailError)
    }

    /**
     * Não criar tokens JWT - usuário precisa verificar email primeiro.
     * Previne criação de contas com emails inválidos.
     */
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: name, 
        email: email, 
        avatar_url: null,
        email_verified: false 
      },
      message: 'Conta criada com sucesso! Verifique seu email para ativar sua conta.',
      requiresEmailVerification: true
    })

    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    
    if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.code === '23505') {
      const response = NextResponse.json(
        { error: 'Este email já está cadastrado', success: false },
        { status: 409 }
      )
      return setAPIHeaders(response)
    }

    const response = NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

