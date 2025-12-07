'use client'

import { ChefHat, Mail } from 'lucide-react'

/**
 * Footer reutilizável para todas as páginas
 */

export function Footer() {
  return (
    <footer className="bg-slate-50/50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
          {/* Seção da marca */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
              <span className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Chefe Natalino</span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mb-4 sm:mb-6">
              Planeje sua ceia de Natal completa com inteligência artificial. Cardápio personalizado, lista de compras e cronograma minuto-a-minuto.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="break-all sm:break-normal">suporte@chefenatalino.shop</span>
            </div>
          </div>
          
          {/* Produto */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Produto</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#demo" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Demo Interativa
                </a>
              </li>
              <li>
                <a href="/#precos" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="/#como-funciona" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="/#vantagens" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Vantagens
                </a>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Sugestões de Presentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Gerador de Amigo Secreto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Mensagens de Natal
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/#garantia" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  Garantia
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 hover:text-red-600 transition-colors">
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

          {/* Barra inferior */}
        <div className="pt-6 sm:pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
              © {new Date().getFullYear()} Chefe Natalino. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500">
              <a href="#" className="hover:text-red-600 transition-colors">Sobre</a>
              <a href="#" className="hover:text-red-600 transition-colors">Contato</a>
              <a href="#" className="hover:text-red-600 transition-colors">Blog</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

