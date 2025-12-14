import { NextRequest, NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { guests = 10, hours = 4, type = 'Misto' } = body

        const prompt = `Você é um especialista em eventos. Calcule e retorne em JSON estruturado as quantidades recomendadas de bebidas para ${guests} convidados em ${hours} horas. Responda apenas JSON com campos: refrigerante_litros, cerveja_litros, vinho_litros, garrafas_2l_refrigerante, latas_cerveja_350ml, garrafas_vinho_750ml.`

        const resp = await fetch(`${BASE_URL}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })

        if (!resp.ok) throw new Error('Erro ao consultar IA')

        const data = await resp.json()
        const text = data.text || ''

        try {
          const parsed = JSON.parse(text)
          return NextResponse.json({ success: true, result: parsed })
        } catch (e) {
          // fallback local heuristic
          const pessoas = Number(guests)
          const duracao = Number(hours)
          const soda = Number((pessoas * 0.6).toFixed(2))
          const beer = Number((pessoas * 0.4).toFixed(2))
          const wine = Number(((pessoas * 0.25) * (duracao / 4)).toFixed(2))
          const result = {
            refrigerante_litros: soda,
            cerveja_litros: beer,
            vinho_litros: wine,
            garrafas_2l_refrigerante: Math.ceil(soda / 2),
            latas_cerveja_350ml: Math.ceil((beer * 1000) / 350),
            garrafas_vinho_750ml: Math.ceil((wine * 1000) / 750),
          }
          return NextResponse.json({ success: true, result })
        }
      } catch (err: any) {
        console.error('ai.drinks error', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
