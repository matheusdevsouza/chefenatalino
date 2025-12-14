import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'

/**
 * Retorna métricas de uso de IA do usuário
 * Inclui: chamadas mensais, tokens, custos estimados
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        // Buscar métricas do usuário
        const metricsResult = await query(
          `
          SELECT 
            id,
            calls_month,
            calls_remaining,
            tokens_used_month,
            estimated_cost_month,
            last_reset_at,
            updated_at
          FROM user_ai_metrics
          WHERE user_id = $1
          `,
          [user.id]
        )

        let metrics = metricsResult.rows[0]

        // Se não existem métricas, criar defaults
        if (!metrics) {
          const defaultMetrics = {
            calls_month: 0,
            calls_remaining: 1000,
            tokens_used_month: 0,
            estimated_cost_month: 0,
            last_reset_at: new Date(),
            updated_at: new Date(),
          }

          metrics = {
            id: 'N/A',
            ...defaultMetrics,
          }
        }

        // Buscar logs recentes de uso (últimos 7 dias)
        const logsResult = await query(
          `
          SELECT 
            module,
            feature,
            total_tokens,
            estimated_cost,
            status,
            created_at
          FROM ai_usage_logs
          WHERE user_id = $1 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
          ORDER BY created_at DESC
          LIMIT 50
          `,
          [user.id]
        )

        const recentLogs = logsResult.rows.map((log: any) => ({
          module: log.module,
          feature: log.feature,
          tokens: log.total_tokens,
          cost: parseFloat(log.estimated_cost || '0'),
          status: log.status,
          created_at: log.created_at,
        }))

        // Calcular estatísticas por módulo
        const moduleStatsResult = await query(
          `
          SELECT 
            module,
            COUNT(*) as count,
            SUM(total_tokens) as total_tokens,
            SUM(estimated_cost) as total_cost
          FROM ai_usage_logs
          WHERE user_id = $1 
            AND created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
          GROUP BY module
          ORDER BY COUNT(*) DESC
          `,
          [user.id]
        )

        const moduleStats = moduleStatsResult.rows.map((stat: any) => ({
          module: stat.module,
          calls: parseInt(stat.count),
          tokens: parseInt(stat.total_tokens || '0'),
          cost: parseFloat(stat.total_cost || '0'),
        }))

        const response = NextResponse.json({
          success: true,
          metrics: {
            calls_month: metrics.calls_month,
            calls_remaining: metrics.calls_remaining,
            tokens_used_month: metrics.tokens_used_month,
            estimated_cost_month: parseFloat(metrics.estimated_cost_month || '0'),
            last_reset_at: metrics.last_reset_at,
            updated_at: metrics.updated_at,
          },
          recentLogs,
          moduleStats,
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar uso de IA:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar uso de IA', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}
