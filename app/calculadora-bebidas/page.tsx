import { CalculadoraBebidas } from '@/modules/CalculadoraBebidas'
import { ModuleHeader } from '@/components/ModuleHeader'
import { Wine } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Página do módulo Calculadora de Bebidas.
 * 
 * Renderiza a interface completa do módulo de cálculo de bebidas para eventos,
 * incluindo cabeçalho do módulo e o componente principal de cálculo.
 * Fornece navegação de retorno para a página inicial.
 */

export default function CalculadoraBebidasPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
        
        <ModuleHeader
          title="Calculadora de Bebidas"
          description="Calcule exatamente quantas bebidas você precisa para sua festa de Natal baseado no número de pessoas e duração do evento."
          icon={Wine}
        />
        <CalculadoraBebidas />
      </div>
    </div>
  )
}
