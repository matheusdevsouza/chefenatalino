'use client'

import React, { useState } from 'react'
import { Wine, Beer, Coffee, Droplet } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

/**
 * Resultado do cálculo de bebidas para o evento.
 */

interface CalculoBebidas {
  vinho: number
  cerveja: number
  refrigerante: number
  agua: number
  espumante: number
}

/**
 * Módulo de calculadora de bebidas para eventos de Natal.
 * 
 * Calcula a quantidade exata de bebidas necessárias baseado no número de
 * pessoas que consomem álcool, pessoas que não consomem, duração do evento
 * e nível de consumo esperado. Usa algoritmos baseados em médias de consumo
 * para fornecer estimativas precisas.
 */

export function CalculadoraBebidas() {
  const [bebem, setBebem] = useState('')
  const [naoBebem, setNaoBebem] = useState('')
  const [duracao, setDuracao] = useState('')
  const [nivel, setNivel] = useState<'moderado' | 'alto'>('moderado')
  const [resultado, setResultado] = useState<CalculoBebidas | null>(null)

  const calcular = () => {
    if (!bebem || !naoBebem || !duracao) {
      return
    }

    const numBebem = parseInt(bebem)
    const numNaoBebem = parseInt(naoBebem)
    const numDuracao = parseFloat(duracao)

    if (isNaN(numBebem) || numBebem < 0 || numBebem > 1000) {
      return
    }

    if (isNaN(numNaoBebem) || numNaoBebem < 0 || numNaoBebem > 1000) {
      return
    }

    if (isNaN(numDuracao) || numDuracao < 0.5 || numDuracao > 24) {
      return
    }

    const totalPessoas = numBebem + numNaoBebem
    const horas = numDuracao
    const pessoasBebem = numBebem
    const pessoasNaoBebem = numNaoBebem

    const fatorVinho = nivel === 'alto' ? 0.5 : 0.3
    const fatorCerveja = nivel === 'alto' ? 2.5 : 1.5
    const fatorRefrigerante = 1.5
    const fatorAgua = 0.5
    const fatorEspumante = nivel === 'alto' ? 0.3 : 0.2

    const calculo: CalculoBebidas = {
      vinho: Math.ceil(pessoasBebem * horas * fatorVinho),
      cerveja: Math.ceil(pessoasBebem * horas * fatorCerveja),
      refrigerante: Math.ceil(totalPessoas * horas * fatorRefrigerante),
      agua: Math.ceil(totalPessoas * horas * fatorAgua),
      espumante: Math.ceil(totalPessoas * fatorEspumante),
    }

    setResultado(calculo)

    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
      await fetch('/api/drinks/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId && { 'x-user-id': userId }),
        },
        body: JSON.stringify({
          pessoas_bebem: numBebem,
          pessoas_nao_bebem: numNaoBebem,
          duracao: numDuracao,
          nivel,
          resultado: calculo,
        }),
      })
    } catch (saveError) {
      console.error('Erro ao salvar cálculo no banco:', saveError)
    }
  }

  const bebidas = [
    {
      nome: 'Garrafas de Vinho',
      quantidade: resultado?.vinho || 0,
      unidade: 'garrafas',
      icon: Wine,
      color: 'text-vermelho-vibrante',
      bgColor: 'bg-vermelho-vibrante/10',
    },
    {
      nome: 'Latas de Cerveja',
      quantidade: resultado?.cerveja || 0,
      unidade: 'latas',
      icon: Beer,
      color: 'text-vermelho-vibrante',
      bgColor: 'bg-vermelho-vibrante/10',
    },
    {
      nome: 'Latas de Refrigerante',
      quantidade: resultado?.refrigerante || 0,
      unidade: 'latas',
      icon: Coffee,
      color: 'text-vermelho-vibrante',
      bgColor: 'bg-vermelho-vibrante/10',
    },
    {
      nome: 'Água',
      quantidade: resultado?.agua || 0,
      unidade: 'litros',
      icon: Droplet,
      color: 'text-vermelho-vibrante',
      bgColor: 'bg-vermelho-vibrante/10',
    },
    {
      nome: 'Garrafas de Espumante',
      quantidade: resultado?.espumante || 0,
      unidade: 'garrafas',
      icon: Droplet,
      color: 'text-vermelho-vibrante',
      bgColor: 'bg-vermelho-vibrante/10',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Input
          label="Pessoas que Bebem Álcool"
          type="number"
          value={bebem}
          onChange={setBebem}
          min="0"
        />
        <Input
          label="Pessoas que Não Bebem"
          type="number"
          value={naoBebem}
          onChange={setNaoBebem}
          min="0"
        />
        <Input
          label="Duração da Festa (horas)"
          type="number"
          value={duracao}
          onChange={setDuracao}
          min="1"
          step="0.5"
          placeholder="Ex: 4.5"
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-vermelho-escuro">
            Nível de Consumo
          </label>
          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value as 'moderado' | 'alto')}
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
            <option value="moderado">Moderado</option>
            <option value="alto">Alto</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <Button onClick={calcular} size="lg" variant="primary">
          Calcular Bebidas
        </Button>
      </div>

      {resultado && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-scale-in">
          {bebidas.map((bebida, idx) => {
            const Icon = bebida.icon
            return (
              <Card key={idx} className="text-center relative overflow-hidden group">
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${bebida.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${bebida.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-vermelho-escuro mb-2">
                    {bebida.nome}
                  </h3>
                  <p className="text-3xl font-bold text-vermelho-vibrante mb-1">
                    {bebida.quantidade}
                  </p>
                  <p className="text-sm text-vermelho-hover">{bebida.unidade}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

