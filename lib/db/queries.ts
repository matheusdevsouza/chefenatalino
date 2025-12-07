import { query } from '../db'
import type { Subscription, User, CeiaPlan, DrinkCalculation, MagicMessage, SubscriptionPlan, Testimonial } from '@/database/types'

/**
 * Busca um usuário pelo ID.
 * 
 * Ignora usuários deletados (soft delete).
 */

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  )
  return result.rows[0] || null
}

/**
 * Busca um usuário pelo email.
 * 
 * Usado para login e verificação de email já cadastrado.
 */

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  )
  return result.rows[0] || null
}

/**
 * Busca a assinatura ativa de um usuário.
 * 
 * Retorna apenas assinaturas com status 'active' que ainda não
 * expiraram. Se tiver mais de uma, pega a mais recente.
 */

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const result = await query<Subscription>(
    `SELECT s.* FROM subscriptions s
     WHERE s.user_id = $1 
       AND s.status = 'active'
       AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId)
  return subscription !== null
}

/**
 * Salva um novo planejamento de ceia no banco.
 * 
 * Converte os objetos JSON (cardápio, lista de compras, cronograma)
 * para string antes de salvar, já que o PostgreSQL armazena como JSONB.
 */

export async function createCeiaPlan(data: {
  user_id?: string | null
  title?: string | null
  adultos: number
  criancas: number
  orcamento: number
  horario: string
  restricoes?: string | null
  cardapio: any
  lista_compras?: any
  cronograma?: any
  is_premium: boolean
}): Promise<CeiaPlan> {
  const result = await query<CeiaPlan>(
    `INSERT INTO ceia_plans (
      user_id, title, adultos, criancas, orcamento, horario, 
      restricoes, cardapio, lista_compras, cronograma, is_premium
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      data.user_id || null,
      data.title || null,
      data.adultos,
      data.criancas,
      data.orcamento,
      data.horario,
      data.restricoes || null,
      JSON.stringify(data.cardapio),
      data.lista_compras ? JSON.stringify(data.lista_compras) : null,
      data.cronograma ? JSON.stringify(data.cronograma) : null,
      data.is_premium,
    ]
  )
  return result.rows[0]
}

export async function getCeiaPlansByUserId(userId: string, limit = 10): Promise<CeiaPlan[]> {
  const result = await query<CeiaPlan>(
    `SELECT * FROM ceia_plans 
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

export async function getCeiaPlanById(id: string): Promise<CeiaPlan | null> {
  const result = await query<CeiaPlan>(
    'SELECT * FROM ceia_plans WHERE id = $1 AND deleted_at IS NULL',
    [id]
  )
  return result.rows[0] || null
}

export async function getCeiaPlanByToken(token: string): Promise<CeiaPlan | null> {
  const result = await query<CeiaPlan>(
    'SELECT * FROM ceia_plans WHERE shared_token = $1 AND deleted_at IS NULL',
    [token]
  )
  return result.rows[0] || null
}

export async function createDrinkCalculation(data: {
  user_id?: string | null
  pessoas_bebem: number
  pessoas_nao_bebem: number
  duracao_horas: number
  nivel_consumo: 'moderado' | 'alto'
  resultado: any
}): Promise<DrinkCalculation> {
  const result = await query<DrinkCalculation>(
    `INSERT INTO drink_calculations (
      user_id, pessoas_bebem, pessoas_nao_bebem, 
      duracao_horas, nivel_consumo, resultado
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.user_id || null,
      data.pessoas_bebem,
      data.pessoas_nao_bebem,
      data.duracao_horas,
      data.nivel_consumo,
      JSON.stringify(data.resultado),
    ]
  )
  return result.rows[0]
}

export async function getDrinkCalculationsByUserId(userId: string, limit = 10): Promise<DrinkCalculation[]> {
  const result = await query<DrinkCalculation>(
    `SELECT * FROM drink_calculations 
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

export async function createMagicMessage(data: {
  user_id?: string | null
  destinatario: string
  tom: 'formal' | 'engracado' | 'emocionante'
  mensagens: string[]
  mensagem_selecionada?: number | null
}): Promise<MagicMessage> {
  const result = await query<MagicMessage>(
    `INSERT INTO magic_messages (
      user_id, destinatario, tom, mensagens, mensagem_selecionada
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      data.user_id || null,
      data.destinatario,
      data.tom,
      JSON.stringify(data.mensagens),
      data.mensagem_selecionada || null,
    ]
  )
  return result.rows[0]
}

export async function getMagicMessagesByUserId(userId: string, limit = 10): Promise<MagicMessage[]> {
  const result = await query<MagicMessage>(
    `SELECT * FROM magic_messages 
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

export async function updateMagicMessageSelected(id: string, mensagemIndex: number): Promise<void> {
  await query(
    'UPDATE magic_messages SET mensagem_selecionada = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [mensagemIndex, id]
  )
}

export async function markMagicMessageAsCopied(id: string): Promise<void> {
  await query(
    'UPDATE magic_messages SET copied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  )
}

export async function incrementCeiaViews(id: string): Promise<void> {
  await query(
    'UPDATE ceia_plans SET views_count = views_count + 1 WHERE id = $1',
    [id]
  )
}

export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const result = await query<SubscriptionPlan>(
    `SELECT * FROM subscription_plans 
     WHERE is_active = TRUE 
     ORDER BY price ASC`,
    []
  )
  return result.rows
}

export async function getSubscriptionPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  const result = await query<SubscriptionPlan>(
    'SELECT * FROM subscription_plans WHERE slug = $1 AND is_active = TRUE',
    [slug]
  )
  return result.rows[0] || null
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const result = await query<Testimonial>(
    `SELECT * FROM testimonials 
     WHERE is_active = TRUE 
     ORDER BY display_order ASC, created_at DESC`,
    []
  )
  return result.rows
}

export async function getFeaturedTestimonials(limit = 10): Promise<Testimonial[]> {
  const result = await query<Testimonial>(
    `SELECT * FROM testimonials 
     WHERE is_active = TRUE AND is_featured = TRUE 
     ORDER BY display_order ASC, created_at DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}



