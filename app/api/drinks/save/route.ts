import { NextRequest, NextResponse } from 'next/server'
import { createDrinkCalculation } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { bebidasInputSchema } from '@/lib/security/validation'
import { withAuthorization } from '@/lib/security/authorization'

export async function POST(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const body = await request.json()
        const userId = user.id

    // Validação rigorosa de todos os campos
    const validated = bebidasInputSchema.parse({
      pessoas_bebem: body.pessoas_bebem,
      pessoas_nao_bebem: body.pessoas_nao_bebem,
      duracao: body.duracao,
      nivel: body.nivel || 'moderado',
    })

    // Validar e sanitizar resultado (JSON)
    const sanitizeJSON = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return null
      const jsonString = JSON.stringify(obj)
      if (jsonString.length > 50000) throw new Error('Resultado muito grande')
      if (/function|eval|exec|script/i.test(jsonString)) throw new Error('Resultado contém código malicioso')
      return obj
    }

    const calculation = await createDrinkCalculation({
      user_id: userId,
      pessoas_bebem: validated.pessoas_bebem,
      pessoas_nao_bebem: validated.pessoas_nao_bebem,
      duracao_horas: validated.duracao,
      nivel_consumo: validated.nivel,
      resultado: sanitizeJSON(body.resultado),
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
  )
}



