import React from 'react'

/**
 * Propriedades do componente Input.
 * 
 * @interface InputProps
 * @property {string} label - Label do campo
 * @property {string} [type='text'] - Tipo do input HTML
 * @property {string | number} value - Valor controlado
 * @property {(value: string) => void} onChange - Handler de mudança
 * @property {string} [placeholder] - Placeholder do input
 * @property {number} [min] - Valor mínimo (para inputs numéricos)
 * @property {number} [max] - Valor máximo (para inputs numéricos)
 * @property {number} [step] - Incremento (para inputs numéricos)
 * @property {string} [className] - Classes CSS adicionais
 */

interface InputProps {
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  className?: string
}

/**
 * Componente de campo de entrada com design limpo e moderno.
 * 
 * Características:
 * - Label integrado acima do input
 * - Estados de foco com ring e border destacados
 * - Feedback visual em hover
 * - Suporte completo a dark mode
 * - Suporta diferentes tipos de input (text, number, etc.)
 * 
 * @param {InputProps} props 
 * @returns {JSX.Element} 
 */

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  className = '',
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-vermelho-escuro dark:text-[#d4d4d4]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="
          w-full px-4 py-3 rounded-lg
          bg-white border border-vermelho-claro
          text-vermelho-escuro placeholder-vermelho-medio
          focus:outline-none 
          focus:border-vermelho-vibrante
          focus:ring-2 focus:ring-vermelho-vibrante/20
          transition-all duration-200
          hover:border-vermelho-medio
          dark:bg-[#2e2e2e] dark:border-[#3a3a3a]
          dark:text-[#f5f5f5] dark:placeholder-[#a3a3a3]
          dark:focus:border-red-500 dark:focus:ring-red-500/20
          dark:hover:border-[#525252]
        "
      />
    </div>
  )
}
