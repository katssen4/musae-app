import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Route de vérification email — remplace le endpoint Supabase /auth/v1/verify
// Reçoit token_hash et type en query params, vérifie via verifyOtp côté serveur.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | 'magiclink'

  if (!tokenHash || !type) {
    console.error('[auth/confirm] Paramètres manquants:', { tokenHash: !!tokenHash, type })
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  const cookieStore = cookies()
  const supabase = createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    console.error('[auth/confirm] Erreur vérification:', error.message)
    return NextResponse.redirect(`${origin}/login?error=verification_failed`)
  }

  // Email vérifié — envoyer l'email de bienvenue si c'est un signup
  if (type === 'signup' && data.user) {
    const fullName = data.user.user_metadata?.full_name ?? ''
    const prenom = fullName.trim().split(' ')[0] || 'auteur'
    const email = data.user.email

    if (email) {
      fetch(`${origin}/api/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, prenom }),
      }).catch((err) => console.error('[auth/confirm] Email bienvenue non envoyé:', err))
    }
  }

  console.log('[auth/confirm] Vérification réussie, redirection dashboard')
  return NextResponse.redirect(`${origin}/dashboard`)
}
