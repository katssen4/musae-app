'use client'

import { useState } from 'react'
import type { Post } from '@/types'
import { useToast } from './Toast'

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

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'text-stone-400' },
  approved: { label: 'Sélectionné', color: 'text-musae-sage' },
  scheduled: { label: 'Programmé', color: 'text-musae-gold' },
  published: { label: 'Publié', color: 'text-green-600' },
  failed: { label: 'Erreur', color: 'text-red-500' },
}

export default function PostCard({ post }: { post: Post }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const status = statusConfig[post.status] ?? { label: post.status, color: 'text-stone-400' }

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
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-medium text-musae-gold uppercase tracking-wide">
            {platformLabel[post.platform] ?? post.platform}
          </span>
          <span className="font-sans text-sm text-stone-400">
            {formatLabel[post.format] ?? post.format}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="font-sans text-sm text-stone-400 hover:text-musae-ink transition-colors cursor-pointer"
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
          <span className={`font-sans text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <p className="font-sans text-base text-musae-ink leading-relaxed line-clamp-3">
        {post.body}
      </p>

      <p className="font-sans text-sm text-stone-400">
        {new Date(post.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}
