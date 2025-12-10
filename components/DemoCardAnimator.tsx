'use client'

import { useEffect, useRef } from 'react'
import { useDemo } from './DemoCards'

/**
 * Anima card: cria clone, move até centro (350ms), expande (400ms), remove após 750ms.
 */
export function useCardAnimation(cardId: string, isPreview: boolean) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { previewCard, setIsAnimating } = useDemo()
  const isMoving = previewCard === cardId && !isPreview
  const hasAnimated = useRef(false)
  const previousPreviewCard = useRef<string | null>(null)

  useEffect(() => {
    if (previousPreviewCard.current !== previewCard) {
      hasAnimated.current = false
      previousPreviewCard.current = previewCard
    }
  }, [previewCard])

  useEffect(() => {
    if (isMoving && cardRef.current && !hasAnimated.current) {
      hasAnimated.current = true
      const card = cardRef.current
      const previewContainer = document.querySelector('[data-preview-container]') as HTMLElement
      
      if (!previewContainer) {
        hasAnimated.current = false
        return
      }

      /**
       * Calcula posições do card original e do preview container.
       */
      const cardRect = card.getBoundingClientRect()
      const previewRect = previewContainer.getBoundingClientRect()
      
      /**
       * Cria clone do card para animação.
       * O clone é posicionado fixo na tela e animado até o preview.
       */
      const clone = card.cloneNode(true) as HTMLElement
      clone.style.position = 'fixed'
      clone.style.top = `${cardRect.top}px`
      clone.style.left = `${cardRect.left}px`
      clone.style.width = `${cardRect.width}px`
      clone.style.height = `${cardRect.height}px`
      clone.style.zIndex = '9999'
      clone.style.pointerEvents = 'none'
      clone.style.transformOrigin = 'center'
      clone.style.borderRadius = window.getComputedStyle(card).borderRadius
      clone.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)'
      document.body.appendChild(clone)

      card.style.opacity = '0'
      card.style.pointerEvents = 'none'

      setIsAnimating(true)

      const centerX = previewRect.left + previewRect.width / 2
      const centerY = previewRect.top + previewRect.height / 2
      const moveX = centerX - (cardRect.left + cardRect.width / 2)
      const moveY = centerY - (cardRect.top + cardRect.height / 2)

      /**
       * Double requestAnimationFrame garante que DOM foi atualizado antes de animar.
       */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
          clone.style.transform = `translate(${moveX}px, ${moveY}px)`
        })
      })

      /**
       * Expande para preencher preview. Usa 98% da escala para evitar sobreposição com bordas.
       */
      setTimeout(() => {
        const scaleX = previewRect.width / cardRect.width
        const scaleY = previewRect.height / cardRect.height
        const finalScale = Math.min(scaleX, scaleY) * 0.98

        clone.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        clone.style.transform = `translate(${moveX}px, ${moveY}px) scale(${finalScale})`
        clone.style.width = `${previewRect.width}px`
        clone.style.height = `${previewRect.height}px`
      }, 350)

      setTimeout(() => {
        clone.remove()
        setIsAnimating(false)
        hasAnimated.current = false
      }, 750)
    } else if (!isMoving && previewCard !== cardId) {
      /**
       * Quando o card não está mais no preview, restaura a opacidade.
       * Permite que o card seja clicado novamente.
       */
      hasAnimated.current = false
      if (cardRef.current) {
        cardRef.current.style.opacity = '1'
        cardRef.current.style.pointerEvents = 'auto'
      }
    }
  }, [isMoving, setIsAnimating])

  return cardRef
}
