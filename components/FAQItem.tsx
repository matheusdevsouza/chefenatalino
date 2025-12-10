'use client'

import { useState } from 'react'

interface FAQItemProps {
  question: string
  answer: string
  index: number
}

/**
 * Item individual do FAQ com animações de abertura e fechamento
 */
export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div
      className="faq-item bg-white dark:bg-[#2e2e2e] rounded-2xl border border-slate-200 dark:border-[#3a3a3a] hover:border-red-200 dark:hover:border-red-800 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 group overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={handleToggle}
        className="w-full p-6 cursor-pointer font-semibold text-slate-900 dark:text-[#f5f5f5] flex items-center justify-between list-none hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 text-left"
      >
        <span>{question}</span>
        <span className={`text-2xl font-bold text-red-600 dark:text-red-400 transition-all duration-300 ease-out flex-shrink-0 ml-4 transform ${isOpen ? 'rotate-45' : ''}`}>
          <span className="inline-block">+</span>
        </span>
      </button>
      <div className={`faq-content text-slate-600 dark:text-[#d4d4d4] border-t border-slate-100 dark:border-[#3a3a3a] ${isOpen ? 'faq-content-open' : 'faq-content-closed'}`}>
        <div className="px-6 pt-4 pb-6">
          <p className="leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

