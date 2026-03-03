import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { publishToMeta } from '@/lib/meta'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { postId } = await request.json()
  if (!postId) {
    return NextResponse.json({ error: 'postId manquant' }, { status: 400 })
  }

  // Récupérer le post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
  }

  // Récupérer le token Meta de l'utilisateur
  const { data: connection } = await supabase
    .from('social_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', post.platform)
    .single()

  if (!connection) {
    return NextResponse.json(
      { error: `Compte ${post.platform} non connecté` },
      { status: 400 }
    )
  }

  // Publier via Meta Graph API
  const metaPostId = await publishToMeta({
    platform: post.platform,
    body: post.body,
    accessToken: connection.access_token,
    pageId: connection.page_id ?? undefined,
    instagramAccountId: connection.instagram_account_id ?? undefined,
  })

  // Mettre à jour le statut du post
  await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      meta_post_id: metaPostId,
    })
    .eq('id', postId)

  return NextResponse.json({ success: true, metaPostId })
}
