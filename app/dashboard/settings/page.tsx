import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { getTrialStatus, PLAN_MUSAE, TRIAL_DURATION_DAYS } from '@/lib/stripe'
import type { Profile, SocialConnection } from '@/types'
import BillingActions from '@/components/BillingActions'
import SocialConnections from '@/components/SocialConnections'
import SettingsToasts from '@/components/SettingsToasts'
import ScheduleConfig from '@/components/ScheduleConfig'

export default async function SettingsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: connections }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('social_connections').select('*').eq('user_id', user.id),
  ])

  const p = profile as Profile
  const trial = getTrialStatus(p.created_at)
  const isSubscribed = p.plan === 'musae'

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SettingsToasts />
      </Suspense>

      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">
          Réglages
        </h1>
        <p className="font-sans text-base text-stone-500">
          Gérez votre abonnement et vos préférences.
        </p>
      </div>

      {/* Abonnement */}
      <section className="card space-y-6">
        <h2 className="font-serif text-xl text-musae-ink">Abonnement</h2>

        {isSubscribed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-musae-sage/10 px-3 py-1 font-sans text-sm font-medium text-musae-sage">
                Actif
              </span>
              <span className="font-sans text-base text-musae-ink">
                Plan Musae — {PLAN_MUSAE.price}€/mois
              </span>
            </div>
            <BillingActions action="portal" />
          </div>
        ) : trial.isTrialActive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-musae-gold/10 px-3 py-1 font-sans text-sm font-medium text-musae-gold">
                Essai gratuit
              </span>
              <span className="font-sans text-base text-stone-600">
                {trial.daysRemaining} jour{trial.daysRemaining > 1 ? 's' : ''} restant{trial.daysRemaining > 1 ? 's' : ''}
              </span>
            </div>
            <p className="font-sans text-sm text-stone-500">
              Vous profitez de toutes les fonctionnalités de Musae pendant {TRIAL_DURATION_DAYS} jours. Aucune carte bancaire requise.
            </p>
            <div className="bg-musae-parchment rounded-lg p-4 space-y-2">
              <p className="font-sans text-base font-medium text-musae-ink">
                Plan Musae — {PLAN_MUSAE.price}€/mois
              </p>
              <ul className="space-y-1">
                {PLAN_MUSAE.features.map((f) => (
                  <li key={f} className="font-sans text-sm text-stone-600 flex items-start gap-2">
                    <span className="text-musae-sage mt-0.5">✦</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <BillingActions action="checkout" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 font-sans text-sm font-medium text-red-600">
                Essai terminé
              </span>
            </div>
            <p className="font-sans text-sm text-stone-500">
              Votre essai gratuit est terminé. Abonnez-vous pour continuer à générer des publications avec Musae.
            </p>
            <div className="bg-musae-parchment rounded-lg p-4 space-y-2">
              <p className="font-sans text-base font-medium text-musae-ink">
                Plan Musae — {PLAN_MUSAE.price}€/mois
              </p>
              <ul className="space-y-1">
                {PLAN_MUSAE.features.map((f) => (
                  <li key={f} className="font-sans text-sm text-stone-600 flex items-start gap-2">
                    <span className="text-musae-sage mt-0.5">✦</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <BillingActions action="checkout" />
          </div>
        )}
      </section>

      {/* Réseaux sociaux */}
      <section className="card space-y-4">
        <h2 className="font-serif text-xl text-musae-ink">Réseaux sociaux</h2>
        <SocialConnections connections={(connections ?? []) as SocialConnection[]} />
      </section>

      {/* Planning de publication */}
      <section className="card space-y-4">
        <h2 className="font-serif text-xl text-musae-ink">Planning de publication</h2>
        <p className="font-sans text-sm text-stone-400 mb-2">
          Configurez la fréquence et l&apos;heure de vos publications automatiques.
        </p>
        <ScheduleConfig />
      </section>
    </div>
  )
}
