import React from 'react'

/**
 * Propriedades do componente Button.
 * 
 * @interface ButtonProps
 * @property {React.ReactNode} children - Conteúdo do botão
 * @property {() => void} [onClick] - Handler de clique
 * @property {'primary' | 'secondary' | 'premium' | 'ghost'} [variant='primary'] - Variante visual
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Tamanho do botão
 * @property {boolean} [disabled=false] - Estado desabilitado
 * @property {string} [className] - Classes CSS adicionais
 * @property {'button' | 'submit' | 'reset'} [type='button'] - Tipo do botão HTML
 */

interface ButtonProps {
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'premium' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Componente de botão com design moderno e limpo.
 * 
 * Características:
 * - 4 variantes visuais: primary, secondary, premium, ghost
 * - 3 tamanhos: sm, md, lg
 * - Transições suaves e feedback visual (scale no active)
 * - Suporte completo a dark mode
 * - Estados de foco e desabilitado bem definidos
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
      dark:bg-red-600 dark:hover:bg-red-500
      dark:shadow-lg dark:hover:shadow-xl
    `,
    secondary: `
      bg-vermelho-clarissimo text-vermelho-escuro
      hover:bg-vermelho-claro
      focus:ring-vermelho-vibrante
      dark:bg-[#3a3a3a] dark:text-[#f5f5f5]
      dark:hover:bg-[#3a3a3a]
    `,
    premium: `
      bg-vermelho-vibrante text-white
      hover:bg-vermelho-hover
      focus:ring-vermelho-vibrante
      shadow-md hover:shadow-lg
      dark:bg-red-600 dark:hover:bg-red-500
      dark:shadow-xl dark:hover:shadow-2xl
    `,
    ghost: `
      bg-transparent text-vermelho-escuro
      hover:bg-vermelho-clarissimo
      focus:ring-vermelho-vibrante
      border border-vermelho-claro
      dark:text-[#d4d4d4] dark:border-[#3a3a3a]
      dark:hover:bg-[#2e2e2e]
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
