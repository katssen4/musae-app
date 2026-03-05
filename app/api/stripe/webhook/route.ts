import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase-server'
import { envoyerEmailConfirmationAbonnement } from '@/lib/email'

// Sprint 5 : webhooks Stripe pour gestion des abonnements
export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const priceId = subscription.items.data[0]?.price.id

      const isActive = ['active', 'trialing'].includes(subscription.status)
      const plan = (priceId === process.env.STRIPE_PRICE_MUSAE && isActive) ? 'musae' : 'free'

      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          plan,
        })
        .eq('stripe_customer_id', customerId)

      // Email de confirmation uniquement à la création d'un abonnement actif
      if (event.type === 'customer.subscription.created' && plan === 'musae') {
        const customerObj = await stripe.customers.retrieve(customerId)
        const stripeCustomer = customerObj as Stripe.Customer
        const email = stripeCustomer.email
        const prenom = (stripeCustomer.name ?? 'cher auteur').trim().split(' ')[0]

        if (email) {
          envoyerEmailConfirmationAbonnement({ email, prenom }).catch((err) => {
            console.error('[stripe/webhook] Erreur email abonnement:', err)
          })
        }
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
