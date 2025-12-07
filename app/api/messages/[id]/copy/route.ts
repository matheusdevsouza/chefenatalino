import { NextRequest, NextResponse } from 'next/server'
import { markMagicMessageAsCopied } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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



