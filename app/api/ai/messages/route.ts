import { NextRequest, NextResponse } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { recipient = 'Amigo', tone = 'Caloroso', occasion = 'Natal', context = '' } = body

        const prompt = `Você é um assistente que escreve mensagens calorosas e personalizadas. Gere 3 variações curtas para uma mensagem endereçada a ${recipient} para a ocasião ${occasion} com tom ${tone}. Contexto adicional: ${context}. Responda SOMENTE com um array JSON de 3 strings.`

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
          return NextResponse.json({ success: true, messages: parsed })
        } catch (e) {
          // fallback simple templates
          const msgs = [
            `Feliz ${occasion}, ${recipient}! Que seu dia seja repleto de carinho e alegria.`,
            `Querido ${recipient}, desejando a você um ${occasion} cheio de amor e boas memórias.`,
            `Boas festas, ${recipient}! Espero que seu ${occasion} seja inesquecível.`,
          ]
          return NextResponse.json({ success: true, messages: msgs })
        }
      } catch (err: any) {
        console.error('ai.messages error', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
