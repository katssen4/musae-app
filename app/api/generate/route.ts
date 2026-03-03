import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { generatePosts } from '@/lib/claude'
import type { GenerateRequest } from '@/types'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: GenerateRequest = await request.json()
  const { contentId, rawText, imageUrl, platforms, authorStyle } = body

  if (!contentId || platforms.length === 0) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Récupérer le profil pour le style auteur si non fourni
  let style = authorStyle
  if (!style) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, author_style')
      .eq('id', user.id)
      .single()

    style = profile?.author_style ?? undefined
  }

  const posts = await generatePosts({ rawText, imageUrl, platforms, authorStyle: style })

  // Sauvegarder les posts générés en base
  const postsToInsert = posts.map((p) => ({
    user_id: user.id,
    content_id: contentId,
    platform: p.platform,
    format: p.format,
    body: p.body,
    status: 'draft' as const,
  }))

  const { data: savedPosts, error } = await supabase
    .from('posts')
    .insert(postsToInsert)
    .select()

  if (error) {
    return NextResponse.json({ error: 'Erreur de sauvegarde' }, { status: 500 })
  }

  return NextResponse.json({ posts: savedPosts })
}
