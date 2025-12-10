import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'
import { encrypt, createSearchableHash } from '@/lib/security/encryption'

/**
 * Cria usuário temporário/guest. Usa ON CONFLICT DO NOTHING para evitar duplicação.
 * NOTA: Dados criptografados são ~8-10x maiores.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || crypto.randomUUID()
    
    /**
     * Tamanhos máximos: email (320), name (500).
     */
    const email = `guest_${userId}@temp.com`
    const name = 'Usuário Temporário'
    const encryptedEmail = encrypt(email, 320)
    const encryptedName = encrypt(name, 500) 
    const emailHash = createSearchableHash(email)
    
    try {
      await query(
        'INSERT INTO users (id, email, email_hash, name, password_hash, is_active) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING RETURNING id',
        [userId, encryptedEmail, emailHash, encryptedName, '', true]
      )
    } catch (dbError: any) {
      if (!dbError.message.includes('duplicate') && !dbError.message.includes('unique')) {
        throw dbError
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      userId 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    const response = NextResponse.json(
      { error: 'Erro ao criar usuário', userId: crypto.randomUUID() },
      { status: 200 }
    )
    return setAPIHeaders(response)
  }
}

