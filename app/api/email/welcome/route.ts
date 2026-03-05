import { NextResponse } from 'next/server'
import { envoyerEmailBienvenue } from '@/lib/email'

// Endpoint appelé côté client après une inscription réussie.
// L'envoi est non-bloquant : un échec ici ne bloque pas l'accès au dashboard.
export async function POST(request: Request) {
  const body = await request.json()
  const { email, prenom } = body as { email?: string; prenom?: string }

  if (!email || !prenom) {
    return NextResponse.json({ error: 'email et prenom sont requis' }, { status: 400 })
  }

  const { error } = await envoyerEmailBienvenue({ email, prenom })

  if (error) {
    console.error('[email/welcome] Erreur Resend:', error)
    return NextResponse.json({ sent: false, error: error.message ?? String(error) })
  }

  return NextResponse.json({ sent: true })
}
