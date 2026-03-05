import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Route callback après confirmation email Supabase.
// Supabase redirige ici avec un `code` après vérification du token_hash.
// On échange le code contre une session, puis on envoie l'email de bienvenue.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Envoi de l'email de bienvenue après confirmation — non-bloquant
      const fullName = data.user.user_metadata?.full_name ?? ''
      const prenom = fullName.trim().split(' ')[0] || 'auteur'
      const email = data.user.email

      if (email) {
        fetch(`${origin}/api/email/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, prenom }),
        }).catch((err) => console.error('[auth/callback] Email bienvenue non envoyé:', err))
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur, renvoyer vers login avec indication
  return NextResponse.redirect(`${origin}/login?error=confirmation`)
}
