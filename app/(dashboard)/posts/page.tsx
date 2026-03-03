import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Post } from '@/types'

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
        {typedPosts.map((post) => {
          const status = statusConfig[post.status] ?? { label: post.status, color: 'text-stone-400' }
          return (
            <div key={post.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-sm font-medium text-musae-gold uppercase tracking-wide">
                    {platformLabel[post.platform] ?? post.platform}
                  </span>
                  <span className="font-sans text-sm text-stone-400">
                    {formatLabel[post.format] ?? post.format}
                  </span>
                </div>
                <span className={`font-sans text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
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
        })}
      </div>
    </div>
  )
}
