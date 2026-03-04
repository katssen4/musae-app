import { publishToMeta } from '@/lib/meta'
import type { SupabaseClient } from '@supabase/supabase-js'

interface PublishResult {
  success: boolean
  metaPostId?: string
  error?: string
}

/**
 * Publie un post via Meta Graph API.
 * Accepte un client Supabase (user ou admin).
 * Le caller est responsable de la vérification d'autorisation.
 */
export async function publishPost(
  supabase: SupabaseClient,
  postId: string,
  userId?: string
): Promise<PublishResult> {
  let query = supabase.from('posts').select('*').eq('id', postId)
  if (userId) query = query.eq('user_id', userId)
  const { data: post, error: postError } = await query.single()

  if (postError || !post) {
    return { success: false, error: 'Post introuvable' }
  }

  const { data: connection } = await supabase
    .from('social_connections')
    .select('*')
    .eq('user_id', post.user_id)
    .eq('platform', post.platform)
    .single()

  if (!connection) {
    return { success: false, error: `Compte ${post.platform} non connecté` }
  }

  try {
    const metaPostId = await publishToMeta({
      platform: post.platform,
      body: post.body,
      accessToken: connection.access_token,
      pageId: connection.page_id ?? undefined,
      instagramAccountId: connection.instagram_account_id ?? undefined,
    })

    await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        meta_post_id: metaPostId,
      })
      .eq('id', postId)

    return { success: true, metaPostId }
  } catch (err) {
    await supabase
      .from('posts')
      .update({ status: 'failed' })
      .eq('id', postId)

    return { success: false, error: err instanceof Error ? err.message : 'Erreur de publication' }
  }
}
