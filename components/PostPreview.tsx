'use client'

import { useState } from 'react'
import type { Post } from '@/types'
import { useToast } from './Toast'

interface PostPreviewProps {
  post: Post
  isSelected?: boolean
  onApprove?: (id: string) => void
  onSchedule?: (id: string) => void
}

export default function PostPreview({ post, isSelected = false, onApprove, onSchedule }: PostPreviewProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const platformLabel: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  }

  const formatLabel: Record<string, string> = {
    quote: 'Citation',
    reflective: 'Réflexion',
    question: 'Question',
    announcement: 'Annonce',
    behind_scenes: 'Coulisses',
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post.body)
      setCopied(true)
      toast('Texte copié dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Impossible de copier le texte', 'error')
    }
  }

  return (
    <div className={`card space-y-4 transition-all ${isSelected ? 'border-musae-ink ring-1 ring-musae-ink' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-musae-gold uppercase tracking-wide">
          {platformLabel[post.platform] ?? post.platform}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm text-stone-400">
            {formatLabel[post.format] ?? post.format}
          </span>
          <button
            onClick={handleCopy}
            className="font-sans text-sm text-stone-400 hover:text-musae-ink transition-colors cursor-pointer"
            title="Copier le texte"
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </div>

      <p className="font-sans text-base text-musae-ink leading-relaxed whitespace-pre-wrap">
        {post.body}
      </p>

      {(onApprove || onSchedule) && (
        <div className="flex gap-3 pt-2">
          {onApprove && (
            <button
              onClick={() => !isSelected && onApprove(post.id)}
              className={`flex-1 rounded-lg font-sans font-medium text-base py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-musae-gold focus:ring-offset-2 ${
                isSelected
                  ? 'bg-musae-ink text-musae-parchment cursor-default'
                  : 'border-2 border-musae-ink text-musae-ink hover:bg-musae-ink/5 cursor-pointer'
              }`}
            >
              {isSelected ? '✓ Sélectionné' : 'Choisir ce post'}
            </button>
          )}
          {onSchedule && !isSelected && (
            <button
              onClick={() => onSchedule(post.id)}
              className="flex-1 rounded-lg font-sans font-medium text-base py-3 border-2 border-musae-ink text-musae-ink hover:bg-musae-ink/5 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-musae-gold focus:ring-offset-2"
            >
              Programmer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
