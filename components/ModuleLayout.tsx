import React from 'react'
import { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
  Icon?: any
  left: React.ReactNode
  right: React.ReactNode
}

export default function ModuleLayout({ title, subtitle, Icon, left, right }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1a1a] dark:to-[#1a1a1a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              {Icon ? <Icon className="w-6 h-6 text-red-600 dark:text-red-400" /> : null}
            </div>
            <div>
              <h1 className="text-4xl font-sans font-bold text-slate-900 dark:text-[#f5f5f5]">{title}</h1>
              {subtitle ? <p className="text-slate-600 dark:text-[#a3a3a3]">{subtitle}</p> : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#2e2e2e] rounded-2xl p-6 shadow-lg sticky top-6" style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
              {left}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              {right}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
