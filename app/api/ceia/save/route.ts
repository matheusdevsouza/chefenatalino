import { NextRequest, NextResponse } from 'next/server'
import { createCeiaPlan } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { ceiaInputSchema } from '@/lib/security/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || null

    const validated = ceiaInputSchema.parse({
      adultos: body.adultos,
      criancas: body.criancas,
      orcamento: body.orcamento,
      horario: body.horario,
      restricoes: body.restricoes || '',
    })

    const ceiaPlan = await createCeiaPlan({
      user_id: userId,
      title: body.title || null,
      adultos: validated.adultos,
      criancas: validated.criancas,
      orcamento: validated.orcamento,
      horario: validated.horario,
      restricoes: validated.restricoes || null,
      cardapio: body.cardapio,
      lista_compras: body.listaCompras || null,
      cronograma: body.cronograma || null,
      is_premium: body.listaCompras && body.cronograma ? true : false,
    })

    const response = NextResponse.json({ 
      success: true, 
      id: ceiaPlan.id,
      shared_token: ceiaPlan.shared_token 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao salvar ceia:', error)
    const response = NextResponse.json(
      { error: error.message || 'Erro ao salvar ceia' },
      { status: 400 }
    )
    return setAPIHeaders(response)
  }
}



