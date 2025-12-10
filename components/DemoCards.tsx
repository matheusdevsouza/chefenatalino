'use client'

import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import { useCardAnimation } from './DemoCardAnimator'
import { 
  Brain, ShoppingCart, Clock, Users, Gift, Users2,
  ArrowRight, Check, Loader2, Lock, Sparkles, X
} from 'lucide-react'

/**
 * Controla quais funcionalidades estão desbloqueadas no sistema de demo.
 * 
 * Os cards vão sendo liberados conforme o usuário completa as demos anteriores,
 * criando uma experiência progressiva e engajante.
 */

interface DemoContextType {
  unlockedFeatures: Set<string>
  unlockFeature: (feature: string) => void
  previewCard: string | null
  setPreviewCard: (cardId: string | null) => void
  isAnimating: boolean
  setIsAnimating: (animating: boolean) => void
}

const DemoContext = createContext<DemoContextType>({
  unlockedFeatures: new Set(['brain']),
  unlockFeature: () => {},
  previewCard: null,
  setPreviewCard: () => {},
  isAnimating: false,
  setIsAnimating: () => {}
})

/**
 * Provider que gerencia quais demos estão desbloqueadas.
 * 
 * O primeiro card (brain) já começa desbloqueado. Os outros são liberados
 * conforme o usuário completa cada demo anterior.
 */

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set(['brain']))
  const [previewCard, setPreviewCard] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const unlockFeature = (feature: string) => {
    setUnlockedFeatures(prev => new Set(Array.from(prev).concat(feature)))
  }

  return (
    <DemoContext.Provider value={{ 
      unlockedFeatures, 
      unlockFeature,
      previewCard,
      setPreviewCard,
      isAnimating,
      setIsAnimating
    }}>
      {children}
    </DemoContext.Provider>
  )
}

export const useDemo = () => useContext(DemoContext)

/**
 * Simula o efeito de digitação em tempo real.
 * 
 * Usado nas demos para tornar a experiência mais realista, como se
 * alguém estivesse digitando na sua frente.
 */

const Typewriter = ({ text, speed = 30, onComplete, className = '' }: { 
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return <span className={className}>{displayedText}<span className="animate-pulse">|</span></span>
}

/**
 * Demo do card "O Cérebro do Natal".
 * 
 * Simula a interação: usuário digita preferências, IA analisa e gera
 * o cardápio. Ao completar, desbloqueia o próximo card.
 */

interface DemoProps {
  isPreview?: boolean
  cardReady?: boolean
  onClose?: () => void
}

export const BrainDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'idle' | 'user-typing' | 'sending' | 'ai-analyzing' | 'ai-typing' | 'complete'>('idle')
  const cardRef = useCardAnimation('brain', isPreview)
  const isInPreview = previewCard === 'brain'

  const predefinedUserMessage = '8 adultos, 2 crianças, sem glúten, orçamento R$ 500'
  const predefinedAiResponse = 'Cardápio Gourmet Adaptado Gerado!\n✓ Entrada: Salada de rúcula com nozes\n✓ Prato principal: Peru assado sem glúten\n✓ Acompanhamentos: Batatas rústicas, arroz\n✓ Sobremesa: Mousse de chocolate\n✓ Bebidas: Suco natural, água'

  const handleStart = () => {
    if (isPreview) {
      /**
       * Se já está no preview, inicia a animação diretamente.
       */
      if (cardReady) {
        setStep('user-typing')
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('brain')
    }
  }

  /**
   * Inicia a animação automaticamente quando o card estiver pronto no preview.
   */
  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('user-typing')
    }
  }, [isPreview, cardReady, step])

  useEffect(() => {
    if (step === 'user-typing') {
      const timer = setTimeout(() => {
        setStep('sending')
      }, predefinedUserMessage.length * 30 + 500)
      return () => clearTimeout(timer)
    }

    if (step === 'sending') {
      const timer = setTimeout(() => {
        setStep('ai-analyzing')
      }, 800)
      return () => clearTimeout(timer)
    }

    if (step === 'ai-analyzing') {
      const timer = setTimeout(() => {
        setStep('ai-typing')
      }, 1500)
      return () => clearTimeout(timer)
    }

    if (step === 'ai-typing') {
      const timer = setTimeout(() => {
        setStep('complete')
        unlockFeature('shopping')
      }, predefinedAiResponse.length * 20 + 1000)
      return () => clearTimeout(timer)
    }
  }, [step, unlockFeature])

  /**
   * Esconde o card original quando está no preview e não está animando.
   * Evita duplicação visual durante a animação.
   */
  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="brain"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        1
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <Brain className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>O Cérebro do Natal</h3>
      
      <div className={`space-y-3 flex-grow min-h-0 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Iniciar Demo
          </button>
        )}

        {(step === 'user-typing' || step === 'sending' || step === 'ai-analyzing' || step === 'ai-typing' || step === 'complete') && (
          <>
            <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-3 border border-red-100 dark:border-red-900/30">
              <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mb-1">Você:</div>
              <div className="text-sm text-slate-700 dark:text-[#d4d4d4]">
                {step === 'user-typing' ? (
                  <Typewriter text={predefinedUserMessage} speed={30} />
                ) : (
                  predefinedUserMessage
                )}
              </div>
            </div>

            {step === 'sending' && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-[#a3a3a3]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enviando para IA...</span>
              </div>
            )}

            {step === 'ai-analyzing' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#d4d4d4] bg-white/50 dark:bg-[#2e2e2e]/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                <span>IA Analisando suas preferências...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'complete') && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-900/30">
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div className="text-sm text-slate-700 dark:text-[#d4d4d4] whitespace-pre-line">
                  {step === 'ai-typing' ? (
                    <Typewriter text={predefinedAiResponse} speed={20} />
                  ) : (
                    predefinedAiResponse
                  )}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <button
                onClick={handleStart}
                className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
              >
                Ver novamente
              </button>
            )}
          </>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>A IA processa suas preferências em segundos</p>
    </div>
  )
}

/**
 * Demo do card "Lista Automática".
 * 
 * Mostra a lista de compras sendo gerada item por item, simulando
 * o cálculo automático de quantidades. Desbloqueia o cronograma ao final.
 */

export const ShoppingListDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'generating' | 'complete'>('locked')
  const [items, setItems] = useState<Array<{ name: string; qty: string }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useCardAnimation('shopping', isPreview)
  const isInPreview = previewCard === 'shopping'

  const demoItems = [
    { name: 'Rúcula', qty: '500g' },
    { name: 'Nozes', qty: '200g' },
    { name: 'Azeite de oliva', qty: '250ml' },
    { name: 'Limão', qty: '3 unidades' },
    { name: 'Queijo parmesão', qty: '250g' },
    { name: 'Tomate cereja', qty: '600g' },
    { name: 'Peru', qty: '4,5 kg' },
    { name: 'Temperos para peru', qty: '1 pacote' },
    { name: 'Batatas', qty: '2,5 kg' },
    { name: 'Azeite para batatas', qty: '150ml' },
    { name: 'Arroz', qty: '700g' },
    { name: 'Chocolate em pó', qty: '300g' },
    { name: 'Creme de leite', qty: '6 latas' },
    { name: 'Açúcar', qty: '400g' },
    { name: 'Suco natural', qty: '3 litros' },
    { name: 'Água mineral', qty: '4 litros' },
  ]

  useEffect(() => {
    if (unlockedFeatures.has('shopping')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      /**
       * Inicia a animação automaticamente quando o card estiver pronto no preview.
       */
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setStep('generating')
      setItems([])
      let index = 0

      intervalRef.current = setInterval(() => {
        if (index < demoItems.length && demoItems[index]) {
          setItems(prev => [...prev, demoItems[index]])
          index++
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setStep('complete')
          unlockFeature('schedule')
        }
      }, 400)
    }
  }, [isPreview, cardReady, step, unlockFeature])

  const handleGenerate = () => {
    if (isPreview) {
      /**
       * Se já está no preview, reinicia a animação.
       */
      if (cardReady) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        setStep('generating')
        setItems([])
        let index = 0

        intervalRef.current = setInterval(() => {
          if (index < demoItems.length && demoItems[index]) {
            setItems(prev => [...prev, demoItems[index]])
            index++
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setStep('complete')
            unlockFeature('schedule')
          }
        }, 400)
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('shopping')
    }
  }

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStep('idle')
    setItems([])
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2e2e2e] dark:to-[#1a1a1a] rounded-2xl p-6 border border-slate-300 dark:border-[#3a3a3a] relative overflow-hidden opacity-60 flex flex-col">
        <div className="absolute inset-0 backdrop-blur-[1.5px] z-[1] pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20">
          2
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-[#2e2e2e]/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400 dark:text-[#a3a3a3]" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600 dark:text-[#a3a3a3]">Lista Automática</h3>
        <div className="space-y-3 flex-grow min-h-0">
          <button
            disabled
            className="w-full bg-slate-400 text-white text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Gerar Lista de Compras
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-slate-300 dark:border-[#3a3a3a]">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col relative ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="shopping"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        2
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <ShoppingCart className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>Lista Automática</h3>
      
      <div className={`flex-grow min-h-0 flex flex-col ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleGenerate}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Gerar Lista de Compras
          </button>
        )}

        {(step === 'generating' || step === 'complete') && (
          <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-4 border border-red-100 dark:border-red-900/30 flex-grow min-h-0 flex flex-col">
            <div 
              className="flex-grow overflow-y-auto pr-2 max-h-[300px] overscroll-contain"
              style={{ pointerEvents: 'auto' }}
              onWheel={(e) => {
                const target = e.currentTarget
                const isScrollable = target.scrollHeight > target.clientHeight
                
                if (isScrollable) {
                  const isAtTop = target.scrollTop <= 1
                  const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
                  
                  /**
                   * Gerencia scroll inteligente:
                   * - Se está no topo e tentando scrollar para cima, ou no bottom e tentando scrollar para baixo,
                   *   permite que o scroll da página aconteça (não há mais scroll disponível no elemento)
                   * - Caso contrário, previne o scroll da página e aplica o scroll manualmente no elemento
                   */
                  if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                    return
                  } else {
                    e.preventDefault()
                    e.stopPropagation()
                    target.scrollTop += e.deltaY
                  }
                }
              }}
            >
              {items.map((item, idx) => {
                if (!item || !item.name || !item.qty) return null
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-start gap-4 animate-fadeIn text-sm py-1.5"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="text-slate-700 dark:text-[#d4d4d4] flex-1 break-words">{item.name}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400 whitespace-nowrap flex-shrink-0">{item.qty}</span>
                  </div>
                )
              })}
            </div>
            {step === 'generating' && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-[#a3a3a3] text-xs mt-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Calculando quantidades...</span>
              </div>
            )}
            {step === 'complete' && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#3a3a3a]">
                <div className="flex items-center justify-between font-semibold text-sm">
                  <span className="text-slate-700 dark:text-[#d4d4d4]">Total Estimado:</span>
                  <span className="text-red-600 dark:text-red-400">R$ 350,00</span>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
                >
                  Gerar nova lista
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>Quantidades calculadas automaticamente</p>
    </div>
  )
}

/**
 * Demo do card "Cronograma".
 * 
 * Mostra a timeline de preparação sendo montada passo a passo,
 * com horários e atividades aparecendo sequencialmente.
 */

export const ScheduleDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'generating' | 'complete'>('locked')
  const [events, setEvents] = useState<Array<{ time: string; task: string }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useCardAnimation('schedule', isPreview)
  const isInPreview = previewCard === 'schedule'

  const demoEvents = [
    { time: '14:00', task: 'Começar temperar o peru sem glúten' },
    { time: '18:30', task: 'Colocar peru no forno' },
    { time: '22:00', task: 'Preparar batatas rústicas' },
    { time: '22:30', task: 'Cozinhar arroz' },
    { time: '23:00', task: 'Preparar salada de rúcula com nozes' },
    { time: '23:30', task: 'Montar mousse de chocolate' },
    { time: '23:45', task: 'Preparar suco natural e servir água' },
    { time: '00:00', task: 'Servir a ceia!' },
  ]

  useEffect(() => {
    if (unlockedFeatures.has('schedule')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      /**
       * Inicia a animação automaticamente quando o card estiver pronto no preview.
       */
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setStep('generating')
      setEvents([])
      let index = 0

      intervalRef.current = setInterval(() => {
        if (index < demoEvents.length && demoEvents[index]) {
          setEvents(prev => [...prev, demoEvents[index]])
          index++
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setStep('complete')
          unlockFeature('guests')
        }
      }, 500)
    }
  }, [isPreview, cardReady, step, unlockFeature])

  const handleGenerate = () => {
    if (isPreview) {
      /**
       * Se já está no preview, reinicia a animação.
       */
      if (cardReady) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        setStep('generating')
        setEvents([])
        let index = 0

        intervalRef.current = setInterval(() => {
          if (index < demoEvents.length && demoEvents[index]) {
            setEvents(prev => [...prev, demoEvents[index]])
            index++
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setStep('complete')
            unlockFeature('guests')
          }
        }, 500)
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('schedule')
    }
  }

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStep('idle')
    setEvents([])
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2e2e2e] dark:to-[#1a1a1a] rounded-2xl p-6 border border-slate-300 dark:border-[#3a3a3a] relative overflow-hidden opacity-60 flex flex-col">
        <div className="absolute inset-0 backdrop-blur-[1.5px] z-[1] pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20">
          3
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-[#2e2e2e]/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400 dark:text-[#a3a3a3]" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600 dark:text-[#a3a3a3]">Cronograma</h3>
        <div className="transition-all duration-300 flex-grow min-h-0 flex flex-col">
          <button
            disabled
            className="w-full bg-slate-400 text-white text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Criar Cronograma
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-slate-300 dark:border-[#3a3a3a]">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col relative ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="schedule"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        3
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <Clock className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>Cronograma</h3>
      
      <div className={`flex-grow min-h-0 flex flex-col ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleGenerate}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Criar Cronograma
          </button>
        )}

        {(step === 'generating' || step === 'complete') && (
          <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-4 border border-red-100 dark:border-red-900/30 space-y-2 flex-grow min-h-0 flex flex-col">
            <div 
              className="space-y-2 flex-grow overflow-y-auto pr-1 max-h-[300px] overscroll-contain" 
              style={{ pointerEvents: 'auto' }}
              onWheel={(e) => {
                const target = e.currentTarget
                const isScrollable = target.scrollHeight > target.clientHeight
                
                if (isScrollable) {
                  const isAtTop = target.scrollTop <= 1
                  const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
                  
                  /**
                   * Gerencia scroll inteligente:
                   * - Se está no topo e tentando scrollar para cima, ou no bottom e tentando scrollar para baixo,
                   *   permite que o scroll da página aconteça (não há mais scroll disponível no elemento)
                   * - Caso contrário, previne o scroll da página e aplica o scroll manualmente no elemento
                   */
                  if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                    return
                  } else {
                    e.preventDefault()
                    e.stopPropagation()
                    target.scrollTop += e.deltaY
                  }
                }
              }}
            >
              {events.map((event, idx) => {
                if (!event || !event.time || !event.task) return null
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 animate-slideIn text-sm"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="font-bold text-red-600 dark:text-red-400 w-16">{event.time}</span>
                    <span className={`text-slate-700 dark:text-[#d4d4d4] ${event.time === '00:00' ? 'font-semibold' : ''}`}>
                      {event.task}
                    </span>
                  </div>
                )
              })}
            </div>
            {step === 'generating' && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-[#a3a3a3] text-xs mt-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Organizando timeline...</span>
              </div>
            )}
            {step === 'complete' && (
              <button
                onClick={handleReset}
                className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-3"
              >
                Criar novo cronograma
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>Timeline minuto a minuto</p>
    </div>
  )
}

/**
 * Demo do card "Gestão de Convidados".
 * 
 * Começa com o botão. Ao clicar, mostra a IA analisando confirmações
 * e depois exibe a lista de convidados aparecendo um por um.
 * Total de 10 pessoas: 8 adultos e 2 crianças.
 */

export const GuestsDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'ai-analyzing' | 'ai-typing' | 'showing-guests' | 'complete'>('locked')
  const [guests, setGuests] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useCardAnimation('guests', isPreview)
  const isInPreview = previewCard === 'guests'

  const demoGuests = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Fernanda', 'Lucas', 'Pedrinho', 'Sophia']
  const predefinedAiResponse = 'Total confirmados: 10\n✓ 8 adultos\n✓ 2 crianças'

  useEffect(() => {
    if (unlockedFeatures.has('guests')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      /**
       * Inicia a animação automaticamente quando o card estiver pronto no preview.
       */
      setStep('ai-analyzing')
      setGuests([])
    }
  }, [isPreview, cardReady, step])

  useEffect(() => {
    if (step === 'ai-analyzing') {
      const timer = setTimeout(() => {
        setStep('ai-typing')
      }, 1500)
      return () => clearTimeout(timer)
    }

    if (step === 'ai-typing') {
      const timer = setTimeout(() => {
        setStep('showing-guests')
        let index = 0
        intervalRef.current = setInterval(() => {
          if (index < demoGuests.length) {
            setGuests(prev => [...prev, demoGuests[index]])
            index++
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setStep('complete')
            unlockFeature('gifts')
          }
        }, 400)
      }, predefinedAiResponse.length * 15 + 1000)
      return () => clearTimeout(timer)
    }
  }, [step, unlockFeature])

  const handleStart = () => {
    if (isPreview) {
      /**
       * Se já está no preview, reinicia a animação.
       */
      if (cardReady) {
        setStep('ai-analyzing')
        setGuests([])
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('guests')
    }
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStep('idle')
    setGuests([])
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2e2e2e] dark:to-[#1a1a1a] rounded-2xl p-6 border border-slate-300 dark:border-[#3a3a3a] relative overflow-hidden opacity-60 flex flex-col">
        <div className="absolute inset-0 backdrop-blur-[1.5px] z-[1] pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20">
          4
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-[#2e2e2e]/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400 dark:text-[#a3a3a3]" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600 dark:text-[#a3a3a3]">Gestão de Convidados</h3>
        <div className="space-y-3 transition-all duration-300 flex-grow min-h-0 flex flex-col">
          <button
            disabled
            className="w-full bg-slate-400 text-white text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Ver Confirmações
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-slate-300 dark:border-[#3a3a3a]">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col relative ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="guests"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        4
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <Users className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>Gestão de Convidados</h3>
      
      <div className={`space-y-3 flex-grow min-h-0 flex flex-col ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Ver Confirmações
          </button>
        )}

        {(step === 'ai-analyzing' || step === 'ai-typing' || step === 'showing-guests' || step === 'complete') && (
          <>
            {step === 'ai-analyzing' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#d4d4d4] bg-white/50 dark:bg-[#2e2e2e]/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                <span>IA Analisando confirmações...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'showing-guests' || step === 'complete') && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-900/30">
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div className="text-sm text-slate-700 dark:text-[#d4d4d4] whitespace-pre-line">
                  {step === 'ai-typing' ? (
                    <Typewriter text={predefinedAiResponse} speed={15} />
                  ) : (
                    predefinedAiResponse
                  )}
                </div>
              </div>
            )}

            {(step === 'showing-guests' || step === 'complete') && guests.length > 0 && (
              <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-3 border border-red-100 dark:border-red-900/30 flex-grow min-h-0 flex flex-col">
                <p className="text-xs text-slate-600 dark:text-[#d4d4d4] mb-2 font-semibold">Lista de confirmados:</p>
                <div 
                  className="space-y-1 flex-grow overflow-y-auto pr-1 max-h-[200px] overscroll-contain" 
                  style={{ pointerEvents: 'auto' }}
                  onWheel={(e) => {
                    const target = e.currentTarget
                    const isScrollable = target.scrollHeight > target.clientHeight
                    const isAtTop = target.scrollTop === 0
                    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
                    
                    if (isScrollable && ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
                      e.preventDefault()
                    } else if (isScrollable) {
                      e.stopPropagation()
                    }
                  }}
                >
                  {guests.map((guest, idx) => {
                    if (!guest) return null
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs animate-fadeIn"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <span className="text-slate-700 dark:text-[#d4d4d4]">{guest}</span>
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <button
                onClick={handleReset}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
              >
                Ver novamente
              </button>
            )}
          </>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>Acompanhe confirmações em tempo real</p>
    </div>
  )
}

/**
 * Demo do card "Sugestões de Presentes".
 * 
 * Simula a mesma animação do primeiro card: usuário digita o perfil
 * da pessoa, IA analisa e sugere presentes com links para compra.
 */

export const GiftSuggestionsDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'user-typing' | 'sending' | 'ai-analyzing' | 'ai-typing' | 'complete'>('locked')
  const cardRef = useCardAnimation('gifts', isPreview)
  const isInPreview = previewCard === 'gifts'

  const predefinedUserMessage = 'Maria, 35 anos, ama cozinha'
  const predefinedAiResponse = 'Sugestões personalizadas:\n\n✓ Kit de facas profissionais\n  🔗 mercadolivre.com.br/kit-facas-pro\n  🔗 amazon.com.br/facas-profissionais\n\n✓ Livro de receitas gourmet\n  🔗 amazon.com.br/livro-receitas-gourmet\n  🔗 americanas.com.br/receitas-premium\n\n✓ Acessórios de cozinha premium\n  🔗 magazineluiza.com.br/acessorios-cozinha\n  🔗 casasbahia.com.br/cozinha-premium'

  useEffect(() => {
    if (unlockedFeatures.has('gifts')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      /**
       * Inicia a animação automaticamente quando o card estiver pronto no preview.
       */
      setStep('user-typing')
    }
  }, [isPreview, cardReady, step])

  useEffect(() => {
    if (step === 'user-typing') {
      const timer = setTimeout(() => {
        setStep('sending')
      }, predefinedUserMessage.length * 30 + 500)
      return () => clearTimeout(timer)
    }

    if (step === 'sending') {
      const timer = setTimeout(() => {
        setStep('ai-analyzing')
      }, 800)
      return () => clearTimeout(timer)
    }

    if (step === 'ai-analyzing') {
      const timer = setTimeout(() => {
        setStep('ai-typing')
      }, 1500)
      return () => clearTimeout(timer)
    }

    if (step === 'ai-typing') {
      const timer = setTimeout(() => {
        setStep('complete')
        unlockFeature('secretSanta')
      }, predefinedAiResponse.length * 20 + 1000)
      return () => clearTimeout(timer)
    }
  }, [step, unlockFeature])

  const handleStart = () => {
    if (isPreview) {
      /**
       * Se já está no preview, reinicia a animação.
       */
      if (cardReady) {
        setStep('user-typing')
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('gifts')
    }
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2e2e2e] dark:to-[#1a1a1a] rounded-2xl p-6 border border-slate-300 dark:border-[#3a3a3a] relative overflow-hidden opacity-60 flex flex-col">
        <div className="absolute inset-0 backdrop-blur-[1.5px] z-[1] pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20">
          5
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-[#2e2e2e]/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400 dark:text-[#a3a3a3]" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600 dark:text-[#a3a3a3]">Sugestões de Presentes</h3>
        <div className="space-y-3 transition-all duration-300 flex-grow min-h-0 flex flex-col">
          <button
            disabled
            className="w-full bg-slate-400 text-white text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Analisar Perfil
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-slate-300 dark:border-[#3a3a3a]">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col relative ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="gifts"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        5
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <Gift className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>Sugestões de Presentes</h3>
      
      <div className={`space-y-3 flex-grow min-h-0 flex flex-col ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Analisar Perfil
          </button>
        )}

        {(step === 'user-typing' || step === 'sending' || step === 'ai-analyzing' || step === 'ai-typing' || step === 'complete') && (
          <>
            <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-3 border border-red-100 dark:border-red-900/30">
              <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mb-1">Você:</div>
              <div className="text-sm text-slate-700 dark:text-[#d4d4d4]">
                {step === 'user-typing' ? (
                  <Typewriter text={predefinedUserMessage} speed={30} />
                ) : (
                  predefinedUserMessage
                )}
              </div>
            </div>

            {step === 'sending' && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-[#a3a3a3]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enviando para IA...</span>
              </div>
            )}

            {step === 'ai-analyzing' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#d4d4d4] bg-white/50 dark:bg-[#2e2e2e]/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                <span>IA Analisando perfil...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'complete') && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-900/30 flex-grow min-h-0 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div 
                  className="text-sm text-slate-700 dark:text-[#d4d4d4] whitespace-pre-line overflow-y-auto pr-1 max-h-[250px] overscroll-contain" 
                  style={{ pointerEvents: 'auto' }}
                  onWheel={(e) => {
                    const target = e.currentTarget
                    const isScrollable = target.scrollHeight > target.clientHeight
                    const isAtTop = target.scrollTop === 0
                    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
                    
                    if (isScrollable && ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
                      e.preventDefault()
                    } else if (isScrollable) {
                      e.stopPropagation()
                    }
                  }}
                >
                  {step === 'ai-typing' ? (
                    <Typewriter text={predefinedAiResponse} speed={20} />
                  ) : (
                    predefinedAiResponse
                  )}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <button
                onClick={handleStart}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
              >
                Analisar outro perfil
              </button>
            )}
          </>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>Sugestões personalizadas por IA</p>
    </div>
  )
}

/**
 * Demo do card "Amigo Secreto".
 * 
 * Usa os mesmos 10 nomes da gestão de convidados para fazer o sorteio.
 * Simula o embaralhamento e mostra os pares sendo formados.
 */

export const SecretSantaDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, setPreviewCard, previewCard, isAnimating } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'shuffling' | 'complete'>('locked')
  const [pairs, setPairs] = useState<Array<{ from: string; to: string }>>([])
  const cardRef = useCardAnimation('secretSanta', isPreview)
  const isInPreview = previewCard === 'secretSanta'

  const demoNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Fernanda', 'Lucas', 'Pedrinho', 'Sophia']

  useEffect(() => {
    if (unlockedFeatures.has('secretSanta')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      /**
       * Inicia a animação automaticamente quando o card estiver pronto no preview.
       */
      setStep('shuffling')
      setPairs([])
      
      setTimeout(() => {
        const shuffled = [...demoNames].sort(() => Math.random() - 0.5)
        const newPairs = demoNames.map((name, idx) => ({
          from: name,
          to: shuffled[idx] === name ? shuffled[(idx + 1) % demoNames.length] : shuffled[idx]
        }))
        setPairs(newPairs)
        setStep('complete')
      }, 1500)
    }
  }, [isPreview, cardReady, step])

  const handleShuffle = () => {
    if (isPreview) {
      /**
       * Se já está no preview, reinicia a animação.
       */
      if (cardReady) {
        setStep('shuffling')
        setPairs([])
        
        setTimeout(() => {
          const shuffled = [...demoNames].sort(() => Math.random() - 0.5)
          const newPairs = demoNames.map((name, idx) => ({
            from: name,
            to: shuffled[idx] === name ? shuffled[(idx + 1) % demoNames.length] : shuffled[idx]
          }))
          setPairs(newPairs)
          setStep('complete')
        }, 1500)
      }
    } else {
      /**
       * Move o card para o preview para iniciar a animação.
       */
      setPreviewCard('secretSanta')
    }
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />
  }

  const handleReset = () => {
    setStep('idle')
    setPairs([])
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2e2e2e] dark:to-[#1a1a1a] rounded-2xl p-6 border border-slate-300 dark:border-[#3a3a3a] relative overflow-hidden opacity-60 flex flex-col">
        <div className="absolute inset-0 backdrop-blur-[1.5px] z-[1] pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20">
          6
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-[#2e2e2e]/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400 dark:text-[#a3a3a3]" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Users2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600 dark:text-[#a3a3a3]">Amigo Secreto</h3>
        <div className="transition-all duration-300 flex-grow min-h-0 flex flex-col">
          <button
            disabled
            className="w-full bg-slate-400 text-white text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Sortear Amigo Secreto
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-slate-300 dark:border-[#3a3a3a]">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col relative ${
        isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
      } ${isPreview ? 'demo-card-preview' : ''}`}
      data-card-id="secretSanta"
    >
      {isPreview && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 bg-white/90 dark:bg-[#2e2e2e]/90 hover:bg-white dark:hover:bg-[#2e2e2e] rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
            cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
          }`}
          style={{ animationDelay: cardReady ? '0s' : '0s' }}
        >
          <X className="w-5 h-5 text-slate-600 dark:text-[#d4d4d4]" />
        </button>
      )}
      <div className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.03s' : '0s' }}>
        6
      </div>
      <div className={`w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.06s' : '0s' }}>
        <Users2 className="w-6 h-6" />
      </div>
      <h3 className={`font-serif text-xl mb-4 text-slate-900 dark:text-[#f5f5f5] ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.09s' : '0s' }}>Amigo Secreto</h3>
      
      <div className={`transition-all duration-300 flex-grow min-h-0 flex flex-col ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.12s' : '0s' }}>
        {step === 'idle' && (
          <button
            onClick={handleShuffle}
            className="w-full bg-red-600 text-white text-sm py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Sortear Amigo Secreto
          </button>
        )}

        {(step === 'shuffling' || (step === 'complete' && pairs.length > 0)) && (
          <div className="bg-white/80 dark:bg-[#2e2e2e]/80 rounded-lg p-4 border border-red-100 dark:border-red-900/30 flex-grow min-h-0 flex flex-col">
            {step === 'shuffling' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-[#d4d4d4]">Embaralhando e garantindo sorteio justo...</p>
              </div>
            )}

            {step === 'complete' && pairs.length > 0 && (
              <div className="flex-grow min-h-0 flex flex-col">
                <div 
                  className="space-y-2 flex-grow overflow-y-auto pr-1 max-h-[300px] overscroll-contain" 
                  style={{ pointerEvents: 'auto' }}
                  onWheel={(e) => {
                    const target = e.currentTarget
                    const isScrollable = target.scrollHeight > target.clientHeight
                    const isAtTop = target.scrollTop === 0
                    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
                    
                    if (isScrollable && ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
                      e.preventDefault()
                    } else if (isScrollable) {
                      e.stopPropagation()
                    }
                  }}
                >
                  {pairs.map((pair, idx) => {
                    if (!pair || !pair.from || !pair.to) return null
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded animate-fadeIn"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <span className="text-slate-700 dark:text-[#d4d4d4] text-sm flex-1 text-left">{pair.from}</span>
                        <ArrowRight className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mx-1" />
                        <span className="text-slate-700 dark:text-[#d4d4d4] font-semibold text-sm flex-1 text-right">{pair.to}</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:underline mt-3"
                >
                  Realizar novo sorteio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className={`text-xs text-slate-600 dark:text-[#a3a3a3] mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`} style={{ animationDelay: cardReady ? '0.15s' : '0s' }}>Sorteio automático e justo</p>
    </div>
  )
}
