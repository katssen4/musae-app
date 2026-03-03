import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { PostStatus } from '@/types'

const ALLOWED_STATUSES: PostStatus[] = ['draft', 'approved', 'scheduled', 'published', 'failed']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { status } = await request.json() as { status: PostStatus }

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', params.id)
    .eq('user_id', user.id)   // l'utilisateur ne peut modifier que ses propres posts
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }

  return NextResponse.json({ post: data })
}
