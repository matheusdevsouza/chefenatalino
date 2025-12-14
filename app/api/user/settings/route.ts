import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { setAPIHeaders } from '@/lib/security/headers'
import { withAuthorization } from '@/lib/security/authorization'
import { decrypt } from '@/lib/security/encryption'

/**
 * Retorna configurações completas do usuário
 * Inclui: perfil, preferências, tema, notificações, etc.
 * 
 * IMPORTANTE: Descriptografa dados sensíveis (name, email, phone, avatar_url) antes de retornar
 */
export async function GET(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const result = await query(
          `
          SELECT 
            u.id,
            u.email,
            u.name,
            u.phone,
            u.avatar_url,
            u.created_at,
            us.language,
            us.timezone,
            us.theme,
            us.email_notifications,
            us.push_notifications,
            us.marketing_emails,
            us.preferences
          FROM users u
          LEFT JOIN user_settings us ON u.id = us.user_id
          WHERE u.id = $1
          `,
          [user.id]
        )

        if (result.rows.length === 0) {
          return setAPIHeaders(
            NextResponse.json(
              { error: 'Usuário não encontrado' },
              { status: 404 }
            )
          )
        }

        const userData = result.rows[0]
        
        // Descriptografar dados sensíveis antes de retornar
        let decryptedName = userData.name
        let decryptedEmail = userData.email
        let decryptedPhone = userData.phone
        let decryptedAvatarUrl = userData.avatar_url
        
        try {
          decryptedName = decrypt(userData.name) || userData.name
        } catch (e) {
          console.warn('Failed to decrypt name, using as-is')
        }
        
        try {
          decryptedEmail = decrypt(userData.email) || userData.email
        } catch (e) {
          console.warn('Failed to decrypt email, using as-is')
        }
        
        try {
          decryptedPhone = userData.phone ? decrypt(userData.phone) : null
        } catch (e) {
          console.warn('Failed to decrypt phone, using as-is')
        }
        
        try {
          decryptedAvatarUrl = userData.avatar_url ? decrypt(userData.avatar_url) : null
        } catch (e) {
          console.warn('Failed to decrypt avatar_url, using as-is')
        }
        
        const response = NextResponse.json({
          success: true,
          user: {
            id: userData.id,
            email: decryptedEmail,
            name: decryptedName,
            phone: decryptedPhone || '',
            avatar_url: decryptedAvatarUrl,
            created_at: userData.created_at,
          },
          settings: {
            language: userData.language || 'pt-BR',
            timezone: userData.timezone || 'America/Sao_Paulo',
            theme: userData.theme || 'system',
            email_notifications: userData.email_notifications !== false,
            push_notifications: userData.push_notifications !== false,
            marketing_emails: userData.marketing_emails === true,
            preferences: userData.preferences || {},
          },
        })

        return setAPIHeaders(response)
      } catch (error: any) {
        console.error('Erro ao buscar configurações:', error)
        const response = NextResponse.json(
          { error: 'Erro ao buscar configurações', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}

/**
 * Atualiza configurações do usuário
 * Permite atualizar: name, phone, language, timezone, theme, preferências de notificação
 */
export async function PUT(request: NextRequest) {
  return withAuthorization(
    request,
    async (user) => {
      try {
        const body = await request.json()
        const {
          name,
          phone,
          language,
          timezone,
          theme,
          email_notifications,
          push_notifications,
          marketing_emails,
          preferences,
        } = body

        // Validações básicas
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
          return setAPIHeaders(
            NextResponse.json(
              { error: 'Nome inválido', success: false },
              { status: 400 }
            )
          )
        }

        if (phone !== undefined && typeof phone !== 'string') {
          return setAPIHeaders(
            NextResponse.json(
              { error: 'Telefone inválido', success: false },
              { status: 400 }
            )
          )
        }

        // Começar transação
        await query('BEGIN')

        try {
          // Atualizar dados do usuário
          if (name !== undefined || phone !== undefined) {
            const updates: string[] = []
            const values: any[] = [user.id]
            let paramCount = 2

            if (name !== undefined) {
              updates.push(`name = $${paramCount}`)
              values.push(name.trim())
              paramCount++
            }

            if (phone !== undefined) {
              updates.push(`phone = $${paramCount}`)
              values.push(phone.trim() || null)
              paramCount++
            }

            if (updates.length > 0) {
              await query(
                `
                UPDATE users
                SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                values
              )
            }
          }

          // Verificar se user_settings existe, senão criar
          const settingsCheck = await query(
            'SELECT id FROM user_settings WHERE user_id = $1',
            [user.id]
          )

          if (settingsCheck.rows.length === 0) {
            await query(
              `
              INSERT INTO user_settings (user_id, language, timezone, theme)
              VALUES ($1, $2, $3, $4)
              `,
              [user.id, language || 'pt-BR', timezone || 'America/Sao_Paulo', theme || 'system']
            )
          } else {
            // Atualizar user_settings
            const settingsUpdates: string[] = []
            const settingsValues: any[] = [user.id]
            let settingsParamCount = 2

            if (language !== undefined) {
              settingsUpdates.push(`language = $${settingsParamCount}`)
              settingsValues.push(language)
              settingsParamCount++
            }

            if (timezone !== undefined) {
              settingsUpdates.push(`timezone = $${settingsParamCount}`)
              settingsValues.push(timezone)
              settingsParamCount++
            }

            if (theme !== undefined) {
              settingsUpdates.push(`theme = $${settingsParamCount}`)
              settingsValues.push(theme)
              settingsParamCount++
            }

            if (email_notifications !== undefined) {
              settingsUpdates.push(`email_notifications = $${settingsParamCount}`)
              settingsValues.push(email_notifications)
              settingsParamCount++
            }

            if (push_notifications !== undefined) {
              settingsUpdates.push(`push_notifications = $${settingsParamCount}`)
              settingsValues.push(push_notifications)
              settingsParamCount++
            }

            if (marketing_emails !== undefined) {
              settingsUpdates.push(`marketing_emails = $${settingsParamCount}`)
              settingsValues.push(marketing_emails)
              settingsParamCount++
            }

            if (preferences !== undefined && typeof preferences === 'object') {
              settingsUpdates.push(`preferences = $${settingsParamCount}::jsonb`)
              settingsValues.push(JSON.stringify(preferences))
              settingsParamCount++
            }

            settingsUpdates.push(`updated_at = CURRENT_TIMESTAMP`)

            if (settingsUpdates.length > 1) {
              // Remove apenas o updated_at do array para verificar se há outras atualizações
              const otherUpdates = settingsUpdates.slice(0, -1)
              if (otherUpdates.length > 0) {
                await query(
                  `
                  UPDATE user_settings
                  SET ${settingsUpdates.join(', ')}
                  WHERE user_id = $1
                  `,
                  settingsValues
                )
              }
            }
          }

          await query('COMMIT')

          // Buscar dados atualizados
          const result = await query(
            `
            SELECT 
              u.id,
              u.email,
              u.name,
              u.phone,
              u.avatar_url,
              us.language,
              us.timezone,
              us.theme,
              us.email_notifications,
              us.push_notifications,
              us.marketing_emails,
              us.preferences
            FROM users u
            LEFT JOIN user_settings us ON u.id = us.user_id
            WHERE u.id = $1
            `,
            [user.id]
          )

          const userData = result.rows[0]
          const response = NextResponse.json({
            success: true,
            message: 'Configurações atualizadas com sucesso',
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone || '',
              avatar_url: userData.avatar_url,
            },
            settings: {
              language: userData.language || 'pt-BR',
              timezone: userData.timezone || 'America/Sao_Paulo',
              theme: userData.theme || 'system',
              email_notifications: userData.email_notifications !== false,
              push_notifications: userData.push_notifications !== false,
              marketing_emails: userData.marketing_emails === true,
              preferences: userData.preferences || {},
            },
          })

          return setAPIHeaders(response)
        } catch (error) {
          await query('ROLLBACK')
          throw error
        }
      } catch (error: any) {
        console.error('Erro ao atualizar configurações:', error)
        const response = NextResponse.json(
          { error: 'Erro ao atualizar configurações', success: false },
          { status: 500 }
        )
        return setAPIHeaders(response)
      }
    },
    {}
  )
}
