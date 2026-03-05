import type { Post, Platform } from '@/types'
import PostPreview from './PostPreview'

interface PostSelectorProps {
  posts: Post[]
  selectedByPlatform: Partial<Record<Platform, string>>
  onSelect: (platform: Platform, postId: string) => void
  imageUrl?: string
}

export default function PostSelector({ posts, selectedByPlatform, onSelect, imageUrl }: PostSelectorProps) {
  const platforms: Platform[] = ['facebook', 'instagram']

  const platformLabel: Record<Platform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
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
                isSelected={selectedByPlatform[platform] === post.id}
                onApprove={(id) => onSelect(platform, id)}
                imageUrl={imageUrl}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
