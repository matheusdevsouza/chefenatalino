import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { recipient = 'Amigo', tone = 'Caloroso', occasion = 'Natal', context = '', userId } = body

    const templates = {
      Caloroso: `Querido ${recipient},\nQue seu ${occasion} seja cheio de amor e alegria. Saudades e um abraço caloroso!`,
      Formal: `Prezado(a) ${recipient},\nDesejo um ${occasion} repleto de paz e realizações. Atenciosamente.`,
      Engraçado: `Ei ${recipient}! \nSe o Papai Noel trouxer problemas, me chama — eu divido o panetone. Feliz ${occasion}!`,
      Curto: `Feliz ${occasion}, ${recipient}!`,
    }

    const text = templates[tone as keyof typeof templates] || templates['Caloroso']

    try { globalThis.console?.info?.('messages.generate', { userId }) } catch (e) {}

    return NextResponse.json({ success: true, text })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
  }
}
