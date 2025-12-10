import { MensagensMagicas } from '@/modules/MensagensMagicas'
import { ModuleHeader } from '@/components/ModuleHeader'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Página do módulo Mensagens Mágicas.
 * 
 * Renderiza a interface completa do módulo de geração de mensagens personalizadas
 * com IA, incluindo cabeçalho do módulo e o componente principal de geração.
 * Fornece navegação de retorno para a página inicial.
 */

export default function MensagensMagicasPage() {
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
          title="Mensagens Mágicas"
          description="Gere mensagens personalizadas de Natal com inteligência artificial. Perfeitas para enviar no WhatsApp para seus familiares e amigos."
          icon={MessageSquare}
        />
        <MensagensMagicas />
      </div>
    </div>
  )
}
