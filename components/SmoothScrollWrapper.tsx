'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Adiciona scroll suave usando Lenis. Integra com GSAP ScrollTrigger e intercepta links âncora.
 */
export default function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initializedRef = useRef(false)

  /**
   * Aguarda 100ms antes de carregar Lenis para evitar conflitos. Integra com ScrollTrigger.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let lenis: any = null
    let rafId: number | undefined
    let handleAnchorClick: ((e: MouseEvent) => void) | null = null

    /**
     * Intercepta cliques em links âncora (#). Offset -80px compensa header fixo.
     */
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

          /**
           * Integra Lenis com GSAP ScrollTrigger.
           * 
           * Atualiza ScrollTrigger quando Lenis faz scroll, com throttle de 16ms
           * para evitar atualizações excessivas (60fps = ~16ms por frame).
           */
          import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
            if (lenis) {
              let lastUpdate = 0
              const throttleMs = 16
              
              lenis.on('scroll', () => {
                const now = Date.now()
                if (now - lastUpdate >= throttleMs) {
                  ScrollTrigger.update()
                  lastUpdate = now
                }
              })
            }
          }).catch(() => {
            /**
             * ScrollTrigger é opcional, não quebra se não estiver disponível.
             */
          })

          /**
           * Loop de animação do Lenis.
           * 
           * Chama lenis.raf() a cada frame para atualizar posição do scroll.
           * Continua até que lenis seja destruído.
           */
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

    /**
     * Cleanup: remove listeners e destroi Lenis.
     * 
     * Executado quando:
     * - Componente desmonta
     * - Rota muda (pathname muda)
     */
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
          /**
           * Ignora erros no cleanup para não quebrar o processo de limpeza.
           */
        }
      }
      initializedRef.current = false
    }
  }, [pathname])

  return <>{children}</>
}

