import { NextRequest, NextResponse } from 'next/server'
import { createMagicMessage } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { mensagensInputSchema } from '@/lib/security/validation'
import { withAuthorization } from '@/lib/security/authorization'

export async function POST(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const body = await request.json()
        const userId = user.id

    const validated = mensagensInputSchema.parse({
      destinatario: body.destinatario,
      tom: body.tom,
      mensagens: body.mensagens || [],
      mensagem_selecionada: body.mensagem_selecionada || null,
    })

    const message = await createMagicMessage({
      user_id: userId,
      destinatario: validated.destinatario,
      tom: validated.tom,
      mensagens: validated.mensagens || [],
      mensagem_selecionada: validated.mensagem_selecionada || null,
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
    ,
    { requireSubscription: true }
  )
}



