'use client'

import React, { useState, useCallback } from 'react'
import {
  Wand2,
  ChefHat,
  Copy,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import ModuleLayout from '@/components/ModuleLayout'

export function CeiaInteligente() {
  const [guests, setGuests] = useState(4)
  const [preferences, setPreferences] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [loading, setLoading] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const isFormValid = guests > 0

  const handleGenerateMenu = useCallback(async () => {
    if (!isFormValid) {
      setMessage('Preencha todos os campos obrigatórios')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setMenu(null)

    try {
      const res = await fetch('/api/ceia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guests,
          preferences,
          dietaryRestrictions,
        }),
      })
      const data = await res.json()

      if (data.success && data.menu) {
        setMenu(data.menu)
        setMessage('Menu gerado com sucesso!')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Erro ao gerar menu')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Erro de conexão. Tente novamente.')
      setMessageType('error')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [guests, preferences, dietaryRestrictions, isFormValid])

  const handleSaveMenu = useCallback(async () => {
    if (!menu) return

    try {
      const res = await fetch('/api/ceia/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guests,
          preferences,
          dietaryRestrictions,
          menu,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Menu salvo com sucesso!')
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
  }, [guests, preferences, dietaryRestrictions, menu])

  const handleDownloadMenu = () => {
    if (!menu) return
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(menu))
    element.setAttribute('download', `menu-ceia-${new Date().toISOString().split('T')[0]}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyMenu = () => {
    if (!menu) return
    navigator.clipboard.writeText(menu)
    setMessage('Menu copiado para a área de transferência!')
    setMessageType('success')
    setTimeout(() => setMessage(''), 2000)
  }

  const left = (
    <>
      <h2 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">Preferências da Ceia</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Número de Convidados</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">−</button>
            <input type="number" min="1" value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-center text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600" />
            <button onClick={() => setGuests(guests + 1)} className="flex-1 py-2 bg-slate-100 dark:bg-[#3a3a3a] hover:bg-slate-200 dark:hover:bg-[#4a4a4a] rounded text-sm font-semibold transition">+</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Preferências Culinárias</label>
          <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Ex: gosto de frutos do mar, pratos principais leves..." className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-red-600 resize-none h-32 transition" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Restrições Dietéticas</label>
          <textarea value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} placeholder="Ex: sem glúten, vegetariano, alergia a amendoim..." className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-red-600 resize-none h-32 transition" />
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${messageType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            <p className={`text-sm ${messageType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{message}</p>
          </div>
        )}

        <button onClick={handleGenerateMenu} disabled={loading || !isFormValid} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-[#3a3a3a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Gerando...</>) : (<><Wand2 className="w-5 h-5" />Gerar Menu</>) }
        </button>
      </div>
    </>
  )

  const right = !menu ? (
    <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-12 shadow-lg h-full flex flex-col items-center justify-center text-center">
      <ChefHat className="w-16 h-16 text-slate-300 dark:text-[#3a3a3a] mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 dark:text-[#a3a3a3] mb-2">Nenhum menu gerado</h3>
      <p className="text-sm text-slate-500 dark:text-[#888]">Preencha suas preferências e clique em "Gerar Menu" para criar uma ceia perfeita com IA</p>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={handleSaveMenu} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">✓ Salvar Menu</button>
        <button onClick={handleCopyMenu} className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Copy className="w-4 h-4" />Copiar</button>
        <button onClick={handleDownloadMenu} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Baixar</button>
      </div>

      <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-lg">
        <h3 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6 pb-4 border-b-2 border-red-200 dark:border-red-900">Seu Menu de Ceia</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="text-slate-700 dark:text-[#d4d4d4] whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {menu}
          </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
        <p className="text-sm text-red-800 dark:text-red-300"><span className="font-semibold">Dica:</span> Este menu foi gerado com IA considerando suas preferências. Sinta-se livre para personalizá-lo ainda mais!</p>
      </div>
    </div>
  )

  return <ModuleLayout Icon={ChefHat} title="Ceia Inteligente" subtitle="Crie um menu de Ceia de Natal personalizado com IA" left={left} right={right} />
}
