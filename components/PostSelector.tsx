import type { Post, Platform } from '@/types'
import PostPreview from './PostPreview'

interface PostSelectorProps {
  posts: Post[]
  onSelect: (postId: string) => void
}

// Sprint 2 : sélection parmi les propositions générées par plateforme
export default function PostSelector({ posts, onSelect }: PostSelectorProps) {
  const platforms: Platform[] = ['facebook', 'instagram']

  const platformLabel: Record<Platform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  }

  const postsByPlatform = (platform: Platform) =>
    posts.filter((p) => p.platform === platform)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {platforms.map((platform) => (
        <div key={platform}>
          <h3 className="font-sans text-base font-semibold text-musae-ink uppercase tracking-wide mb-4">
            {platformLabel[platform]}
          </h3>
          <div className="space-y-4">
            {postsByPlatform(platform).map((post) => (
              <PostPreview
                key={post.id}
                post={post}
                onApprove={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
