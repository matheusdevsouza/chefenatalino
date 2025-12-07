import React from 'react'

/**
 * Propriedades do componente Input.
 * 
 * @interface InputProps
 * @property {string} label
 * @property {string} [type='text']
 * @property {string | number} value
 * @property {(value: string) => void} onChange
 * @property {string} [placeholder]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} [className]
 */

interface InputProps {
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  className?: string
}

/**
 * Componente de campo de entrada com design limpo e moderno.
 * 
 * Renderiza um input estilizado com estados de foco claros e feedback visual.
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
  className = '',
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-vermelho-escuro">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="
          w-full px-4 py-3 rounded-lg
          bg-white border border-vermelho-claro
          text-vermelho-escuro placeholder-vermelho-medio
          focus:outline-none 
          focus:border-vermelho-vibrante
          focus:ring-2 focus:ring-vermelho-vibrante/20
          transition-all duration-200
          hover:border-vermelho-medio
        "
      />
    </div>
  )
}
