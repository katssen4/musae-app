import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { generatePosts } from '@/lib/claude'
import { hasAccess } from '@/lib/stripe'
import type { GenerateRequest } from '@/types'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier l'accès (abonnement ou essai gratuit)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, created_at, author_style')
    .eq('id', user.id)
    .single()

  if (!profile || !hasAccess(profile.plan, profile.created_at)) {
    return NextResponse.json(
      { error: 'Votre essai gratuit est terminé. Abonnez-vous pour continuer.' },
      { status: 403 }
    )
  }

  const body: GenerateRequest = await request.json()
  const { rawText, imageUrl, platforms, authorStyle, contentId: providedContentId } = body

  if ((!rawText && !imageUrl) || !platforms || platforms.length === 0) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Créer l'entrée content en base si aucun contentId fourni
  let contentId = providedContentId
  if (!contentId) {
    const contentType = rawText && imageUrl ? 'mixed' : rawText ? 'text' : 'image'
    const { data: content, error: contentError } = await supabase
      .from('contents')
      .insert({
        user_id: user.id,
        type: contentType,
        raw_text: rawText ?? null,
        image_url: imageUrl ?? null,
      })
      .select('id')
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Erreur de sauvegarde du contenu' }, { status: 500 })
    }
    contentId = content.id
  }

  // Utiliser le style auteur depuis le profil (déjà récupéré) si non fourni
  const style = authorStyle ?? profile.author_style ?? undefined

  const generatedPosts = await generatePosts({ rawText, imageUrl, platforms, authorStyle: style })

  const postsToInsert = generatedPosts.map((p) => ({
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
    return NextResponse.json({ error: 'Erreur de sauvegarde des posts' }, { status: 500 })
  }

  return NextResponse.json({ posts: savedPosts })
}
