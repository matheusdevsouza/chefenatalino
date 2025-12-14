'use client'

import React, { useState } from 'react'

export function MessagesModule() {
  const [recipient, setRecipient] = useState('Amigo')
  const [tone, setTone] = useState('Caloroso')
  const [occasion, setOccasion] = useState('Natal')
  const [message, setMessage] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, tone, occasion, context: message }),
      })
      const data = await res.json()
      if (data.success && data.messages && Array.isArray(data.messages)) setGenerated(data.messages[0])
      else setGenerated('Falha ao gerar mensagem')
    } catch (err) {
      setGenerated('Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generated) return
    try {
      const res = await fetch('/api/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, tone, occasion, text: generated }),
      })
      const data = await res.json()
      if (data.success) alert('Mensagem salva')
      else alert('Falha ao salvar')
    } catch (err) {
      alert('Erro de rede')
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Mensagens Mágicas</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm text-slate-700 dark:text-[#d4d4d4]">Para</label>
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 dark:bg-[#232323]" />
        </div>
        <div>
          <label className="block text-sm text-slate-700 dark:text-[#d4d4d4]">Tom</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 dark:bg-[#232323]">
            <option>Caloroso</option>
            <option>Formal</option>
            <option>Engraçado</option>
            <option>Curto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-700 dark:text-[#d4d4d4]">Ocasião</label>
          <input value={occasion} onChange={(e) => setOccasion(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 dark:bg-[#232323]" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-700 dark:text-[#d4d4d4]">Contexto (opcional)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 min-h-[80px] dark:bg-[#232323]" />
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? 'Gerando...' : 'Gerar Mensagem'}</button>
        <button onClick={handleSave} disabled={!generated} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
      </div>

      {generated && (
        <div className="rounded-lg border p-4 bg-white dark:bg-[#2e2e2e]">
          <h4 className="font-semibold mb-2">Pré-visualização</h4>
          <p className="whitespace-pre-line">{generated}</p>
        </div>
      )}
    </div>
  )
}
