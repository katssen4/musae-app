'use client'

import { useState } from 'react'
import type { Post, Platform } from '@/types'
import PostSelector from './PostSelector'

type Phase = 'input' | 'loading' | 'results'

export default function ContentUploader() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedByPlatform, setSelectedByPlatform] = useState<Partial<Record<Platform, string>>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!text.trim()) return
    setPhase('loading')
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text,
          platforms: ['facebook', 'instagram'],
        }),
      })

      if (!res.ok) {
        if (res.status === 403) {
          window.location.href = '/dashboard/settings'
          return
        }
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur lors de la génération')
      }

      const data = await res.json()
      setPosts(data.posts)
      setSelectedByPlatform({})
      setPhase('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
      setPhase('input')
    }
  }

  function handleSelect(platform: Platform, postId: string) {
    setSelectedByPlatform(prev => ({ ...prev, [platform]: postId }))
    // Mise à jour du statut en arrière-plan
    fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
  }

  function handleReset() {
    setPhase('input')
    setPosts([])
    setSelectedByPlatform({})
    setError(null)
    setText('')
  }

  const hasSelection = Object.values(selectedByPlatform).some(Boolean)

  if (phase === 'loading') {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-musae-ink border-t-transparent animate-spin" />
        <p className="font-sans text-base text-stone-500">Musae crée vos publications…</p>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-musae-ink">Vos propositions</h2>
          <button
            onClick={handleReset}
            className="font-sans text-sm text-stone-400 hover:text-musae-ink underline-offset-4 hover:underline transition-colors"
          >
            ← Nouveau texte
          </button>
        </div>

        <PostSelector
          posts={posts}
          selectedByPlatform={selectedByPlatform}
          onSelect={handleSelect}
        />

        {hasSelection && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-primary sm:flex-1" disabled>
                Publier maintenant
              </button>
              <button className="btn-secondary sm:flex-1" disabled>
                Programmer automatiquement
              </button>
            </div>
            <p className="font-sans text-sm text-stone-400 text-center">
              Connectez vos réseaux sociaux dans les{' '}
              <a href="/dashboard/settings" className="underline underline-offset-2 hover:text-musae-ink transition-colors">
                Réglages
              </a>{' '}
              pour publier.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-sans text-base">
          {error}
        </div>
      )}

      <div className="card">
        <label htmlFor="content" className="block font-sans text-base font-medium text-musae-ink mb-3">
          Votre texte ou extrait
        </label>
        <textarea
          id="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[180px] resize-none"
          placeholder="Collez ici un extrait de votre livre, une pensée, une citation… Musae s'occupe du reste."
          rows={6}
        />
      </div>

      <button
        className="btn-primary"
        disabled={!text.trim()}
        onClick={handleGenerate}
      >
        ✦ Générer mes publications
      </button>
    </div>
  )
}
