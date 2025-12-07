import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || crypto.randomUUID()
    
    try {
      await query(
        'INSERT INTO users (id, email, name, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING RETURNING id',
        [userId, `guest_${userId}@temp.com`, 'Usuário Temporário', '', true]
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

