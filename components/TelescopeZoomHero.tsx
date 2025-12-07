'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface TelescopeZoomHeroProps {
  mainImage: string
  smallImages: string[]
  maskImage?: string
  onProgressChange?: (progress: number) => void
}

export default function TelescopeZoomHero({ 
  mainImage, 
  smallImages = [],
  maskImage,
  onProgressChange
}: TelescopeZoomHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const leftWordRef = useRef<HTMLSpanElement>(null)
  const rightWordRef = useRef<HTMLSpanElement>(null)
  const frontImagesRef = useRef<HTMLDivElement[]>([])
  const smallImagesRef = useRef<HTMLImageElement[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const section = sectionRef.current
    let scrollTriggerInstance: ScrollTrigger | null = null
    let timeoutId: NodeJS.Timeout

    let progressRafId: number | null = null
    let lastProgress = -1
    
    const updateProgress = (progress: number) => {
      if (Math.abs(progress - lastProgress) < 0.005) return
      
      if (progressRafId) return
      
      progressRafId = requestAnimationFrame(() => {
        const easedProgress = gsap.parseEase('power1.inOut')(progress)
        section.style.setProperty('--progress', String(easedProgress))
        document.documentElement.style.setProperty('--telescope-progress', String(easedProgress))
        lastProgress = progress
        
        if (onProgressChange) {
          onProgressChange(easedProgress)
        }
        
        progressRafId = null
      })
    }

    const initAnimation = () => {
      section.style.setProperty('--progress', '0')
      document.documentElement.style.setProperty('--telescope-progress', '0')

      const frontImages = Array.from(section.querySelectorAll('.section__media__front')) as HTMLDivElement[]
      const smallImages = Array.from(section.querySelectorAll('.section__images img')) as HTMLImageElement[]

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            updateProgress(self.progress)
          }
        }
      })

      scrollTriggerInstance = timeline.scrollTrigger as ScrollTrigger

      if (smallImages.length > 0) {
        gsap.set(smallImages, {
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          force3D: true
        })

        timeline.to(smallImages, {
          z: '100vh',
          duration: 1,
          ease: 'power1.inOut',
          stagger: {
            amount: 0.2,
            from: 'center'
          }
        })
      }

      timeline.to(frontImages, {
        scale: 1,
        duration: 1,
        ease: 'power1.inOut',
        delay: 0.1
      }, 0.6)

      timeline.to(frontImages, {
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power1.inOut',
        delay: 0.4,
        stagger: {
          amount: 0.2,
          from: 'end'
        }
      }, 0.6)

    }

    timeoutId = setTimeout(() => {
      initAnimation()
    }, 100)

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 150)
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(resizeTimeout)
      if (progressRafId) {
        cancelAnimationFrame(progressRafId)
      }
      window.removeEventListener('resize', handleResize)
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === section) {
          trigger.kill()
        }
      })
    }
  }, [mainImage, smallImages, maskImage])

  return (
    <div 
      ref={sectionRef}
      className="telescope-section relative h-screen w-full overflow-hidden bg-slate-50/50"
      style={{ 
        '--progress': 0, 
        '--telescope-progress': 0,
        transform: 'translateZ(0)',
        willChange: 'transform'
      } as React.CSSProperties}
    >
      <div 
        ref={mediaRef}
        className="section__media absolute inset-0 w-full h-full z-[25] pointer-events-none"
        style={{
          opacity: mainImage ? 'var(--progress, 0)' : '0'
        }}
      >
        {mainImage ? (
          <>
            <div className="section__media__back absolute inset-0 w-full h-full">
              <img 
                src={mainImage} 
                alt="Hero" 
                className="absolute w-full h-full object-cover object-center"
              />
            </div>

            {[1, 0.85, 0.6, 0.45, 0.3, 0.15].map((scale, index) => (
              <div
                key={index}
                className={`section__media__front absolute inset-0 w-full h-full front-${index + 1}`}
              >
                <img 
                  src={mainImage} 
                  alt="Hero" 
                  className="absolute w-full h-full object-cover object-center"
                  style={{
                    maskImage: maskImage ? `url(${maskImage})` : undefined,
                    maskPosition: '50% 50%',
                    maskSize: 'cover',
                    WebkitMaskImage: maskImage ? `url(${maskImage})` : undefined,
                    WebkitMaskPosition: '50% 50%',
                    WebkitMaskSize: 'cover'
                  }}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-500/20 to-red-700/20" />
        )}
      </div>

    </div>
  )
}

function getImagePosition(index: number) {
  const positions = [
    { top: '15vw', left: '-3vw' },
    { top: '5vw', left: '20vw' },
    { top: '8vw', left: '26.5vw' },
    { top: '18vw', right: '18vw' },
    { top: '5vw', right: '10vw' },
    { bottom: '5vw', left: '10vw' },
    { bottom: '8vw', left: '22.5vw' },
    { bottom: '3vw', left: '45vw' },
    { bottom: '5vw', right: '15vw' },
    { bottom: '9vw', right: '7vw' }
  ]
  return positions[index] || { top: '50%', left: '50%' }
}

