'use client'

import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import { 
  Brain, ShoppingCart, Clock, Users, Gift, Users2,
  ArrowRight, Check, Loader2, Lock, Sparkles
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
}

const DemoContext = createContext<DemoContextType>({
  unlockedFeatures: new Set(['brain']),
  unlockFeature: () => {}
})

/**
 * Provider que gerencia quais demos estão desbloqueadas.
 * 
 * O primeiro card (brain) já começa desbloqueado. Os outros são liberados
 * conforme o usuário completa cada demo anterior.
 */

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set(['brain']))

  const unlockFeature = (feature: string) => {
    setUnlockedFeatures(prev => new Set(Array.from(prev).concat(feature)))
  }

  return (
    <DemoContext.Provider value={{ unlockedFeatures, unlockFeature }}>
      {children}
    </DemoContext.Provider>
  )
}

const useDemo = () => useContext(DemoContext)

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

export const BrainDemo = () => {
  const { unlockFeature } = useDemo()
  const [step, setStep] = useState<'idle' | 'user-typing' | 'sending' | 'ai-analyzing' | 'ai-typing' | 'complete'>('idle')

  const predefinedUserMessage = '8 adultos, 2 crianças, sem glúten, orçamento R$ 500'
  const predefinedAiResponse = 'Cardápio Gourmet Adaptado Gerado!\n✓ Entrada: Salada de rúcula com nozes\n✓ Prato principal: Peru assado sem glúten\n✓ Acompanhamentos: Batatas rústicas, arroz\n✓ Sobremesa: Mousse de chocolate\n✓ Bebidas: Suco natural, água'

  const handleStart = () => {
    setStep('user-typing')
  }

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

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <Brain className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">O Cérebro do Natal</h3>
      
      <div className="space-y-3 transition-all duration-300 flex-grow">
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
            <div className="bg-white/80 rounded-lg p-3 border border-red-100">
              <div className="text-xs text-slate-500 mb-1">Você:</div>
              <div className="text-sm text-slate-700">
                {step === 'user-typing' ? (
                  <Typewriter text={predefinedUserMessage} speed={30} />
                ) : (
                  predefinedUserMessage
                )}
              </div>
            </div>

            {step === 'sending' && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enviando para IA...</span>
              </div>
            )}

            {step === 'ai-analyzing' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                <span>IA Analisando suas preferências...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'complete') && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 text-xs text-red-600 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line">
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
                className="w-full text-xs text-red-600 hover:underline mt-2"
              >
                Ver novamente
              </button>
            )}
          </>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">A IA processa suas preferências em segundos</p>
    </div>
  )
}

/**
 * Demo do card "Lista Automática".
 * 
 * Mostra a lista de compras sendo gerada item por item, simulando
 * o cálculo automático de quantidades. Desbloqueia o cronograma ao final.
 */

export const ShoppingListDemo = () => {
  const { unlockedFeatures, unlockFeature } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'generating' | 'complete'>('locked')
  const [items, setItems] = useState<Array<{ name: string; qty: string }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleGenerate = () => {
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
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600">Lista Automática</h3>
        <p className="text-xs text-slate-500">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <ShoppingCart className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">Lista Automática</h3>
      
      <div className="transition-all duration-300 flex-grow">
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
          <div className="bg-white/80 rounded-lg p-4 border border-red-100 space-y-2">
            {items.map((item, idx) => {
              if (!item || !item.name || !item.qty) return null
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center animate-fadeIn text-sm"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-semibold text-red-600">{item.qty}</span>
                </div>
              )
            })}
            {step === 'generating' && (
              <div className="flex items-center gap-2 text-slate-500 text-xs mt-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Calculando quantidades...</span>
              </div>
            )}
            {step === 'complete' && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between font-semibold text-sm">
                  <span>Total Estimado:</span>
                  <span className="text-red-600">R$ 350,00</span>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-red-600 hover:underline mt-2"
                >
                  Gerar nova lista
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">Quantidades calculadas automaticamente</p>
    </div>
  )
}

/**
 * Demo do card "Cronograma".
 * 
 * Mostra a timeline de preparação sendo montada passo a passo,
 * com horários e atividades aparecendo sequencialmente.
 */

export const ScheduleDemo = () => {
  const { unlockedFeatures, unlockFeature } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'generating' | 'complete'>('locked')
  const [events, setEvents] = useState<Array<{ time: string; task: string }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleGenerate = () => {
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
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600">Cronograma</h3>
        <p className="text-xs text-slate-500">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <Clock className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">Cronograma</h3>
      
      <div className="transition-all duration-300 flex-grow">
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
          <div className="bg-white/80 rounded-lg p-4 border border-red-100 space-y-2">
            {events.map((event, idx) => {
              if (!event || !event.time || !event.task) return null
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 animate-slideIn text-sm"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <span className="font-bold text-red-600 w-16">{event.time}</span>
                  <span className={`text-slate-700 ${event.time === '00:00' ? 'font-semibold' : ''}`}>
                    {event.task}
                  </span>
                </div>
              )
            })}
            {step === 'generating' && (
              <div className="flex items-center gap-2 text-slate-500 text-xs mt-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Organizando timeline...</span>
              </div>
            )}
            {step === 'complete' && (
              <button
                onClick={handleReset}
                className="w-full text-xs text-red-600 hover:underline mt-3"
              >
                Criar novo cronograma
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">Timeline minuto a minuto</p>
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

export const GuestsDemo = () => {
  const { unlockedFeatures, unlockFeature } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'ai-analyzing' | 'ai-typing' | 'showing-guests' | 'complete'>('locked')
  const [guests, setGuests] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleStart = () => {
    setStep('ai-analyzing')
    setGuests([])
  }

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
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600">Gestão de Convidados</h3>
        <p className="text-xs text-slate-500">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <Users className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">Gestão de Convidados</h3>
      
      <div className="space-y-3 transition-all duration-300 flex-grow">
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
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                <span>IA Analisando confirmações...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'showing-guests' || step === 'complete') && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 text-xs text-red-600 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line">
                  {step === 'ai-typing' ? (
                    <Typewriter text={predefinedAiResponse} speed={15} />
                  ) : (
                    predefinedAiResponse
                  )}
                </div>
              </div>
            )}

            {(step === 'showing-guests' || step === 'complete') && guests.length > 0 && (
              <div className="bg-white/80 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-slate-600 mb-2 font-semibold">Lista de confirmados:</p>
                <div className="space-y-1">
                  {guests.map((guest, idx) => {
                    if (!guest) return null
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-red-50 rounded text-xs animate-fadeIn"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <span className="text-slate-700">{guest}</span>
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <button
                onClick={handleReset}
                className="w-full text-xs text-red-600 hover:underline mt-2"
              >
                Ver novamente
              </button>
            )}
          </>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">Acompanhe confirmações em tempo real</p>
    </div>
  )
}

/**
 * Demo do card "Sugestões de Presentes".
 * 
 * Simula a mesma animação do primeiro card: usuário digita o perfil
 * da pessoa, IA analisa e sugere presentes com links para compra.
 */

export const GiftSuggestionsDemo = () => {
  const { unlockedFeatures, unlockFeature } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'user-typing' | 'sending' | 'ai-analyzing' | 'ai-typing' | 'complete'>('locked')

  const predefinedUserMessage = 'Maria, 35 anos, ama cozinha'
  const predefinedAiResponse = 'Sugestões personalizadas:\n\n✓ Kit de facas profissionais\n  🔗 mercadolivre.com.br/kit-facas-pro\n  🔗 amazon.com.br/facas-profissionais\n\n✓ Livro de receitas gourmet\n  🔗 amazon.com.br/livro-receitas-gourmet\n  🔗 americanas.com.br/receitas-premium\n\n✓ Acessórios de cozinha premium\n  🔗 magazineluiza.com.br/acessorios-cozinha\n  🔗 casasbahia.com.br/cozinha-premium'

  useEffect(() => {
    if (unlockedFeatures.has('gifts')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  const handleStart = () => {
    setStep('user-typing')
  }

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

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600">Sugestões de Presentes</h3>
        <p className="text-xs text-slate-500">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <Gift className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">Sugestões de Presentes</h3>
      
      <div className="space-y-3 transition-all duration-300 flex-grow">
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
            <div className="bg-white/80 rounded-lg p-3 border border-red-100">
              <div className="text-xs text-slate-500 mb-1">Você:</div>
              <div className="text-sm text-slate-700">
                {step === 'user-typing' ? (
                  <Typewriter text={predefinedUserMessage} speed={30} />
                ) : (
                  predefinedUserMessage
                )}
              </div>
            </div>

            {step === 'sending' && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enviando para IA...</span>
              </div>
            )}

            {step === 'ai-analyzing' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                <span>IA Analisando perfil...</span>
              </div>
            )}

            {(step === 'ai-typing' || step === 'complete') && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 text-xs text-red-600 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold">IA:</span>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line">
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
                className="w-full text-xs text-red-600 hover:underline mt-2"
              >
                Analisar outro perfil
              </button>
            )}
          </>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">Sugestões personalizadas por IA</p>
    </div>
  )
}

/**
 * Demo do card "Amigo Secreto".
 * 
 * Usa os mesmos 10 nomes da gestão de convidados para fazer o sorteio.
 * Simula o embaralhamento e mostra os pares sendo formados.
 */

export const SecretSantaDemo = () => {
  const { unlockedFeatures } = useDemo()
  const [step, setStep] = useState<'locked' | 'idle' | 'shuffling' | 'complete'>('locked')
  const [pairs, setPairs] = useState<Array<{ from: string; to: string }>>([])

  const demoNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Fernanda', 'Lucas', 'Pedrinho', 'Sophia']

  useEffect(() => {
    if (unlockedFeatures.has('secretSanta')) {
      if (step === 'locked') {
        setStep('idle')
      }
    }
  }, [unlockedFeatures, step])

  const handleShuffle = () => {
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

  const handleReset = () => {
    setStep('idle')
    setPairs([])
  }

  if (step === 'locked') {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 relative overflow-hidden opacity-60">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-400 text-white rounded-lg flex items-center justify-center mb-4">
          <Users2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl mb-4 text-slate-600">Amigo Secreto</h3>
        <p className="text-xs text-slate-500">Complete a demo anterior para desbloquear</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center mb-4">
        <Users2 className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl mb-4 text-slate-900">Amigo Secreto</h3>
      
      <div className="transition-all duration-300 flex-grow flex flex-col">
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
          <div className="bg-white/80 rounded-lg p-4 border border-red-100 flex-grow flex flex-col">
            {step === 'shuffling' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600">Embaralhando e garantindo sorteio justo...</p>
              </div>
            )}

            {step === 'complete' && pairs.length > 0 && (
              <div className="space-y-2">
                {pairs.map((pair, idx) => {
                  if (!pair || !pair.from || !pair.to) return null
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded animate-fadeIn"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <span className="text-slate-700 text-sm flex-1 text-left">{pair.from}</span>
                      <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mx-1" />
                      <span className="text-slate-700 font-semibold text-sm flex-1 text-right">{pair.to}</span>
                    </div>
                  )
                })}
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-red-600 hover:underline mt-3"
                >
                  Realizar novo sorteio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-600 mt-auto pt-4">Sorteio automático e justo</p>
    </div>
  )
}
