/**
 * Cliente API para requisições autenticadas.
 * 
 * Gerencia automaticamente tokens JWT, refresh de tokens e
 * requisições autenticadas. Cookies são enviados automaticamente
 * pelo navegador, não precisando ser gerenciados manualmente.
 */

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Faz uma requisição autenticada à API.
 * 
 * Automaticamente inclui cookies de autenticação e tenta
 * renovar o token se necessário. Retorna resposta ou lança erro.
 */
export async function apiRequest(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include', // Inclui cookies automaticamente
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  // Se token expirou, tentar renovar
  if (response.status === 401 && requireAuth) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Tentar novamente após refresh
        return await fetch(url, {
          ...fetchOptions,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })
      }
    } catch {
      // Se refresh falhar, redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

/**
 * Faz uma requisição GET autenticada.
 */
export async function apiGet<T = any>(url: string, options?: FetchOptions): Promise<T> {
  const response = await apiRequest(url, { ...options, method: 'GET' })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || 'Erro na requisição')
  }
  
  return response.json()
}

/**
 * Faz uma requisição POST autenticada.
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await apiRequest(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || 'Erro na requisição')
  }
  
  return response.json()
}

/**
 * Faz logout do usuário.
 */
export async function logout(): Promise<void> {
  try {
    await apiPost('/api/auth/logout', {}, { requireAuth: false })
  } catch {
    // Ignorar erros no logout
  }
  
  // Redirecionar para home
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

