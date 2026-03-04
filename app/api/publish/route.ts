import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { publishPost } from '@/lib/publish'

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

  const result = await publishPost(supabase, postId, user.id)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, metaPostId: result.metaPostId })
}
