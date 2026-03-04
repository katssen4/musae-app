import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createCustomerPortalSession } from '@/lib/stripe'

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

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000'

  const session = await createCustomerPortalSession({
    customerId: profile.stripe_customer_id,
    returnUrl: `${origin}/dashboard/settings`,
  })

  return NextResponse.json({ url: session.url })
}
