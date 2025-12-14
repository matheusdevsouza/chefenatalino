import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuthorization } from '@/lib/security/authorization'
import { query } from '@/lib/db'
import { getCeiaPlansByUserId, getDrinkCalculationsByUserId, getMagicMessagesByUserId } from '@/lib/db/queries'

export async function GET(req: NextRequest) {
  return withAuthorization(
    req,
    async (user) => {
      try {
        const userId = user.id

        // Counts
        const ceiaCountRes = await query('SELECT COUNT(*)::int AS cnt FROM ceia_plans WHERE user_id = $1 AND deleted_at IS NULL', [userId])
        const drinksCountRes = await query('SELECT COUNT(*)::int AS cnt FROM drink_calculations WHERE user_id = $1 AND deleted_at IS NULL', [userId])
        const messagesCountRes = await query('SELECT COUNT(*)::int AS cnt FROM magic_messages WHERE user_id = $1 AND deleted_at IS NULL', [userId])
        const sorteiosCountRes = await query('SELECT COUNT(*)::int AS cnt FROM secret_santa_events WHERE user_id = $1 AND deleted_at IS NULL', [userId])

        // Recent items (mix of types) — normalize to simple activity objects
        const recentCeias = await query('SELECT id, title, cardapio, created_at FROM ceia_plans WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [userId])
        const recentDrinks = await query('SELECT id, resultado, created_at FROM drink_calculations WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [userId])
        const recentMessages = await query('SELECT id, destinatario, mensagens, created_at FROM magic_messages WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [userId])
        const recentSorteios = await query('SELECT id, name, created_at FROM secret_santa_events WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [userId])

        const recentActivity: any[] = []

        recentCeias.rows.forEach((r: any) => recentActivity.push({ type: 'ceia', id: r.id, title: r.title || 'Ceia', description: r.cardapio ? 'Ceia gerada' : 'Ceia', time: r.created_at }))
        recentDrinks.rows.forEach((r: any) => recentActivity.push({ type: 'drinks', id: r.id, title: 'Cálculo de bebidas', description: r.resultado ? 'Cálculo salvo' : 'Cálculo', time: r.created_at }))
        recentMessages.rows.forEach((r: any) => recentActivity.push({ type: 'message', id: r.id, title: `Mensagem para ${r.destinatario}`, description: r.mensagens && r.mensagens.length ? r.mensagens[0] : 'Mensagem', time: r.created_at }))
        recentSorteios.rows.forEach((r: any) => recentActivity.push({ type: 'sorteio', id: r.id, title: r.name || 'Sorteio', description: 'Evento criado', time: r.created_at }))

        // Sort recentActivity by time desc and limit
        recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

        // Upcoming dates: try to extract from ceia_plans.cronograma if exists
        const upcoming: any[] = []
        const ceiaWithCron = await query('SELECT id, title, cronograma FROM ceia_plans WHERE user_id = $1 AND cronograma IS NOT NULL AND deleted_at IS NULL', [userId])
        for (const row of ceiaWithCron.rows) {
          try {
            const cron = row.cronograma
            if (Array.isArray(cron)) {
              // find items with a date-like field
              cron.forEach((c: any) => {
                if (c.date || c.datetime) {
                  upcoming.push({ id: row.id, title: row.title || 'Ceia', date: c.date || c.datetime, note: c.activity || '' })
                }
              })
            }
          } catch (e) {
            // ignore parse errors
          }
        }

        // If no upcoming from cronograma, fallback to ceia created_at (not ideal but better than mock)
        if (upcoming.length === 0) {
          const ceias = await query('SELECT id, title, created_at FROM ceia_plans WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 3', [userId])
          ceias.rows.forEach((r: any) => upcoming.push({ id: r.id, title: r.title || 'Ceia', date: r.created_at, note: '' }))
        }

        const response = NextResponse.json({
          success: true,
          stats: {
            ceias: ceiaCountRes.rows[0].cnt || 0,
            bebidas: drinksCountRes.rows[0].cnt || 0,
            mensagens: messagesCountRes.rows[0].cnt || 0,
            sorteios: sorteiosCountRes.rows[0].cnt || 0,
          },
          recentActivity: recentActivity.slice(0, 5),
          upcoming,
        })

        return response
      } catch (err: any) {
        console.error('dashboard.overview error', err)
        return NextResponse.json({ success: false, message: err.message || 'Erro' }, { status: 500 })
      }
    },
    { requireSubscription: true }
  )
}
