import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Post } from '@/types'
import PostCard from '@/components/PostCard'

export default async function PostsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const typedPosts = (posts ?? []) as Post[]

  if (typedPosts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-musae-ink mb-2">Mes publications</h1>
          <p className="font-sans text-base text-stone-500">
            Retrouvez ici toutes vos publications générées, programmées et publiées.
          </p>
        </div>

        <div className="card text-center py-16">
          <p className="font-serif text-xl text-stone-400 mb-2">Aucune publication pour le moment</p>
          <p className="font-sans text-base text-stone-400 mb-6">
            Commencez par déposer un texte sur l&apos;écran principal.
          </p>
          <Link
            href="/dashboard"
            className="inline-block font-sans font-medium text-base text-musae-ink border-2 border-musae-ink rounded-lg px-8 py-3 hover:bg-musae-ink/5 transition-colors"
          >
            Créer mes premières publications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">Mes publications</h1>
        <p className="font-sans text-base text-stone-500">
          {typedPosts.length} publication{typedPosts.length > 1 ? 's' : ''} générée{typedPosts.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {typedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
