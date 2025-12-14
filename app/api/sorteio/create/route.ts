import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { withAuthorization } from '@/lib/security/authorization'

export async function POST(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const body = await req.json()
        const { name = 'Amigo Secreto', participants = [] } = body

        if (!Array.isArray(participants) || participants.length < 2) {
          return NextResponse.json({ success: false, message: 'Pelo menos 2 participantes' }, { status: 400 })
        }

        // Create event owned by authenticated user
        const res = await query('INSERT INTO secret_santa_events (user_id, name) VALUES ($1, $2) RETURNING *', [user.id, name])
        const event = res.rows[0]

        for (const p of participants) {
          await query('INSERT INTO secret_santa_participants (event_id, name, email) VALUES ($1, $2, $3)', [event.id, p.name, p.email || null])
        }

        return NextResponse.json({ success: true, event })
      } catch (err: any) {
        console.error('sorteio.create error', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
