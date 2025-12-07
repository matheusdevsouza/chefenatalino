'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import type { Testimonial } from '@/database/types'

/**
 * Exibe os depoimentos buscados do banco de dados
 */

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?limit=10')
        const data = await response.json()
        if (data.success) {
          setTestimonials(data.testimonials)
        }
      } catch (error) {
        console.error('Erro ao buscar testimonials:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="text-slate-600 mt-4">Carregando depoimentos...</p>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-red-200 transition-all duration-300 relative overflow-hidden group"
        >
          {/* Elemento decorativo */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-red-600 text-red-600" />
                ))}
              </div>
            </div>

            <p className="text-slate-700 mb-6 italic leading-relaxed text-base">
              "{testimonial.content}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <img
                src={
                  testimonial.image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=dc2626&color=fff&size=150&bold=true`
                }
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=dc2626&color=fff&size=150&bold=true`
                }}
              />
              <div>
                <p className="font-semibold text-slate-900 text-base">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

