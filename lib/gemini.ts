/**
 * Gera conteúdo utilizando a API do Google Gemini.
 * 
 * Envia uma requisição para o endpoint interno da API que processa o prompt
 * através do modelo Gemini Pro. Gerencia erros e retorna o texto gerado
 * pela inteligência artificial.
 */

export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao gerar conteúdo')
    }

    const data = await response.json()
    return data.text
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo com Gemini:', error)
    throw error
  }
}

