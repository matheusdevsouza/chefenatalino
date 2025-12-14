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

        // Create optimized prompt for AI to generate menu with real price research
        const budgetText = budget 
          ? `ORÇAMENTO MÁXIMO TOTAL: R$ ${budget.toFixed(2)}. 
IMPORTANTE: Você DEVE pesquisar mentalmente os preços reais de cada ingrediente necessário no mercado brasileiro atual e montar receitas cujo custo total de TODOS os ingredientes somados seja EXATAMENTE ATÉ R$ ${budget.toFixed(2)}. 
Se o orçamento for muito baixo para ${guests} pessoas, sugira receitas simples e econômicas que caibam no valor. 
Se o orçamento for alto, você pode usar ingredientes mais sofisticados, mas SEMPRE respeitando o limite de R$ ${budget.toFixed(2)}.`
          : 'Sem limite de orçamento específico.'

        const prompt = `Você é um chef especialista em planejamento de ceias de Natal no Brasil. Sua tarefa é criar um menu completo e realista.

CONTEXTO:
- Número de convidados: ${guests} pessoas
${preferences ? `- Preferências culinárias: ${preferences}` : '- Preferências: padrão'}
${dietaryRestrictions ? `- Restrições dietéticas: ${dietaryRestrictions}` : '- Restrições: nenhuma'}
${budgetText}

INSTRUÇÕES CRÍTICAS:
1. Para CADA receita, você DEVE pesquisar mentalmente os preços reais dos ingredientes no mercado brasileiro (supermercados, açougues, etc.)
2. Some o custo de TODOS os ingredientes necessários para todas as receitas
3. O valor total DEVE ser EXATAMENTE ATÉ R$ ${budget ? budget.toFixed(2) : 'ilimitado'} (não pode ultrapassar!)
4. Se o orçamento for muito apertado (ex: R$ 50 para 10 pessoas), sugira receitas simples e econômicas que realmente caibam no valor
5. Considere quantidades necessárias para ${guests} pessoas em cada receita

ESTRUTURA DO MENU (uma opção de cada):
1. Aperitivo
2. Entrada
3. Prato Principal
4. Acompanhamento
5. Sobremesa
6. Bebida Recomendada

Para cada item, forneça:
- Nome do prato
- Lista completa de ingredientes com quantidades para ${guests} pessoas
- Preço estimado de cada ingrediente (pesquise preços reais)
- Custo total do item
- Modo de preparo breve (2-3 linhas)

No final, inclua uma seção "RESUMO FINANCEIRO" com:
- Custo total de cada item
- Custo total geral
- Confirmação de que está dentro do orçamento

IMPORTANTE: O custo total DEVE ser exatamente até R$ ${budget ? budget.toFixed(2) : 'ilimitado'}. Se necessário, ajuste as receitas para respeitar este limite.

No final da resposta, inclua UMA LINHA com o formato exato:
ESTIMATED_TOTAL: R$<valor total calculado>`

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
