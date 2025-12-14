'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  Dices,
  Users,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react'
import ModuleLayout from '@/components/ModuleLayout'

interface Winner {
  giver: string
  receiver: string
}

export function SecretSantaModule() {
  const [participants, setParticipants] = useState('')
  const [newParticipant, setNewParticipant] = useState('')
  const [participantsList, setParticipantsList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Winner[] | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const handleAddParticipant = () => {
    const trimmed = newParticipant.trim()
    if (trimmed && !participantsList.includes(trimmed)) {
      setParticipantsList([...participantsList, trimmed])
      setNewParticipant('')
    }
  }

  const handleRemoveParticipant = (name: string) => {
    setParticipantsList(participantsList.filter((p) => p !== name))
  }

  const handleGenerateDraw = useCallback(async () => {
    if (participantsList.length < 2) {
      setMessage('Adicione pelo menos 2 participantes')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setResults(null)

    try {
      const res = await fetch('/api/sorteio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participants: participantsList }),
      })
      const data = await res.json()

      if (data.success && data.results) {
        setResults(data.results)
        setMessage('Sorteio realizado com sucesso!')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || 'Erro ao gerar sorteio')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Erro de conexão. Tente novamente.')
      setMessageType('error')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [participantsList])

  const handleSaveDraw = useCallback(async () => {
    if (!results) return

    try {
      const res = await fetch('/api/sorteio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          participants: participantsList,
          results,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Sorteio salvo com sucesso!')
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
  }, [participantsList, results])

  const handleDownloadResults = () => {
    if (!results) return
    const content = results.map((r) => `${r.giver} → ${r.receiver}`).join('\n')
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `sorteio-amigo-secreto-${new Date().toISOString().split('T')[0]}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyResults = () => {
    if (!results) return
    const content = results.map((r) => `${r.giver} → ${r.receiver}`).join('\n')
    navigator.clipboard.writeText(content)
    setMessage('Resultados copiados para a área de transferência!')
    setMessageType('success')
    setTimeout(() => setMessage(''), 2000)
  }

  const left = (
    <>
      <h2 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">Participantes</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()} placeholder="Nome do participante..." className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-red-600 transition" />
          <button onClick={handleAddParticipant} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">+</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {participantsList.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-[#888] py-4">Nenhum participante adicionado</p>
          ) : (
            participantsList.map((participant) => (
              <div key={participant} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-[#3a3a3a]">
                <span className="font-medium text-slate-900 dark:text-[#f5f5f5]">{participant}</span>
                <button onClick={() => handleRemoveParticipant(participant)} className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition font-semibold">Remover</button>
              </div>
            ))
          )}
        </div>

        <div className="text-sm text-slate-600 dark:text-[#a3a3a3] p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
          {participantsList.length} participante{participantsList.length !== 1 ? 's' : ''} adicionado{participantsList.length !== 1 ? 's' : ''}
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${messageType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            <p className={`text-sm ${messageType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{message}</p>
          </div>
        )}

        <button onClick={handleGenerateDraw} disabled={loading || participantsList.length < 2} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-[#3a3a3a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Sorteando...</>) : (<><Dices className="w-5 h-5" />Fazer Sorteio</>) }
        </button>
      </div>
    </>
  )

  const right = !results ? (
    <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-12 shadow-lg h-full flex flex-col items-center justify-center text-center">
      <Dices className="w-16 h-16 text-slate-300 dark:text-[#3a3a3a] mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 dark:text-[#a3a3a3] mb-2">Nenhum sorteio realizado</h3>
      <p className="text-sm text-slate-500 dark:text-[#888]">Adicione os participantes e clique em "Fazer Sorteio" para gerar o amigo secreto</p>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={handleSaveDraw} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">✓ Salvar</button>
        <button onClick={handleCopyResults} className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Copy className="w-4 h-4" />Copiar</button>
        <button onClick={handleDownloadResults} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Baixar</button>
      </div>

      <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-lg">
        <h3 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6 pb-4 border-b-2 border-red-200 dark:border-red-900">Resultado do Sorteio</h3>
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">{(idx + 1).toString().padStart(2, '0')}</div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-[#f5f5f5]">{result.giver}</p>
                  <p className="text-xs text-slate-600 dark:text-[#a3a3a3]">compra para</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-red-600 dark:text-red-400">{result.receiver}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
        <p className="text-sm text-red-800 dark:text-red-300"><span className="font-semibold">Dica:</span> Cada participante descobrirá apenas para quem compra o presente. Guarde bem o segredo! 🤫</p>
      </div>
    </div>
  )

  return <ModuleLayout Icon={Dices} title="Amigo Secreto" subtitle="Realize um sorteio de amigo secreto para o Natal" left={left} right={right} />
}
