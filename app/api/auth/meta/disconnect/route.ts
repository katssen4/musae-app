import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  await supabase
    .from('social_connections')
    .delete()
    .eq('user_id', user.id)
    .in('platform', ['facebook', 'instagram'])

  return NextResponse.json({ success: true })
}
