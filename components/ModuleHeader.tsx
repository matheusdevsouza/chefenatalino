import React from 'react'
import { LucideIcon } from 'lucide-react'

/**
 * Propriedades do componente ModuleHeader.
 * 
 * @interface ModuleHeaderProps
 * @property {string} title 
 * @property {string} description 
 * @property {LucideIcon} icon 
 */

interface ModuleHeaderProps {
  title: string
  description: string
  icon: LucideIcon
}

/**
 * Componente de cabeçalho para páginas de módulos.
 * 
 * Renderiza um cabeçalho limpo com ícone, título e descrição formatada.
 * 
 * @param {ModuleHeaderProps} props 
 * @returns {JSX.Element} 
 */

export function ModuleHeader({ title, description, icon: Icon }: ModuleHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-lg bg-vermelho-vibrante/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-vermelho-vibrante" />
        </div>
      </div>
      
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vermelho-escuro mb-4">
        {title}
      </h1>
      <p className="text-lg sm:text-xl text-vermelho-hover max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  )
}
