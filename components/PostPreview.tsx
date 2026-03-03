import type { Post } from '@/types'

interface PostPreviewProps {
  post: Post
  isSelected?: boolean
  onApprove?: (id: string) => void
  onSchedule?: (id: string) => void
}

export default function PostPreview({ post, isSelected = false, onApprove, onSchedule }: PostPreviewProps) {
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

  return (
    <div className={`card space-y-4 transition-all ${isSelected ? 'border-musae-ink ring-1 ring-musae-ink' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-musae-gold uppercase tracking-wide">
          {platformLabel[post.platform] ?? post.platform}
        </span>
        <span className="font-sans text-sm text-stone-400">
          {formatLabel[post.format] ?? post.format}
        </span>
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
