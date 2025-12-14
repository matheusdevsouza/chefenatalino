import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'
import { generateWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { guests = 6, preferences = '', dietaryRestrictions = '', budget = null } = body

        // Create optimized prompt for AI to generate menu (simpler to reduce token usage)
        // Include budget if provided and ask the model to provide a brief estimated total
        const prompt = `Crie um menu conciso de Ceia de Natal para ${guests} convidados.
      ${preferences ? `Preferências: ${preferences}` : 'Preferências: padrão'}
      ${dietaryRestrictions ? `Restrições: ${dietaryRestrictions}` : 'Sem restrições específicas'}
      ${budget ? `Orçamento aproximado por pessoa/total: R$${budget}` : ''}

      Retorne APENAS estes itens (uma opção de cada):
      1. Aperitivo
      2. Entrada
      3. Prato Principal
      4. Acompanhamento
      5. Sobremesa
      6. Bebida Recomendada

      Para cada item, inclua: nome, ingredientes principais (1 linha) e modo de preparo breve (2-3 linhas).

      No final da resposta, inclua UMA LINHA com o formato exato:
      ESTIMATED_TOTAL: R$<valor aproximado>
      Isso nos permite extrair uma estimativa de custo.`

        const menuText = await generateWithGemini(prompt)

        if (!menuText) {
          return NextResponse.json({ success: false, message: 'Erro ao gerar menu com IA' }, { status: 500 })
        }

        // Minimal logging including server-side user id
        try {
          globalThis.console?.info?.('AI log: ceia.generate', { userId: user.id })
        } catch (err) {}

        // Try to extract the ESTIMATED_TOTAL line from the model output
        let estimated_total: number | null = null
        try {
          const m = menuText.match(/ESTIMATED_TOTAL:\s*R?\$?([0-9.,]+)/i)
          if (m && m[1]) {
            // Normalize number: accept formats like 1.234,56 or 1234.56
            const raw = m[1]
            const normalized = raw.replace(/\./g, '').replace(/,/g, '.')
            const n = Number(normalized)
            if (!Number.isNaN(n)) estimated_total = n
          }
        } catch (err) {
          // ignore parse errors
        }

        // Remove the ESTIMATED_TOTAL line from the menu displayed to users
        const cleanedMenu = menuText.replace(/\n?ESTIMATED_TOTAL:\s*R?\$?[0-9.,]+\s*$/i, '').trim()

        return NextResponse.json({ success: true, menu: cleanedMenu, estimated_total })
      } catch (err: any) {
        console.error('Erro ao gerar ceia:', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro ao gerar menu' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
