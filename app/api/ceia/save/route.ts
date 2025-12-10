import { NextRequest, NextResponse } from 'next/server'
import { createCeiaPlan } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'
import { ceiaInputSchema } from '@/lib/security/validation'
import { withAuthorization } from '@/lib/security/authorization'

export async function POST(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const body = await request.json()
        const userId = user.id

    // Validação rigorosa de todos os campos
    const validated = ceiaInputSchema.parse({
      adultos: body.adultos,
      criancas: body.criancas,
      orcamento: body.orcamento,
      horario: body.horario,
      restricoes: body.restricoes || '',
      title: body.title || null,
    })

    // Validar e sanitizar JSON fields (cardapio, lista_compras, cronograma)
    // Esses campos são JSON, mas ainda precisam ser validados para prevenir NoSQL injection
    const sanitizeJSON = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return null
      // Validar que é um objeto válido e não contém funções ou código
      const jsonString = JSON.stringify(obj)
      if (jsonString.length > 100000) throw new Error('Dados muito grandes')
      if (/function|eval|exec|script/i.test(jsonString)) throw new Error('Dados contêm código malicioso')
      return obj
    }

    const ceiaPlan = await createCeiaPlan({
      user_id: userId,
      title: validated.title || null,
      adultos: validated.adultos,
      criancas: validated.criancas,
      orcamento: validated.orcamento,
      horario: validated.horario,
      restricoes: validated.restricoes || null,
      cardapio: sanitizeJSON(body.cardapio),
      lista_compras: sanitizeJSON(body.listaCompras) || null,
      cronograma: sanitizeJSON(body.cronograma) || null,
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
  )
}



