// Sprint 5 : Client Stripe
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  essential: {
    priceId: process.env.STRIPE_PRICE_ESSENTIAL!,
    name: 'Essentiel',
    price: 20,
    features: [
      'Facebook + Instagram',
      '30 posts générés / mois',
      'Publication manuelle',
      'Planning de base',
    ],
  },
  author: {
    priceId: process.env.STRIPE_PRICE_AUTHOR!,
    name: 'Auteur',
    price: 35,
    features: [
      'Tout Essentiel +',
      'Posts illimités',
      'Publication automatique',
      'Style personnalisé IA',
      'Support prioritaire',
    ],
  },
} as const

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
