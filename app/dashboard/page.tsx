import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { hasAccess, getTrialStatus } from '@/lib/stripe'
import type { Profile, Platform } from '@/types'
import ContentUploader from '@/components/ContentUploader'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: connections }] = await Promise.all([
    supabase.from('profiles').select('plan, created_at').eq('id', user.id).single(),
    supabase.from('social_connections').select('platform').eq('user_id', user.id),
  ])

  const p = profile as Pick<Profile, 'plan' | 'created_at'>
  const canAccess = hasAccess(p.plan, p.created_at)
  const trial = p.plan === 'free' ? getTrialStatus(p.created_at) : null
  const connectedPlatforms = (connections ?? []).map(c => c.platform) as Platform[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">
          Créer mes publications
        </h1>
        <p className="font-sans text-base text-stone-500">
          Déposez un texte ou une image, Musae génère vos posts en quelques secondes.
        </p>
      </div>

      {/* Bannière essai gratuit */}
      {trial?.isTrialActive && (
        <div className="bg-musae-gold/10 border border-musae-gold/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="font-sans text-sm text-musae-ink">
            Essai gratuit : <strong>{trial.daysRemaining} jour{trial.daysRemaining > 1 ? 's' : ''}</strong> restant{trial.daysRemaining > 1 ? 's' : ''}
          </p>
          <Link
            href="/dashboard/settings"
            className="font-sans text-sm font-medium text-musae-gold hover:text-musae-ink transition-colors"
          >
            S&apos;abonner
          </Link>
        </div>
      )}

      {canAccess ? (
        <ContentUploader connectedPlatforms={connectedPlatforms} />
      ) : (
        <div className="card text-center py-16 space-y-4">
          <p className="font-serif text-xl text-stone-400">
            Votre essai gratuit est terminé
          </p>
          <p className="font-sans text-base text-stone-500 max-w-md mx-auto">
            Abonnez-vous pour continuer à générer des publications authentiques avec Musae.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block btn-primary"
          >
            Voir les offres
          </Link>
        </div>
      )}
    </div>
  )
}
