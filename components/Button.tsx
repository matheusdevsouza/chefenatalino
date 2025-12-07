import React from 'react'

/**
 * Propriedades do componente Button.
 * 
 * @interface ButtonProps
 * @property {React.ReactNode} children
 * @property {() => void} [onClick] 
 * @property {'primary' | 'secondary' | 'premium' | 'ghost'} [variant='primary'] 
 * @property {'sm' | 'md' | 'lg'} [size='md'] 
 * @property {boolean} [disabled=false] 
 * @property {string} [className] 
 * @property {'button' | 'submit' | 'reset'} [type='button'] 
 */

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'premium' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Componente de botão com design moderno e limpo.
 * 
 * Implementa um botão interativo com cores sólidas e transições suaves.
 * Inclui diferentes variantes visuais para diferentes contextos de uso.
 * 
 * @param {ButtonProps} props 
 * @returns {JSX.Element} 
 */

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = `
    font-semibold rounded-full 
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `
  
  const variants = {
    primary: `
      bg-vermelho-vibrante text-white
      hover:bg-vermelho-hover
      focus:ring-vermelho-vibrante
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-vermelho-clarissimo text-vermelho-escuro
      hover:bg-vermelho-claro
      focus:ring-vermelho-vibrante
    `,
    premium: `
      bg-vermelho-vibrante text-white
      hover:bg-vermelho-hover
      focus:ring-vermelho-vibrante
      shadow-md hover:shadow-lg
    `,
    ghost: `
      bg-transparent text-vermelho-escuro
      hover:bg-vermelho-clarissimo
      focus:ring-vermelho-vibrante
      border border-vermelho-claro
    `,
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        flex items-center justify-center
      `}
    >
      {children}
    </button>
  )
}
