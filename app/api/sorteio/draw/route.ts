import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { participants = [] } = body

    if (!Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ success: false, message: 'Precisa de pelo menos 2 participantes' }, { status: 400 })
    }

    // Simple draw: keep shuffling until no one is assigned to themselves
    const names = participants.map((p: any) => p.name)
    let receivers = [...names]
    let attempts = 0
    do {
      receivers = shuffle([...names])
      attempts++
      if (attempts > 1000) break
    } while (receivers.some((r, i) => r === names[i]))

    const assignments: Record<string, string> = {}
    for (let i = 0; i < names.length; i++) {
      assignments[names[i]] = receivers[i]
    }

    return NextResponse.json({ success: true, assignments })
  } catch (err: any) {
    console.error('sorteio.draw error', err)
    return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
  }
}
