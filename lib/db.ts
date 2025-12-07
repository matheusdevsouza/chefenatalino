import { Pool, QueryResult } from 'pg'

let pool: Pool | null = null

/**
 * Cria ou retorna o pool de conexões com o banco de dados.
 * 
 * Em produção usa menos conexões para não sobrecarregar o banco,
 * importante especialmente em serviços gratuitos como Vercel.
 */

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente')
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: process.env.NODE_ENV === 'production' ? 5 : 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on('error', (err) => {
      console.error('Erro inesperado no pool do PostgreSQL:', err)
    })
  }

  return pool
}

/**
 * Executa uma query SQL no banco de dados.
 * 
 * Em desenvolvimento, mostra no console quanto tempo a query levou.
 * Ajuda a identificar queries lentas.
 */

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const db = getPool()
  const start = Date.now()
  try {
    const result = await db.query<T>(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executada', { text, duration, rows: result.rowCount })
    }
    return result
  } catch (error) {
    console.error('Erro na query:', { text, error })
    throw error
  }
}

/**
 * Obtém uma conexão direta do pool.
 * 
 * Útil para múltiplas operações na mesma transação ou quando
 * precisa de mais controle sobre a conexão.
 */

export async function getClient() {
  const db = getPool()
  return db.connect()
}

/**
 * Fecha todas as conexões do pool.
 * 
 * Normalmente não precisa usar, mas é útil em testes ou quando
 * a aplicação está sendo encerrada.
 */

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}



