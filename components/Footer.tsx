'use client'

import Image from 'next/image'
import { Mail } from 'lucide-react'

/**
 * Footer reutilizável para todas as páginas.
 * 
 * Estrutura:
 * - Seção da marca com logo e descrição
 * - Links organizados em colunas (Produto, Recursos, Legal)
 * - Barra inferior com copyright e links adicionais
 * - Design responsivo com grid adaptativo
 */

export function Footer() {
  return (
    <footer className="bg-slate-50/50 dark:bg-[#1a1a1a]/50 border-t border-slate-200 dark:border-[#3a3a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
          {/* Seção da marca com logo, descrição e contato */}

          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Image
                src="/logo.png"
                alt="Chefe Natalino"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="font-serif font-bold text-xl sm:text-2xl text-slate-900 dark:text-[#f5f5f5]">Chefe Natalino</span>
            </div>
            <p className="text-slate-600 dark:text-[#a3a3a3] text-xs sm:text-sm leading-relaxed max-w-sm mb-4 sm:mb-6">
              Planeje sua ceia de Natal completa com inteligência artificial. Cardápio personalizado, lista de compras e cronograma minuto-a-minuto.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3]">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="break-all sm:break-normal">exemplo@dominio.com.br</span>
            </div>
          </div>
          
          {/* Links da seção Produto */}

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-4 text-sm uppercase tracking-wider">Produto</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#demo" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Demo Interativa
                </a>
              </li>
              <li>
                <a href="/#precos" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="/#como-funciona" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="/#vantagens" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Vantagens
                </a>
              </li>
            </ul>
          </div>

          {/* Links da seção Recursos */}

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-4 text-sm uppercase tracking-wider">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Sugestões de Presentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Gerador de Amigo Secreto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Mensagens de Natal
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Links da seção Legal */}

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-[#f5f5f5] mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/#garantia" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Garantia
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-600 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

          {/* Barra inferior com copyright e links adicionais */}

        <div className="pt-6 sm:pt-8 border-t border-slate-200 dark:border-[#3a3a3a]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3] text-center sm:text-left">
              © {new Date().getFullYear()} Chefe Natalino. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3]">
              <a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Sobre</a>
              <a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contato</a>
              <a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Blog</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

