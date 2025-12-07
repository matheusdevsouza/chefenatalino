import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedTestimonials } from '@/lib/db/queries'
import { setAPIHeaders } from '@/lib/security/headers'

/**
 * API Route para buscar depoimentos/testimonials
 * 
 * Retorna lista de testimonials em destaque do banco de dados
 */

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 10
    
    const testimonials = await getFeaturedTestimonials(limit)
    
    const response = NextResponse.json({ 
      success: true, 
      testimonials 
    })
    return setAPIHeaders(response)
  } catch (error: any) {
    console.error('Erro ao buscar testimonials:', error)
    const response = NextResponse.json(
      { error: 'Erro ao buscar testimonials', success: false },
      { status: 500 }
    )
    return setAPIHeaders(response)
  }
}

