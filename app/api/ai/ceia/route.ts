import { NextRequest, NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

/**
 * - Prompt feito para ser rápido
 * - Prompts muito longos causam timeout na API Gemini (somente na gratuita, aparentemente. Na paga funciona normalmente)
 * - Este prompt é direto, estruturado e evita detalhes desnecessários
 */

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { guests = 6, budget = 200, dietary = 'Nenhuma' } = body

        // Prompt para a IA
        const prompt = `Crie 3 menus distintos para ceia com ${guests} pessoas e orçamento de R$ ${budget}.
Restrições alimentares: ${dietary || 'Nenhuma'}.
Responda APENAS com JSON válido.`

        const resp = await fetch(`${BASE_URL}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })

        if (!resp.ok) {
          throw new Error('Erro ao consultar IA')
        }

        const data = await resp.json()
        const text = data.text || ''

        try {
          const parsed = JSON.parse(text)
          return NextResponse.json({ success: true, menus: parsed.menus || parsed })
        } catch (e) {
          
          // Fallback: retornar menus genéricos se parse falhar
          const menus = [1,2,3].map(i => ({ 
            id: `m_${i}`, 
            description: `Opção ${i} para ${guests} convidados`, 
            items: [`Prato ${i}`,'Acompanhamento','Sobremesa'], 
            estimated_price_total: budget 
          }))
          return NextResponse.json({ success: true, menus })
        }
      } catch (err: any) {
        console.error('ai.ceia error', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
