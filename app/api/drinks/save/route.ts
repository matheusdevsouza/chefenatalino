import { NextRequest, NextResponse } from 'next/server'
import { createDrinkCalculation } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { bebidasInputSchema } from '@/lib/security/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || null

    const validated = bebidasInputSchema.parse({
      pessoas_bebem: body.pessoas_bebem,
      pessoas_nao_bebem: body.pessoas_nao_bebem,
      duracao: body.duracao,
    })

    const calculation = await createDrinkCalculation({
      user_id: userId,
      pessoas_bebem: validated.pessoas_bebem,
      pessoas_nao_bebem: validated.pessoas_nao_bebem,
      duracao_horas: validated.duracao,
      nivel_consumo: body.nivel || 'moderado',
      resultado: body.resultado,
    })

    const response = NextResponse.json({ 
      success: true, 
      id: calculation.id 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao salvar cálculo de bebidas:', error)
    const response = NextResponse.json(
      { error: error.message || 'Erro ao salvar cálculo' },
      { status: 400 }
    )
    return setAPIHeaders(response)
  }
}



