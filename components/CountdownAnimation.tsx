'use client'

import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

interface CountdownAnimationProps {
  progress: number
  onComplete?: () => void
}

export default function CountdownAnimation({ progress, onComplete }: CountdownAnimationProps) {
  const [currentCount, setCurrentCount] = useState<number | null>(null)
  const [showPronto, setShowPronto] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const countRef = useRef<HTMLDivElement>(null)
  const prontoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progress < 0.99 || hasStarted) {
      if (progress < 0.99) {
        setCurrentCount(null)
        setShowPronto(false)
        setHasStarted(false)
      }
      return
    }

    setHasStarted(true)

    const sequence = async () => {
      setCurrentCount(3)
      setShowPronto(false)
      
      if (countRef.current) {
        gsap.fromTo(countRef.current, 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      setCurrentCount(2)
      if (countRef.current) {
        gsap.to(countRef.current, { scale: 0, opacity: 0, duration: 0.2 })
        setTimeout(() => {
          if (countRef.current) {
            gsap.fromTo(countRef.current,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
            )
          }
        }, 200)
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      setCurrentCount(1)
      if (countRef.current) {
        gsap.to(countRef.current, { scale: 0, opacity: 0, duration: 0.2 })
        setTimeout(() => {
          if (countRef.current) {
            gsap.fromTo(countRef.current,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
            )
          }
        }, 200)
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      setCurrentCount(null)
      setShowPronto(true)
      
      if (prontoRef.current) {
        gsap.fromTo(prontoRef.current,
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.5, 
            ease: 'back.out(1.7)',
            onComplete: () => {
              if (onComplete) {
                setTimeout(onComplete, 1000)
              }
            }
          }
        )
      }
    }

    sequence()
  }, [progress, onComplete, hasStarted])

  if (progress < 0.99 && !hasStarted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {currentCount !== null && (
        <div
          ref={countRef}
          className="text-9xl md:text-[12rem] font-bold text-white drop-shadow-2xl"
          style={{
            fontFamily: 'var(--font-serif)',
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {currentCount}
        </div>
      )}
      
      {showPronto && (
        <div
          ref={prontoRef}
          className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          Pronto!
        </div>
      )}
    </div>
  )
}

