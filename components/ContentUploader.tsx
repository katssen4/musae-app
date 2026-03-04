'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Post, Platform } from '@/types'
import PostSelector from './PostSelector'
import { useToast } from './Toast'

type Phase = 'input' | 'uploading' | 'loading' | 'results'

interface ContentUploaderProps {
  connectedPlatforms: Platform[]
}

export default function ContentUploader({ connectedPlatforms }: ContentUploaderProps) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('input')
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedByPlatform, setSelectedByPlatform] = useState<Partial<Record<Platform, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasMetaConnection = connectedPlatforms.length > 0

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format non supporté. Utilisez JPEG, PNG ou WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop lourde (max 5 Mo)')
      return
    }
    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleGenerate() {
    if (!text.trim() && !imageFile) return
    setError(null)

    let uploadedUrl = imageUrl

    // Upload image first if needed
    if (imageFile && !uploadedUrl) {
      setPhase('uploading')
      try {
        const formData = new FormData()
        formData.append('file', imageFile)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Erreur lors de l\'upload')
        }
        const data = await res.json()
        uploadedUrl = data.url
        setImageUrl(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload de l\'image')
        setPhase('input')
        return
      }
    }

    setPhase('loading')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text || undefined,
          imageUrl: uploadedUrl || undefined,
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
    removeImage()
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const postIds = Object.values(selectedByPlatform).filter(Boolean) as string[]
      const results = await Promise.allSettled(
        postIds.map(postId =>
          fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId }),
          }).then(res => {
            if (!res.ok) throw new Error()
            return res.json()
          })
        )
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (succeeded > 0) toast(`${succeeded} publication${succeeded > 1 ? 's' : ''} envoyée${succeeded > 1 ? 's' : ''} !`)
      if (failed > 0) toast(`${failed} publication${failed > 1 ? 's' : ''} en erreur`, 'error')
    } catch {
      toast('Erreur lors de la publication', 'error')
    } finally {
      setPublishing(false)
    }
  }

  const hasSelection = Object.values(selectedByPlatform).some(Boolean)
  const canGenerate = text.trim() || imageFile

  if (phase === 'uploading') {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-musae-gold border-t-transparent animate-spin" />
        <p className="font-sans text-base text-stone-500">Upload de l&apos;image…</p>
      </div>
    )
  }

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
          imageUrl={imageUrl ?? undefined}
        />

        {hasSelection && (
          <div className="space-y-3">
            {hasMetaConnection ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="btn-primary sm:flex-1"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? 'Publication en cours…' : 'Publier maintenant'}
                </button>
                <button className="btn-secondary sm:flex-1" disabled>
                  Programmer automatiquement
                </button>
              </div>
            ) : (
              <>
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
                  pour publier. En attendant, utilisez le bouton « Copier » sur chaque post.
                </p>
              </>
            )}
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

      <div className="card">
        <label className="block font-sans text-base font-medium text-musae-ink mb-3">
          Image (optionnel)
        </label>

        {imagePreview ? (
          <div className="relative group">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-stone-100">
              <Image
                src={imagePreview}
                alt="Aperçu"
                fill
                className="object-cover"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-red-50 transition-colors"
              title="Supprimer l'image"
            >
              <svg className="w-4 h-4 text-stone-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-musae-gold bg-musae-gold/5'
                : 'border-stone-200 hover:border-musae-gold/50 hover:bg-stone-50'
            }`}
          >
            <svg className="w-8 h-8 mx-auto mb-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="font-sans text-sm text-stone-500">
              Glissez une image ici ou <span className="text-musae-gold font-medium">parcourez</span>
            </p>
            <p className="font-sans text-xs text-stone-400 mt-1">
              JPEG, PNG ou WebP — max 5 Mo
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      <button
        className="btn-primary"
        disabled={!canGenerate}
        onClick={handleGenerate}
      >
        ✦ Générer mes publications
      </button>
    </div>
  )
}
