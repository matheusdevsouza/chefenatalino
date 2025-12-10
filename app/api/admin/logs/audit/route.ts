import { NextRequest, NextResponse } from 'next/server'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAdminAuth } from '@/lib/security/admin'
import { getAuditLogs, getAuditLogStats, exportAuditLogsToCSV, type LogFilters } from '@/lib/db/queries-audit'

/**
 * Endpoint administrativo para buscar logs de auditoria.
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

        // Filtros
        const filters: LogFilters = {}
        
        if (searchParams.get('tableName')) {
          filters.tableName = searchParams.get('tableName')!
        }
        
        if (searchParams.get('action')) {
          filters.action = searchParams.get('action') as 'INSERT' | 'UPDATE' | 'DELETE'
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

        // Paginação
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '50', 10)

        // Exportação
        if (searchParams.get('export') === 'csv') {
          const csv = await exportAuditLogsToCSV(filters)
          
          const response = new NextResponse(csv, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`,
            },
          })
          
          return setAPIHeaders(response)
        }

        // Estatísticas
        if (searchParams.get('stats') === 'true') {
          const stats = await getAuditLogStats(filters.startDate, filters.endDate)
          
          const response = NextResponse.json({
            success: true,
            stats,
          })
          
          return setAPIHeaders(response)
        }

        // Buscar logs
        const result = await getAuditLogs(filters, { page, limit })

        const response = NextResponse.json({
          success: true,
          ...result,
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar logs de auditoria:', error)
        const response = NextResponse.json(
          {
            success: false,
            error: 'Erro ao buscar logs de auditoria',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    }
  )
}

