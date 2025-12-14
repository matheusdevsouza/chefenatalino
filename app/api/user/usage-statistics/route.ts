import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Retorna estatísticas de uso dos módulos
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        // Ceia statistics
        const ceiaResult = await query(
          `SELECT COUNT(*) as total, MAX(created_at) as lastUsed 
           FROM ceia_plans 
           WHERE user_id = $1`,
          [user.id]
        )
        const ceiaData = ceiaResult.rows[0]

        // Drinks statistics
        const drinksResult = await query(
          `SELECT COUNT(*) as total, MAX(created_at) as lastUsed 
           FROM drink_calculations 
           WHERE user_id = $1`,
          [user.id]
        )
        const drinksData = drinksResult.rows[0]

        // Messages statistics
        const messagesResult = await query(
          `SELECT COUNT(*) as total, MAX(created_at) as lastUsed 
           FROM magic_messages 
           WHERE user_id = $1`,
          [user.id]
        )
        const messagesData = messagesResult.rows[0]

        // Secret Santa statistics
        const sorteioResult = await query(
          `SELECT COUNT(*) as total, MAX(created_at) as lastUsed 
           FROM secret_santa_events 
           WHERE user_id = $1`,
          [user.id]
        )
        const sorteioData = sorteioResult.rows[0]

        const response = NextResponse.json({
          success: true,
          ceia: {
            total: parseInt(ceiaData.total) || 0,
            lastUsed: ceiaData.lastUsed,
          },
          drinks: {
            total: parseInt(drinksData.total) || 0,
            lastUsed: drinksData.lastUsed,
          },
          messages: {
            total: parseInt(messagesData.total) || 0,
            lastUsed: messagesData.lastUsed,
          },
          sorteio: {
            total: parseInt(sorteioData.total) || 0,
            lastUsed: sorteioData.lastUsed,
          },
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas de uso:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar estatísticas', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}
