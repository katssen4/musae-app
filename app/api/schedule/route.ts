import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { publishPost } from '@/lib/publish'

// Cron job Vercel : tourne toutes les heures (cf. vercel.json)
// Publie automatiquement les posts planifiés dont l'heure est passée
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (error) {
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (posts ?? []).map((post) => publishPost(supabase, post.id))
  )

  const published = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length
  const failed = results.length - published

  return NextResponse.json({ published, failed })
}
