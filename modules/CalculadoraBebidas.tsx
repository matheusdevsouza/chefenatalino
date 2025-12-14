'use client'

import React, { useState, useCallback } from 'react'
import {
  Users,
  Clock,
  Wine,
  AlertCircle,
  Loader2,
  Copy,
  Download,
} from 'lucide-react'
import ModuleLayout from '@/components/ModuleLayout'

export function CalculadoraBebidas() {
  const [guests, setGuests] = useState(10)
  const [hours, setHours] = useState(4)
  const [eventType, setEventType] = useState('Misto')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const isFormValid = guests > 0 && hours > 0

  const handleCalculate = useCallback(async () => {
    if (!isFormValid) {
      setMessage('Preencha todos os campos obrigatórios')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setResults(null)

    try {
      const aiRes = await fetch('/api/ai/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ guests, hours, type: eventType }),
      })
      const aiData = await aiRes.json()

      if (aiData?.success && aiData?.result) {
        setResults(aiData.result)
        setMessage('Cálculo gerado com sucesso!')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const res = await fetch('/api/drinks/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ guests, hours, type: eventType }),
        })
        const data = await res.json()
        if (data.success) {
          setResults(data.result)
          setMessage('Cálculo gerado com sucesso!')
          setMessageType('success')
          setTimeout(() => setMessage(''), 3000)
        } else {
          setMessage(data.message || 'Erro ao calcular')
          setMessageType('error')
        }
      }
    } catch (err) {
      setMessage('Erro de conexão. Tente novamente.')
      setMessageType('error')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [guests, hours, eventType, isFormValid])

  const handleSaveCalculation = useCallback(async () => {
    if (!results) return

    try {
      const res = await fetch('/api/drinks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ guests, hours, type: eventType, result: results }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Cálculo salvo com sucesso!')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Erro ao salvar')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Erro ao salvar. Tente novamente.')
      setMessageType('error')
    }
  }, [guests, hours, eventType, results])

  const handleDownloadResults = () => {
    if (!results) return
    const content = JSON.stringify(results, null, 2)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `bebidas-${new Date().toISOString().split('T')[0]}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyResults = () => {
    if (!results) return
    const text = JSON.stringify(results, null, 2)
    navigator.clipboard.writeText(text)
    setMessage('Resultados copiados para a área de transferência!')
    setMessageType('success')
    setTimeout(() => setMessage(''), 2000)
  }

  const left = (
    <>
      <h2 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">Detalhes do Evento</h2>

      <div className="space-y-5">
        <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-4 border border-slate-200 dark:border-[#3a3a3a]">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5]">Convidados</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">−</button>
            <input type="number" min="1" value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-center text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600" />
            <button onClick={() => setGuests(guests + 1)} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">+</button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-4 border border-slate-200 dark:border-[#3a3a3a]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5]">Duração</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHours(Math.max(1, hours - 1))} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">−</button>
            <input type="number" min="1" value={hours} onChange={(e) => setHours(Math.max(1, Number(e.target.value)))} className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-center text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600" />
            <button onClick={() => setHours(hours + 1)} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">+</button>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-2">horas de duração</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Tipo de Evento</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600 transition">
            <option>Misto</option>
            <option>Formal</option>
            <option>Casual</option>
            <option>Adulto</option>
          </select>
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${messageType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            <p className={`text-sm ${messageType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{message}</p>
          </div>
        )}

        <button onClick={handleCalculate} disabled={loading || !isFormValid} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-[#3a3a3a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Calculando...</>) : ('Calcular Bebidas')}
        </button>
      </div>
    </>
  )

  const right = !results ? (
    <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-12 shadow-lg h-full flex flex-col items-center justify-center text-center">
      <Wine className="w-16 h-16 text-slate-300 dark:text-[#3a3a3a] mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 dark:text-[#a3a3a3] mb-2">Nenhum cálculo realizado</h3>
      <p className="text-sm text-slate-500 dark:text-[#888]">Preencha os detalhes do evento e clique em "Calcular Bebidas" para ver as recomendações</p>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={handleSaveCalculation} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">✓ Salvar Cálculo</button>
        <button onClick={handleCopyResults} className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Copy className="w-4 h-4" />Copiar</button>
        <button onClick={handleDownloadResults} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Baixar</button>
      </div>

      <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-4">Recomendações de Bebidas</h3>
        {results && typeof results === 'object' ? (
          <div className="space-y-3">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-[#3a3a3a] hover:border-red-300 dark:hover:border-red-600 transition">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-[#f5f5f5] capitalize">{String(key).replace(/_/g, ' ')}</p>
                </div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-[#a3a3a3]">{String(results)}</p>
        )}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
        <p className="text-sm text-red-800 dark:text-red-300"><span className="font-semibold">Dica:</span> Estas recomendações são baseadas em boas práticas do mercado. Ajuste conforme necessário para as preferências dos seus convidados.</p>
      </div>
    </div>
  )

  return <ModuleLayout Icon={Wine} title="Calculadora de Bebidas" subtitle="Calcule a quantidade perfeita de bebidas para seu evento" left={left} right={right} />
}

