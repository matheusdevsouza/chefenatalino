import { NextRequest, NextResponse } from 'next/server'
import { createMagicMessage } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { mensagensInputSchema } from '@/lib/security/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || null

    const validated = mensagensInputSchema.parse({
      destinatario: body.destinatario,
      tom: body.tom,
    })

    const message = await createMagicMessage({
      user_id: userId,
      destinatario: validated.destinatario,
      tom: validated.tom,
      mensagens: body.mensagens || [],
      mensagem_selecionada: body.mensagem_selecionada || null,
    })

    const response = NextResponse.json({ 
      success: true, 
      id: message.id 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao salvar mensagem:', error)
    const response = NextResponse.json(
      { error: error.message || 'Erro ao salvar mensagem' },
      { status: 400 }
    )
    return setAPIHeaders(response)
  }
}



