import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  apiRateLimiter, 
  getClientIdentifier, 
  checkRateLimit,
  checkMultipleRateLimits,
  generalRateLimiter 
} from '@/lib/security/rateLimiter'
import { getAuthenticatedUser } from '@/lib/security/auth'
import { geminiPromptSchema } from '@/lib/security/validation'
import { sanitizePrompt, validatePromptStructure } from '@/lib/security/promptSanitizer'
import { setAPIHeaders } from '@/lib/security/headers'
import { securityLogger } from '@/lib/security/logger'
import { validatePayloadSize } from '@/lib/security/validation'

const apiKey = process.env.GEMINI_API_KEY || ''

const REQUEST_TIMEOUT = 30000

/**
 * Endpoint POST para processamento de prompts através da API do Google Gemini.
 * 
 * Recebe requisições com prompts, aplica validações de segurança rigorosas,
 * sanitiza o conteúdo para prevenir ataques de prompt injection, e retorna
 * o texto gerado pela inteligência artificial. Implementa rate limiting,
 * validação de payload, timeouts e logging de segurança.
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const endpoint = '/api/gemini'

  // Obter IP do cliente
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   request.ip ||
                   'unknown'

  // Obter usuário autenticado se disponível
  const user = await getAuthenticatedUser(request)
  const identifier = getClientIdentifier(request, user?.userId)

  // Verificar múltiplos rate limits: geral + específico da API
  const multiLimitCheck = await checkMultipleRateLimits([
    { limiter: generalRateLimiter, identifier },
    { limiter: apiRateLimiter, identifier },
  ])

  const rateLimitCheck = multiLimitCheck.firstBlocked || {
    allowed: true,
    remaining: Math.min(
      ...multiLimitCheck.results.map(r => r.remaining)
    ),
    resetTime: Math.max(
      ...multiLimitCheck.results.map(r => r.resetTime)
    ),
  }
  
  if (!rateLimitCheck.allowed) {
    securityLogger.log({
      type: 'rate_limit',
      ip: clientIp,
      endpoint,
      details: 'Rate limit excedido',
      userAgent,
    })

    const response = NextResponse.json(
      { 
        error: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(rateLimitCheck.resetTime / 1000),
      },
      { status: 429 }
    )
    
    response.headers.set('Retry-After', Math.ceil(rateLimitCheck.resetTime / 1000).toString())
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimitCheck.resetTime).toISOString())
    
    return setAPIHeaders(response)
  }

  if (request.method !== 'POST') {
    securityLogger.log({
      type: 'unauthorized',
      ip: clientIp,
      endpoint,
      details: `Método ${request.method} não permitido`,
      userAgent,
    })

    const response = NextResponse.json(
      { error: 'Método não permitido' },
      { status: 405 }
    )
    return setAPIHeaders(response)
  }

  const contentType = request.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    securityLogger.log({
      type: 'invalid_input',
      ip: clientIp,
      endpoint,
      details: 'Content-Type inválido',
      userAgent,
    })

    const response = NextResponse.json(
      { error: 'Content-Type deve ser application/json' },
      { status: 400 }
    )
    return setAPIHeaders(response)
  }

  if (!apiKey) {
    securityLogger.log({
      type: 'api_error',
      ip: clientIp,
      endpoint,
      details: 'API Key não configurada',
      userAgent,
    })

    const response = NextResponse.json(
      { error: 'Serviço temporariamente indisponível' },
      { status: 503 }
    )
    return setAPIHeaders(response)
  }

  try {
    const body = await request.json()
    
    if (!validatePayloadSize(body, 10000)) {
      securityLogger.log({
        type: 'invalid_input',
        ip: clientIp,
        endpoint,
        details: 'Payload muito grande',
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Payload muito grande' },
        { status: 413 }
      )
      return setAPIHeaders(response)
    }

    const validationResult = geminiPromptSchema.safeParse(body)
    
    if (!validationResult.success) {
      securityLogger.log({
        type: 'invalid_input',
        ip: clientIp,
        endpoint,
        details: `Validação falhou: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        userAgent,
      })

      const response = NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const { prompt } = validationResult.data

    const sanitizationResult = sanitizePrompt(prompt)
    
    if (sanitizationResult.blocked) {
      securityLogger.log({
        type: 'suspicious_activity',
        ip: clientIp,
        endpoint,
        details: `Prompt injection detectado: ${sanitizationResult.warnings.join(', ')}`,
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Conteúdo não permitido detectado' },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    if (!validatePromptStructure(sanitizationResult.sanitized)) {
      securityLogger.log({
        type: 'invalid_input',
        ip: clientIp,
        endpoint,
        details: 'Estrutura do prompt inválida',
        userAgent,
      })

      const response = NextResponse.json(
        { error: 'Prompt inválido' },
        { status: 400 }
      )
      return setAPIHeaders(response)
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), REQUEST_TIMEOUT)
    })

    const geminiPromise = (async () => {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent(sanitizationResult.sanitized)
      const response = await result.response
      return response.text()
    })()

    const text = await Promise.race([geminiPromise, timeoutPromise]) as string

    const sanitizedText = text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')

    const response = NextResponse.json({ text: sanitizedText })
    
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', rateLimitCheck.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimitCheck.resetTime).toISOString())
    
    const duration = Date.now() - startTime
    if (duration > 5000) {
      securityLogger.log({
        type: 'api_error',
        ip: clientIp,
        endpoint,
        details: `Requisição lenta: ${duration}ms`,
        userAgent,
      })
    }

    return setAPIHeaders(response)
  } catch (error: any) {
    const duration = Date.now() - startTime
    
    securityLogger.log({
      type: 'api_error',
      ip: clientIp,
      endpoint,
      details: `Erro: ${error.message || 'Erro desconhecido'} (${duration}ms)`,
      userAgent,
    })

    const errorMessage = error.message === 'Timeout' 
      ? 'Tempo de requisição excedido'
      : 'Erro ao processar requisição'

    const response = NextResponse.json(
      { error: errorMessage },
      { status: error.message === 'Timeout' ? 504 : 500 }
    )
    
    return setAPIHeaders(response)
  }
}

/**
 * Endpoint GET bloqueado para este recurso.
 * 
 * Retorna erro 405 (Method Not Allowed) pois este endpoint aceita
 * apenas requisições POST.
 */

export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}

