'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Post } from '@/types'
import { useToast } from './Toast'

interface PostPreviewProps {
  post: Post
  isSelected?: boolean
  onApprove?: (id: string) => void
  imageUrl?: string
}

const formatLabel: Record<string, string> = {
  quote: 'Citation',
  reflective: 'Réflexion',
  question: 'Question',
  announcement: 'Annonce',
  behind_scenes: 'Coulisses',
}

function FacebookMockup({ post, imageUrl }: { post: Post; imageUrl?: string }) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-musae-gold to-musae-sage flex items-center justify-center">
          <span className="font-serif text-white text-sm font-bold">M</span>
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-gray-900">Votre page</p>
          <p className="font-sans text-xs text-gray-500">À l&apos;instant · 🌐</p>
        </div>
      </div>

      {/* Body */}
      <p className="font-sans text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap mb-3">
        {post.body}
      </p>

      {/* Image */}
      {imageUrl && (
        <div className="relative w-full h-52 -mx-5 mb-3" style={{ width: 'calc(100% + 2.5rem)' }}>
          <Image src={imageUrl} alt="" fill className="object-cover" />
        </div>
      )}

      {/* Reactions bar */}
      <div className="border-t border-gray-200 pt-2 mt-2">
        <div className="flex justify-around">
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 .372-.012.745-.037 1.115a5.043 5.043 0 01-2.088 3.588A3.508 3.508 0 0013 12.75v.005a.75.75 0 01-.75.75h-.582a2.25 2.25 0 01-2.124-1.5H6.75a2.25 2.25 0 01-2.25-2.25v-.014A2.248 2.248 0 016.633 10.5z" />
            </svg>
            <span className="font-sans text-sm text-gray-500 font-medium">J&apos;aime</span>
          </button>
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span className="font-sans text-sm text-gray-500 font-medium">Commenter</span>
          </button>
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            <span className="font-sans text-sm text-gray-500 font-medium">Partager</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function InstagramMockup({ post, imageUrl }: { post: Post; imageUrl?: string }) {
  // Séparer le body des hashtags
  const lines = post.body.split('\n')
  const hashtagLineIdx = lines.findIndex(l => l.trim().startsWith('#'))
  const caption = hashtagLineIdx >= 0 ? lines.slice(0, hashtagLineIdx).join('\n').trim() : post.body
  const hashtags = hashtagLineIdx >= 0 ? lines.slice(hashtagLineIdx).join(' ').trim() : ''

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="font-serif text-xs font-bold text-gray-800">M</span>
          </div>
        </div>
        <p className="font-sans text-sm font-semibold text-gray-900">votre_compte</p>
      </div>

      {/* Image or gradient placeholder */}
      <div className="relative w-full aspect-square -mx-5 mb-3" style={{ width: 'calc(100% + 2.5rem)' }}>
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-musae-ink via-musae-sage/80 to-musae-gold/60 flex items-center justify-center p-8">
            <p className="font-serif text-white text-center text-lg leading-relaxed line-clamp-6 italic">
              &ldquo;{caption.slice(0, 200)}{caption.length > 200 ? '…' : ''}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Action icons */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
        <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </div>

      {/* Caption */}
      <div className="space-y-1">
        <p className="font-sans text-sm text-gray-900 leading-relaxed">
          <span className="font-semibold">votre_compte</span>{' '}
          <span className="whitespace-pre-wrap">{caption}</span>
        </p>
        {hashtags && (
          <p className="font-sans text-sm text-blue-900/70">{hashtags}</p>
        )}
      </div>
    </div>
  )
}

export default function PostPreview({ post, isSelected = false, onApprove, imageUrl }: PostPreviewProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

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

  const isFacebook = post.platform === 'facebook'

  return (
    <div
      className={`relative rounded-xl bg-white shadow-sm border transition-all overflow-hidden ${
        isSelected ? 'border-musae-gold ring-2 ring-musae-gold/30' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Format badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-sans font-medium text-stone-500 shadow-sm border border-stone-100">
          {formatLabel[post.format] ?? post.format}
        </span>
      </div>

      {/* Mockup content */}
      <div className="p-5">
        {isFacebook ? (
          <FacebookMockup post={post} imageUrl={imageUrl} />
        ) : (
          <InstagramMockup post={post} imageUrl={imageUrl} />
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="font-sans text-sm text-stone-400 hover:text-musae-ink transition-colors cursor-pointer"
        >
          {copied ? '✓ Copié' : 'Copier le texte'}
        </button>

        {onApprove && (
          <button
            onClick={() => !isSelected && onApprove(post.id)}
            className={`font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
              isSelected
                ? 'bg-musae-gold text-white cursor-default'
                : 'bg-musae-ink text-white hover:bg-musae-ink/80 cursor-pointer'
            }`}
          >
            {isSelected ? '✓ Sélectionné' : 'Choisir'}
          </button>
        )}
      </div>
    </div>
  )
}
