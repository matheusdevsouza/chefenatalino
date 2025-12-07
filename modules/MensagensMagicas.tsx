'use client'

import React, { useState } from 'react'
import { MessageSquare, Copy, Check } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { generateWithGemini } from '@/lib/gemini'

/**
 * Módulo de geração de mensagens personalizadas de Natal com IA.
 * 
 * Permite criar mensagens únicas e personalizadas para diferentes destinatários
 * (chefe, família, amigos) em diversos tons (formal, engraçado, emocionante).
 * Usa IA para gerar três opções de mensagens prontas para uso, que podem ser
 * copiadas diretamente para WhatsApp ou outras plataformas.
 */

export function MensagensMagicas() {
  const [destinatario, setDestinatario] = useState('')
  const [tom, setTom] = useState<'formal' | 'engracado' | 'emocionante'>('formal')
  const [loading, setLoading] = useState(false)
  const [mensagens, setMensagens] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!destinatario || destinatario.trim().length < 2) {
      setError('Informe para quem é a mensagem (mínimo 2 caracteres)')
      return
    }

    if (destinatario.length > 100) {
      setError('Destinatário muito longo (máximo 100 caracteres)')
      return
    }

    const destinatarioSanitizado = destinatario
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 100)

    if (destinatarioSanitizado.length < 2) {
      setError('Destinatário inválido após sanitização')
      return
    }

    setLoading(true)
    setError('')
    setMensagens([])

    try {
      const tomDescricao = {
        formal: 'formal e respeitoso',
        engracado: 'engraçado e descontraído',
        emocionante: 'emocionante e tocante',
      }

      const prompt = `
Crie 3 mensagens de Natal curtas e prontas para WhatsApp no tom ${tomDescricao[tom]}.

Destinatário: ${destinatarioSanitizado}

Cada mensagem deve:
- Ser curta (máximo 2-3 frases)
- Ser adequada para WhatsApp
- Ter tema natalino
- Estar no tom ${tomDescricao[tom]}
- Ser única e criativa

Retorne APENAS as 3 mensagens, uma por linha, sem numeração, sem markdown, sem aspas, apenas o texto puro de cada mensagem separado por uma linha em branco.
`

      const response = await generateWithGemini(prompt)
      
      const msgs = response
        .split(/\n\s*\n/)
        .map(msg => msg.trim())
        .filter(msg => msg.length > 0)
        .slice(0, 3)

      setMensagens(msgs)

      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
        const saveResponse = await fetch('/api/messages/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userId && { 'x-user-id': userId }),
          },
          body: JSON.stringify({
            destinatario: destinatarioSanitizado,
            tom,
            mensagens: msgs,
          }),
        })
        const saveData = await saveResponse.json()
        if (saveData.id) {
          localStorage.setItem(`message_${saveData.id}`, JSON.stringify(msgs))
        }
      } catch (saveError) {
        console.error('Erro ao salvar mensagem no banco:', saveError)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar mensagens. Verifique sua API key.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)

      const messageId = Object.keys(localStorage)
        .find(key => key.startsWith('message_'))
        ?.replace('message_', '')
      
      if (messageId) {
        try {
          await fetch(`/api/messages/${messageId}/copy`, {
            method: 'POST',
          })
        } catch (error) {
          console.error('Erro ao marcar mensagem como copiada:', error)
        }
      }
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Input
          label="Para Quem é a Mensagem"
          value={destinatario}
          onChange={setDestinatario}
          placeholder="Ex: Chefe, Vó, Crush, Grupo da Família"
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-vermelho-escuro">
            Tom da Mensagem
          </label>
          <select
            value={tom}
            onChange={(e) => setTom(e.target.value as any)}
            className="
              w-full px-4 py-3 rounded-xl
              bg-white border border-vermelho-vibrante/20
              text-vermelho-escuro
              focus:outline-none focus:ring-2 focus:ring-vermelho-vibrante/20
              focus:border-vermelho-vibrante
              transition-all duration-300
              shadow-sm
            "
          >
            <option value="formal">Formal</option>
            <option value="engracado">Engraçado</option>
            <option value="emocionante">Emocionante</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
          variant="primary"
        >
          {loading ? 'Gerando Mensagens...' : 'Gerar Mensagens Mágicas'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-vermelho-vibrante/50 bg-vermelho-clarissimo">
          <p className="text-vermelho-vibrante">{error}</p>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="skeleton h-6 w-32 mb-3 rounded"></div>
              <div className="skeleton h-4 w-full rounded mb-2"></div>
              <div className="skeleton h-4 w-5/6 rounded"></div>
            </Card>
          ))}
        </div>
      )}

      {mensagens.length > 0 && (
        <div className="space-y-4 animate-scale-in">
          {mensagens.map((msg, idx) => (
            <Card key={idx} className="relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-vermelho-vibrante" />
                      <span className="text-sm font-semibold text-vermelho-hover">
                        Mensagem {idx + 1}
                      </span>
                    </div>
                    <p className="text-vermelho-escuro leading-relaxed whitespace-pre-wrap">
                      {msg}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(msg, idx)}
                    className="
                      p-2 rounded-lg
                      bg-vermelho-vibrante/10 hover:bg-vermelho-vibrante/20
                      transition-all duration-300
                      flex-shrink-0
                      group-hover:scale-110
                    "
                    title="Copiar mensagem"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-5 h-5 text-vermelho-vibrante" />
                    ) : (
                      <Copy className="w-5 h-5 text-vermelho-hover" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

