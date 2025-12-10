import Redis from 'ioredis'
import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'
import type { RateLimiter } from './rateLimiter'

/**
 * Configuração avançada do Redis para rate limiting distribuído.
 * 
 * Suporta múltiplas configurações incluindo clusters, sentinel,
 * e conexões simples. Implementa fallback automático para memória
 * quando Redis não está disponível.
 */

interface RedisConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  enableReadyCheck?: boolean
  maxRetriesPerRequest?: number | null
  retryStrategy?: (times: number) => number | null
  reconnectOnError?: (err: Error) => boolean
  lazyConnect?: boolean
  connectTimeout?: number
  commandTimeout?: number
  keepAlive?: number
  family?: 4 | 6
  // Cluster support
  cluster?: boolean
  clusterNodes?: Array<{ host: string; port: number }>
  // Sentinel support
  sentinels?: Array<{ host: string; port: number }>
  name?: string
}

let redisClient: Redis | null = null
let redisAvailable = false
let fallbackToMemory = false

/**
 * Cria ou retorna instância do cliente Redis.
 * 
 * Implementa singleton pattern e gerencia reconexão automática.
 * Fallback para memória se Redis não estiver disponível.
 */
export function getRedisClient(): Redis | null {
  if (redisClient && redisAvailable) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10)
  const redisPassword = process.env.REDIS_PASSWORD
  const redisDb = parseInt(process.env.REDIS_DB || '0', 10)

  // Se não há configuração Redis, usar fallback para memória
  if (!redisUrl && !redisHost && process.env.NODE_ENV !== 'production') {
    console.warn('[RATE LIMITER] Redis não configurado, usando fallback para memória')
    fallbackToMemory = true
    return null
  }

  try {
    const config: RedisConfig = {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 30000,
      family: 4,
    }

    if (redisUrl) {
      // Usar URL de conexão (suporta Redis Cloud, Upstash, etc.)
      redisClient = new Redis(redisUrl, {
        ...config,
        lazyConnect: true,
      })
    } else {
      // Configuração manual
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        db: redisDb,
        ...config,
        lazyConnect: true,
      })
    }

    // Event handlers
    redisClient.on('connect', () => {
      console.log('[REDIS] Conectado com sucesso')
      redisAvailable = true
      fallbackToMemory = false
    })

    redisClient.on('ready', () => {
      console.log('[REDIS] Pronto para receber comandos')
      redisAvailable = true
      fallbackToMemory = false
    })

    redisClient.on('error', (err: Error) => {
      console.error('[REDIS] Erro:', err.message)
      redisAvailable = false
      fallbackToMemory = true
    })

    redisClient.on('close', () => {
      console.warn('[REDIS] Conexão fechada')
      redisAvailable = false
      fallbackToMemory = true
    })

    redisClient.on('reconnecting', (delay: number) => {
      console.log(`[REDIS] Reconectando em ${delay}ms...`)
    })

    // Conectar
    redisClient.connect().catch((err) => {
      console.error('[REDIS] Erro ao conectar:', err.message)
      redisAvailable = false
      fallbackToMemory = true
    })

    return redisClient
  } catch (error: any) {
    console.error('[REDIS] Erro ao criar cliente:', error.message)
    redisAvailable = false
    fallbackToMemory = true
    return null
  }
}

/**
 * Verifica se Redis está disponível e funcionando.
 * 
 * Executa comando PING para validar conectividade e latência.
 */
export async function checkRedisHealth(): Promise<{
  available: boolean
  latency?: number
  error?: string
}> {
  const client = getRedisClient()
  
  if (!client || !redisAvailable) {
    return { available: false, error: 'Redis não disponível' }
  }

  try {
    const start = Date.now()
    await client.ping()
    const latency = Date.now() - start

    return {
      available: true,
      latency,
    }
  } catch (error: any) {
    return {
      available: false,
      error: error.message,
    }
  }
}

/**
 * Fecha conexão Redis de forma segura.
 * 
 * Útil para shutdown graceful da aplicação.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    redisAvailable = false
  }
}

/**
 * Retorna status atual do Redis.
 */
export function getRedisStatus(): {
  available: boolean
  fallbackToMemory: boolean
  client: Redis | null
} {
  return {
    available: redisAvailable,
    fallbackToMemory,
    client: redisClient,
  }
}

/**
 * Cria um rate limiter usando Redis ou fallback para memória.
 * 
 * Automaticamente detecta disponibilidade do Redis e usa o melhor
 * método disponível. Em produção, sempre tenta usar Redis primeiro.
 */
export function createRateLimiter(config: {
  keyPrefix: string
  points: number
  duration: number
  blockDuration?: number
  execEvenly?: boolean
  execEvenlyMinDelayMs?: number
}): RateLimiter {
  const client = getRedisClient()

  // Se Redis está disponível e configurado, usar Redis
  if (client && redisAvailable && !fallbackToMemory) {
    try {
      return new RateLimiterRedis({
        storeClient: client,
        keyPrefix: config.keyPrefix,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration || config.duration,
        execEvenly: config.execEvenly || false,
        execEvenlyMinDelayMs: config.execEvenlyMinDelayMs,
        // Configurações avançadas
        insuranceLimiter: new RateLimiterMemory({
          points: config.points,
          duration: config.duration,
        }),
      })
    } catch (error: any) {
      console.warn('[RATE LIMITER] Erro ao criar limiter Redis, usando memória:', error.message)
      fallbackToMemory = true
    }
  }

  // Fallback para memória
  return new RateLimiterMemory({
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration || config.duration,
    execEvenly: config.execEvenly || false,
    execEvenlyMinDelayMs: config.execEvenlyMinDelayMs,
  })
}

