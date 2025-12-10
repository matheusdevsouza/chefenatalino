'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDemo } from './DemoCards'
import { 
  BrainDemo, ShoppingListDemo, ScheduleDemo, 
  GuestsDemo, GiftSuggestionsDemo, SecretSantaDemo 
} from './DemoCards'
import { X } from 'lucide-react'

/**
 * Preview do card expandido. Anima entrada/saída com delays coordenados (750ms + 100ms).
 */
export function DemoPreview() {
  const { previewCard, setPreviewCard } = useDemo()
  const previewRef = useRef<HTMLDivElement>(null)
  const [cardReady, setCardReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  /**
   * Delays: 750ms (movimento/crescimento) + 100ms (entrada) antes de marcar card como pronto.
   */
  useEffect(() => {
    setIsVisible(false)
    setCardReady(false)
    
    if (previewCard) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => {
          setCardReady(true)
        }, 100)
      }, 750) 
      return () => clearTimeout(timer)
    }
  }, [previewCard])

  const handleClose = () => {
    setPreviewCard(null)
    setCardReady(false)
  }

  const renderPreviewCard = () => {
    if (!previewCard) return null
    
    const previewProps = { 
      isPreview: true, 
      cardReady,
      onClose: handleClose 
    }

    switch (previewCard) {
      case 'brain':
        return <BrainDemo {...previewProps} />
      case 'shopping':
        return <ShoppingListDemo {...previewProps} />
      case 'schedule':
        return <ScheduleDemo {...previewProps} />
      case 'guests':
        return <GuestsDemo {...previewProps} />
      case 'gifts':
        return <GiftSuggestionsDemo {...previewProps} />
      case 'secretSanta':
        return <SecretSantaDemo {...previewProps} />
      default:
        return null
    }
  }

  return (
    <div 
      ref={previewRef}
      data-preview-container
      className="hidden md:block h-full min-h-[600px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#3a3a3a] relative"
      style={{ pointerEvents: previewCard ? 'auto' : 'none' }}
    >
      {/* Área de placeholder sempre visível como background */}

      <div className="absolute inset-0 flex items-center justify-center">
        <p className={`text-slate-400 dark:text-[#a3a3a3] text-sm text-center transition-opacity duration-300 ${
          previewCard ? 'opacity-0' : 'opacity-100'
        }`}>
          Clique no botão "Iniciar Demo" para começar a demonstração.
        </p>
      </div>
      
      {/* Card que aparece e preenche todo o espaço por cima do background */}

      {previewCard && (
        <div 
          className={`absolute -inset-2 transition-all duration-400 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
          {renderPreviewCard()}
        </div>
      )}
    </div>
  )
}

