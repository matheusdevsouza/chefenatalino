import { NextRequest, NextResponse } from 'next/server'
import { markMagicMessageAsCopied } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      const response = NextResponse.json(
        { error: 'ID inválido', success: false },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    await markMagicMessageAsCopied(id)

    const response = NextResponse.json({ success: true })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao marcar mensagem como copiada:', error)
    const response = NextResponse.json(
      { error: 'Erro ao atualizar mensagem' },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}



