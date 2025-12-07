import React from 'react'

/**
 * Propriedades do componente Card.
 * 
 * @interface CardProps
 * @property {React.ReactNode} children 
 * @property {string} [className]
 * @property {boolean} [hover=true]
 * @property {'default' | 'elevated' | 'subtle'} [variant='default']
 * @property {boolean} [glow=false]
 */
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'elevated' | 'subtle'
  glow?: boolean
}

/**
 * Componente de card com design limpo e moderno.
 * 
 * Renderiza um container estilizado com bordas sutis e sombras suaves.
 * Suporta múltiplas variantes visuais e efeitos de hover opcionais.
 * 
 * @param {CardProps} props 
 * @returns {JSX.Element} 
 */
export function Card({ 
  children, 
  className = '', 
  hover = true,
  variant = 'default',
  glow = false
}: CardProps) {
  const baseStyles = 'rounded-xl p-6'
  
  const variants = {
    default: 'card',
    elevated: 'card-elevated',
    subtle: 'bg-vermelho-clarissimo border border-vermelho-claro',
  }

  const hoverStyles = hover 
    ? 'card-hover cursor-pointer' 
    : ''

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
