import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

// Cron job Vercel : tourne toutes les heures (cf. vercel.json)
// Publie automatiquement les posts planifiés dont l'heure est passée
export async function GET(request: Request) {
  // Vérifier le token de sécurité du cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Récupérer tous les posts à publier
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (error) {
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (posts ?? []).map(async (post) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      if (!res.ok) throw new Error(`Échec publication post ${post.id}`)
      return post.id
    })
  )

  const published = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ published, failed })
}
