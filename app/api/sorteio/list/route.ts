import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { withAuthorization } from '@/lib/security/authorization'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 })

    return withAuthorization(
      req,
      async (user) => {
        const res = await query(`SELECT * FROM secret_santa_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [user.id])
        const events = res.rows

        for (const ev of events) {
          const p = await query(`SELECT name, email FROM secret_santa_participants WHERE event_id = $1`, [ev.id])
          ev.participants = p.rows
        }

        return NextResponse.json({ success: true, events })
      },
      { requireOwnershipOf: userId, requireSubscription: true }
    )
  } catch (err: any) {
    console.error('sorteio.list error', err)
    return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
  }
}
