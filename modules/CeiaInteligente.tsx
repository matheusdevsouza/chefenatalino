'use client'

import React, { useState } from 'react'
import { ChefHat, Clock, ShoppingCart } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Paywall } from '@/components/Paywall'
import { generateWithGemini } from '@/lib/gemini'

/**
 * Formato dos dados que a IA retorna ao gerar uma ceia.
 * 
 * Inclui cardápio completo, lista de compras com quantidades exatas
 * e cronograma de preparação minuto a minuto.
 */

interface CeiaData {
  cardapio: {
    entrada: string
    pratoPrincipal: string
    acompanhamentos: string[]
    sobremesa: string
  }
  listaCompras: Array<{ item: string; quantidade: string }>
  cronograma: Array<{ horario: string; atividade: string }>
}

/**
 * Módulo que gera planejamento completo de ceia usando IA.
 * 
 * Usuário informa número de pessoas, orçamento, horário e restrições.
 * A IA cria cardápio personalizado, lista de compras com quantidades
 * exatas e cronograma minuto a minuto.
 * 
 * Cardápio sempre aparece de graça. Lista de compras e cronograma
 * só aparecem para quem tem plano ativo.
 */

export function CeiaInteligente() {
  const [adultos, setAdultos] = useState('')
  const [criancas, setCriancas] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [horario, setHorario] = useState('')
  const [restricoes, setRestricoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<CeiaData | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!adultos || !criancas || !orcamento || !horario) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    const numAdultos = parseInt(adultos)
    const numCriancas = parseInt(criancas)
    const numOrcamento = parseFloat(orcamento)

    if (isNaN(numAdultos) || numAdultos < 1 || numAdultos > 100) {
      setError('Número de adultos inválido (1-100)')
      return
    }

    if (isNaN(numCriancas) || numCriancas < 0 || numCriancas > 100) {
      setError('Número de crianças inválido (0-100)')
      return
    }

    if (isNaN(numOrcamento) || numOrcamento < 0 || numOrcamento > 100000) {
      setError('Orçamento inválido (R$ 0 - R$ 100.000)')
      return
    }

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
      setError('Horário inválido')
      return
    }

    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const restricoesSanitizadas = restricoes
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .substring(0, 500)

      const prompt = `
Crie um planejamento completo de ceia de Natal em formato JSON válido com as seguintes informações:

Número de adultos: ${numAdultos}
Número de crianças: ${numCriancas}
Orçamento: R$ ${numOrcamento}
Horário da ceia: ${horario}
Restrições alimentares: ${restricoesSanitizadas || 'Nenhuma'}

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem código, apenas JSON puro):
{
  "cardapio": {
    "entrada": "nome da entrada",
    "pratoPrincipal": "nome do prato principal",
    "acompanhamentos": ["acompanhamento 1", "acompanhamento 2", "acompanhamento 3"],
    "sobremesa": "nome da sobremesa"
  },
  "listaCompras": [
    {"item": "nome do item", "quantidade": "quantidade exata"},
    {"item": "nome do item", "quantidade": "quantidade exata"}
  ],
  "cronograma": [
    {"horario": "HH:MM", "atividade": "descrição da atividade"},
    {"horario": "HH:MM", "atividade": "descrição da atividade"}
  ]
}

O cronograma deve ser minuto-a-minuto começando pelo menos 4 horas antes do horário da ceia.
A lista de compras deve ter quantidades exatas baseadas no número de pessoas.
`

      const response = await generateWithGemini(prompt)
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setResultado(parsed)

        try {
          const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
          await fetch('/api/ceia/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(userId && { 'x-user-id': userId }),
            },
            body: JSON.stringify({
              adultos: numAdultos,
              criancas: numCriancas,
              orcamento: numOrcamento,
              horario,
              restricoes: restricoesSanitizadas || null,
              cardapio: parsed.cardapio,
              listaCompras: parsed.listaCompras,
              cronograma: parsed.cronograma,
            }),
          })
        } catch (saveError) {
          console.error('Erro ao salvar ceia no banco:', saveError)
        }
      } else {
        throw new Error('Resposta inválida da IA')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar planejamento. Verifique sua API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Input
          label="Número de Adultos *"
          type="number"
          value={adultos}
          onChange={setAdultos}
          min="1"
        />
        <Input
          label="Número de Crianças *"
          type="number"
          value={criancas}
          onChange={setCriancas}
          min="0"
        />
        <Input
          label="Orçamento (R$) *"
          type="number"
          value={orcamento}
          onChange={setOrcamento}
          min="0"
          placeholder="Ex: 500"
        />
        <Input
          label="Horário da Ceia *"
          type="time"
          value={horario}
          onChange={setHorario}
        />
        <Input
          label="Restrições Alimentares"
          value={restricoes}
          onChange={setRestricoes}
          placeholder="Ex: Vegetariano, Sem glúten, etc."
          className="md:col-span-2"
        />
      </div>

      <div className="flex justify-center mb-8">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
          variant="primary"
        >
          {loading ? 'Gerando Planejamento...' : 'Gerar Planejamento Inteligente'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {resultado && (
        <div className="space-y-6 animate-scale-in">
          <Card className="relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <ChefHat className="w-6 h-6 text-vermelho-vibrante" />
                </div>
                <h2 className="text-2xl font-bold text-vermelho-escuro">Cardápio Completo</h2>
              </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-vermelho-escuro mb-2">Entrada</h3>
                <p className="text-vermelho-hover">{resultado.cardapio.entrada}</p>
              </div>
              <div>
                <h3 className="font-semibold text-vermelho-escuro mb-2">Prato Principal</h3>
                <p className="text-vermelho-hover">{resultado.cardapio.pratoPrincipal}</p>
              </div>
              <div>
                <h3 className="font-semibold text-vermelho-escuro mb-2">Acompanhamentos</h3>
                  <ul className="list-disc list-inside text-vermelho-hover space-y-1">
                  {resultado.cardapio.acompanhamentos.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-vermelho-escuro mb-2">Sobremesa</h3>
                <p className="text-vermelho-hover">{resultado.cardapio.sobremesa}</p>
              </div>
            </div>
            </div>
          </Card>

          <Paywall moduleName="Lista de Compras">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-6 h-6 text-vermelho-vibrante" />
                <h2 className="text-2xl font-bold text-gray-900">Lista de Compras</h2>
              </div>
              <div className="space-y-2">
                {resultado.listaCompras.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-vermelho-vibrante/20">
                    <span className="text-vermelho-hover">{item.item}</span>
                    <span className="font-semibold text-vermelho-vibrante">{item.quantidade}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Paywall>

          <Paywall moduleName="Cronograma">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-vermelho-vibrante" />
                <h2 className="text-2xl font-bold text-gray-900">Cronograma Minuto-a-Minuto</h2>
              </div>
              <div className="space-y-3">
                {resultado.cronograma.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start py-2 border-b border-vermelho-vibrante/20">
                    <span className="font-bold text-vermelho-vibrante min-w-[80px]">{item.horario}</span>
                    <span className="text-vermelho-hover flex-1">{item.atividade}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Paywall>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <Card>
            <div className="skeleton h-8 w-48 mb-4 rounded"></div>
            <div className="skeleton h-4 w-full rounded mb-2"></div>
            <div className="skeleton h-4 w-3/4 rounded"></div>
          </Card>
          <Card>
            <div className="skeleton h-8 w-48 mb-4 rounded"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-5/6 rounded"></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

