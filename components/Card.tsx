import React from 'react'

/**
 * Propriedades do componente Card.
 * 
 * @interface CardProps
 * @property {React.ReactNode} children - Conteúdo do card
 * @property {string} [className] - Classes CSS adicionais
 * @property {boolean} [hover=true] - Habilita efeito hover
 * @property {'default' | 'elevated' | 'subtle'} [variant='default'] - Variante visual
 * @property {boolean} [glow=false] - Adiciona efeito de brilho (não implementado ainda)
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
 * Características:
 * - 3 variantes: default (card padrão), elevated (elevado), subtle (sutil)
 * - Efeito hover opcional com transição suave
 * - Usa classes CSS customizadas definidas no globals.css
 * - Design responsivo e acessível
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
