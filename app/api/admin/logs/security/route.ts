import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAdminAuth } from '@/lib/security/admin'
import { getSecurityLogs, getSecurityLogStats, exportSecurityLogsToCSV, type LogFilters } from '@/lib/db/queries-audit'

/**
 * Endpoint administrativo para buscar logs de segurança.
 * 
 * Suporta filtros avançados, paginação e exportação.
 * Apenas administradores têm acesso.
 */

export async function GET(request: NextRequest) {
  return withAdminAuth(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url)

        /**
         * Construir filtros a partir dos query parameters.
         * 
         * Suporta filtros por: eventType, severity, userId, ipAddress,
         * startDate, endDate, e busca textual (search).
         */
        const filters: LogFilters = {}
        
        if (searchParams.get('eventType')) {
          filters.eventType = searchParams.get('eventType')!
        }
        
        if (searchParams.get('severity')) {
          filters.severity = searchParams.get('severity') as 'info' | 'warning' | 'error' | 'critical'
        }
        
        if (searchParams.get('userId')) {
          filters.userId = searchParams.get('userId')!
        }
        
        if (searchParams.get('ipAddress')) {
          filters.ipAddress = searchParams.get('ipAddress')!
        }
        
        if (searchParams.get('startDate')) {
          filters.startDate = new Date(searchParams.get('startDate')!)
        }
        
        if (searchParams.get('endDate')) {
          filters.endDate = new Date(searchParams.get('endDate')!)
        }
        
        if (searchParams.get('search')) {
          filters.search = searchParams.get('search')!
        }

        /**
         * Configurar paginação.
         * 
         * Padrão: página 1, limite de 50 registros por página.
         */
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '50', 10)

        /**
         * Exportação para CSV.
         * 
         * Se export=csv, retorna arquivo CSV com logs filtrados.
         */
        if (searchParams.get('export') === 'csv') {
          const csv = await exportSecurityLogsToCSV(filters)
          
          const response = new NextResponse(csv, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="security-logs-${Date.now()}.csv"`,
            },
          })
          
          return setAPIHeaders(response)
        }

        /**
         * Estatísticas de logs.
         * 
         * Se stats=true, retorna estatísticas agregadas dos logs
         * no período especificado pelos filtros.
         */
        if (searchParams.get('stats') === 'true') {
          const stats = await getSecurityLogStats(filters.startDate, filters.endDate)
          
          const response = NextResponse.json({
            success: true,
            stats,
          })
          
          return setAPIHeaders(response)
        }

        /**
         * Buscar logs com filtros e paginação aplicados.
         */
        const result = await getSecurityLogs(filters, { page, limit })

        const response = NextResponse.json({
          success: true,
          ...result,
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar logs de segurança:', error)
        const response = NextResponse.json(
          {
            success: false,
            error: 'Erro ao buscar logs de segurança',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

