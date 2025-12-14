'use client'

import React, { useState, useCallback } from 'react'
import {
  Mail,
  Sparkles,
  Copy,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import ModuleLayout from '@/components/ModuleLayout'

export function MensagensMagicas() {
  const [recipient, setRecipient] = useState('')
  const [tone, setTone] = useState('Calorosa')
  const [theme, setTheme] = useState('Natal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [notificationType, setNotificationType] = useState<'error' | 'success'>('error')

  const isFormValid = recipient.trim().length > 0

  const handleGenerateMessage = useCallback(async () => {
    if (!isFormValid) {
      setNotification('Preencha todos os campos obrigatórios')
      setNotificationType('error')
      return
    }

    setLoading(true)
    setNotification('')
    setMessage(null)

    try {
      const res = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient: recipient.trim(),
          tone,
          theme,
        }),
      })
      const data = await res.json()

      if (data.success && data.message) {
        setMessage(data.message)
        setNotification('Mensagem gerada com sucesso!')
        setNotificationType('success')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setNotification(data.message || 'Erro ao gerar mensagem')
        setNotificationType('error')
      }
    } catch (err) {
      setNotification('Erro de conexão. Tente novamente.')
      setNotificationType('error')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [recipient, tone, theme, isFormValid])

  const handleSaveMessage = useCallback(async () => {
    if (!message) return

    try {
      const res = await fetch('/api/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient: recipient.trim(),
          tone,
          theme,
          message,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNotification('Mensagem salva com sucesso!')
        setNotificationType('success')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setNotification(data.message || 'Erro ao salvar')
        setNotificationType('error')
      }
    } catch (err) {
      setNotification('Erro ao salvar. Tente novamente.')
      setNotificationType('error')
    }
  }, [recipient, tone, theme, message])

  const handleDownloadMessage = () => {
    if (!message) return
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(message))
    element.setAttribute('download', `mensagem-${recipient.split(' ')[0].toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyMessage = () => {
    if (!message) return
    navigator.clipboard.writeText(message)
    setNotification('Mensagem copiada para a área de transferência!')
    setNotificationType('success')
    setTimeout(() => setNotification(''), 2000)
  }

  const left = (
    <>
      <h2 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">Detalhes da Mensagem</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Para quem?</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Ex: João" className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] placeholder-slate-400 dark:placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-red-600 transition" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Tom da Mensagem</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600 transition">
            <option>Calorosa</option>
            <option>Humorística</option>
            <option>Sentimental</option>
            <option>Inspiradora</option>
            <option>Profissional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#d4d4d4] mb-2">Tema</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-red-600 transition">
            <option>Natal</option>
            <option>Amizade</option>
            <option>Família</option>
            <option>Gratidão</option>
            <option>Motivação</option>
          </select>
        </div>

        {notification && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${notificationType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${notificationType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            <p className={`text-sm ${notificationType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{notification}</p>
          </div>
        )}

        <button onClick={handleGenerateMessage} disabled={loading || !isFormValid} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-[#3a3a3a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Gerando...</>) : (<><Sparkles className="w-5 h-5" />Gerar Mensagem</>) }
        </button>
      </div>
    </>
  )

  const right = !message ? (
    <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-12 shadow-lg h-full flex flex-col items-center justify-center text-center">
      <Mail className="w-16 h-16 text-slate-300 dark:text-[#3a3a3a] mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 dark:text-[#a3a3a3] mb-2">Nenhuma mensagem gerada</h3>
      <p className="text-sm text-slate-500 dark:text-[#888]">Preencha os detalhes e clique em "Gerar Mensagem" para criar uma mensagem mágica personalizada</p>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={handleSaveMessage} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">✓ Salvar</button>
        <button onClick={handleCopyMessage} className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Copy className="w-4 h-4" />Copiar</button>
        <button onClick={handleDownloadMessage} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Baixar</button>
      </div>

      <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-8 shadow-lg">
        <h3 className="text-lg font-sans font-bold text-slate-900 dark:text-[#f5f5f5] mb-4 pb-4 border-b-2 border-red-200 dark:border-red-900">Mensagem para {recipient}</h3>
        <div className="text-slate-700 dark:text-[#d4d4d4] whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {message}
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
        <p className="text-sm text-red-800 dark:text-red-300"><span className="font-semibold">Dica:</span> Você pode editar a mensagem antes de enviar para deixá-la ainda mais pessoal!</p>
      </div>
    </div>
  )

  return <ModuleLayout Icon={Mail} title="Mensagens Mágicas" subtitle="Crie mensagens de Natal personalizadas com IA" left={left} right={right} />
}

