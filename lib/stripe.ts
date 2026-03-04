import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Plan unique Musae
export const PLAN_MUSAE = {
  priceId: process.env.STRIPE_PRICE_MUSAE!,
  name: 'Musae',
  price: 20,
  features: [
    'Génération de posts illimitée',
    'Facebook + Instagram',
    'Publication automatique',
    'Planning personnalisé',
    'Style IA adapté à votre plume',
  ],
} as const

// Durée de l'essai gratuit (jours)
export const TRIAL_DURATION_DAYS = 14

/**
 * Calcule le statut de l'essai gratuit à partir de la date de création du profil.
 */
export function getTrialStatus(createdAt: string) {
  const created = new Date(createdAt)
  const trialEnd = new Date(created)
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)

  const now = new Date()
  const msRemaining = trialEnd.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))

  return {
    daysRemaining,
    isTrialActive: daysRemaining > 0,
    trialEndDate: trialEnd,
  }
}

/**
 * Vérifie si un utilisateur a accès aux fonctionnalités premium.
 * Accès si : plan === 'musae' OU essai gratuit encore actif.
 */
export function hasAccess(plan: string, createdAt: string): boolean {
  if (plan === 'musae') return true
  return getTrialStatus(createdAt).isTrialActive
}

export async function createCheckoutSession(options: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: options.customerId,
    mode: 'subscription',
    line_items: [{ price: options.priceId, quantity: 1 }],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    allow_promotion_codes: true,
    locale: 'fr',
  })
}

export async function createCustomerPortalSession(options: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: options.customerId,
    return_url: options.returnUrl,
  })
}
