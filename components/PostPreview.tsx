import type { Post } from '@/types'

interface PostPreviewProps {
  post: Post
  onApprove?: (id: string) => void
  onSchedule?: (id: string) => void
}

// Sprint 2 : affichage d'un post généré par l'IA
export default function PostPreview({ post, onApprove, onSchedule }: PostPreviewProps) {
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
    <div className="card space-y-4">
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
              onClick={() => onApprove(post.id)}
              className="flex-1 btn-primary text-sm py-3"
            >
              Choisir ce post
            </button>
          )}
          {onSchedule && (
            <button
              onClick={() => onSchedule(post.id)}
              className="flex-1 btn-secondary text-sm py-3"
            >
              Programmer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
