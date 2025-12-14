import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { guests = 10, hours = 4, type = 'Misto' } = body

        // Simple industry heuristic:
        const pessoas = Number(guests)
        const duracao = Number(hours)

        const baseSodaPerPerson = 0.6 // litros
        const baseBeerPerPerson = 0.4 // litros
        const soda = Number((pessoas * baseSodaPerPerson).toFixed(2))
        const beer = Number((pessoas * baseBeerPerPerson).toFixed(2))
        const wine = Number(((pessoas * 0.25) * (duracao / 4)).toFixed(2))

        const result = {
          refrigerante_litros: soda,
          cerveja_litros: beer,
          vinho_litros: wine,
          garrafas_2l_refrigerante: Math.ceil(soda / 2),
          latas_cerveja_350ml: Math.ceil((beer * 1000) / 350),
          garrafas_vinho_750ml: Math.ceil((wine * 1000) / 750),
        }

        try { globalThis.console?.info?.('drinks.calculate', { userId: user.id }) } catch (e) {}

        return NextResponse.json({ success: true, result })
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
