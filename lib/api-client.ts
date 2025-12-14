/**
 * Cliente API para requisições autenticadas.
 * 
 * Gerencia automaticamente tokens JWT, refresh de tokens e
 * requisições autenticadas. Cookies são enviados automaticamente
 * pelo navegador, não precisando ser gerenciados manualmente.
 * 
 * ⚠️ IMPORTANTE: Logout automático quando token expira e "remember me" não está ativo
 */

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Fazer logout do usuário (limpar tokens e dados)
 */
export async function performLogout(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    // Tentar deslogar no servidor
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Ignorar erros se servidor não responder
    })
  } finally {
    // Limpar dados locais em qualquer caso
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_avatar')
    localStorage.removeItem('is_authenticated')
    localStorage.removeItem('remember_me')
    
    // Disparar evento de logout para componentes
    window.dispatchEvent(new Event('user-logged-out'))
    
    // Redirecionar para home
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }
}

/**
 * Faz uma requisição autenticada à API.
 * 
 * Automaticamente inclui cookies de autenticação e tenta
 * renovar o token se necessário. Se refresh falhar ou "remember me"
 * não estiver ativo, faz logout automático.
 */
export async function apiRequest(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  // Se token expirou (401), tentar renovar
  if (response.status === 401 && requireAuth) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Token foi renovado com sucesso
        const refreshData = await refreshResponse.json()
        
        // Atualizar localStorage com dados frescos
        if (typeof window !== 'undefined' && refreshData.user) {
          if (refreshData.user.name) localStorage.setItem('user_name', refreshData.user.name)
          if (refreshData.user.email) localStorage.setItem('user_email', refreshData.user.email)
          if (refreshData.user.avatar_url) localStorage.setItem('user_avatar', refreshData.user.avatar_url)
          
          // Disparar evento para componentes atualizarem dados
          window.dispatchEvent(new Event('user-data-refreshed'))
        }
        
        // Tentar novamente após refresh bem-sucedido
        return await fetch(url, {
          ...fetchOptions,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })
      } else {
        // Refresh falhou - fazer logout automático
        // IMPORTANTE: Só faz logout se "remember me" não estava ativo
        const rememberMe = localStorage.getItem('remember_me') === 'true'
        
        if (!rememberMe) {
          // Token expirou e não há remember-me, fazer logout automático
          await performLogout()
        } else {
          // Mesmo com remember-me, se refresh falhar, ainda fazer logout
          // (o refresh deveria ter sucesso se remember-me estava ativo)
          await performLogout()
        }
        
        return response
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      // Erro ao tentar renovar - fazer logout
      await performLogout()
      return response
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
  await performLogout()
}

