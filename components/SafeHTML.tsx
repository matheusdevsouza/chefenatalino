'use client'

import React from 'react'
import DOMPurify from 'dompurify'

/**
 * Propriedades do componente SafeHTML.
 */

interface SafeHTMLProps {
  content: string
  className?: string
}

/**
 * Componente para renderização segura de conteúdo HTML.
 * 
 * Sanitiza o HTML usando DOMPurify, removendo scripts, eventos e tags
 * perigosas antes de renderizar. Permite apenas tags de formatação básica.
 */

export function SafeHTML({ content, className = '' }: SafeHTMLProps) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  })

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

