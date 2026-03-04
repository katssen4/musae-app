import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { stripe, createCheckoutSession, PLAN_MUSAE } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  // Créer le customer Stripe si inexistant
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000'

  const session = await createCheckoutSession({
    customerId,
    priceId: PLAN_MUSAE.priceId,
    successUrl: `${origin}/dashboard/settings?checkout=success`,
    cancelUrl: `${origin}/dashboard/settings?checkout=cancel`,
  })

  return NextResponse.json({ url: session.url })
}
