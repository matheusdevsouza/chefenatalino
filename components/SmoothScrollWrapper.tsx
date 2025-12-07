'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let lenis: any = null
    let rafId: number | undefined
    let handleAnchorClick: ((e: MouseEvent) => void) | null = null

    handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href || href === '#') return
      
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement && lenis) {
        e.preventDefault()
        e.stopPropagation()
        
        lenis.scrollTo(targetElement, {
          offset: -80,
          duration: 1.5,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        })
      }
    }

    const timeoutId = setTimeout(() => {
      if (initializedRef.current) return

      import('lenis').then((LenisModule) => {
        try {
          const Lenis = LenisModule.default
          
          lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical' as const,
            gestureOrientation: 'vertical' as const,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
          })

          import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
            if (lenis) {
              let lastUpdate = 0
              const throttleMs = 16 // ~60fps para suavizar animações
              
              lenis.on('scroll', () => {
                const now = Date.now()
                if (now - lastUpdate >= throttleMs) {
                  ScrollTrigger.update()
                  lastUpdate = now
                }
              })
            }
          }).catch(() => {
          })

          const raf = (time: number) => {
            if (lenis) {
              lenis.raf(time)
              rafId = requestAnimationFrame(raf)
            }
          }

          rafId = requestAnimationFrame(raf)
          
          if (typeof window !== 'undefined') {
            (window as any).lenis = lenis
          }
          
          initializedRef.current = true
          
          if (handleAnchorClick) {
            document.addEventListener('click', handleAnchorClick, true)
          }
        } catch (error) {
          console.error('Erro ao inicializar Lenis:', error)
        }
      }).catch((error) => {
        console.error('Erro ao carregar Lenis:', error)
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (handleAnchorClick) {
        document.removeEventListener('click', handleAnchorClick, true)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      if (lenis) {
        try {
          lenis.destroy()
          if (typeof window !== 'undefined') {
            delete (window as any).lenis
          }
        } catch (e) {
        }
      }
      initializedRef.current = false
    }
  }, [pathname])

  return <>{children}</>
}

