import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { envoyerEmailConfirmation, envoyerEmailResetPassword } from '@/lib/email'

// ─── Supabase Auth Hook : Send Email ─────────────────────────────────────────
// Remplace l'envoi d'email natif de Supabase par nos templates Musae.
// Configuration : Supabase Dashboard → Authentication → Hooks → Send Email
//   - Type : HTTPS
//   - URL  : https://app.musae.io/api/email/confirm
//   - Secret : valeur de SUPABASE_AUTH_HOOK_SECRET (format v1,whsec_...)
//
// Supabase signe le body avec HMAC-SHA256 et envoie la signature
// dans le header "webhook-signature".

// Types du payload Supabase Auth Hook
interface AuthHookPayload {
  user: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
    }
  }
  email_data: {
    token_hash: string
    redirect_to: string
    email_action_type: 'signup' | 'recovery' | 'email_change' | 'magic_link'
    site_url: string
  }
}

// Vérifie la signature webhook Supabase (HMAC-SHA256)
function verifierSignature(rawBody: string, request: Request): boolean {
  const secretEnv = process.env.SUPABASE_AUTH_HOOK_SECRET
  if (!secretEnv) {
    console.error('[auth-hook] SUPABASE_AUTH_HOOK_SECRET non configuré')
    return false
  }

  const signature = request.headers.get('webhook-signature')
  if (!signature) {
    console.error('[auth-hook] Header webhook-signature absent')
    return false
  }

  // Le secret Supabase est au format "v1,whsec_BASE64SECRET"
  // Extraire la partie base64 après "v1,whsec_"
  const secretPart = secretEnv.includes(',')
    ? secretEnv.split(',')[1]
    : secretEnv
  const secretKey = secretPart.startsWith('whsec_')
    ? secretPart.slice(6)
    : secretPart

  // La signature est au format "v1,SIGNATURE" — extraire les parties
  // Le header peut contenir : "t=TIMESTAMP,v1=SIGNATURE"
  const parts = signature.split(',')
  let timestamp = ''
  let sig = ''
  for (const part of parts) {
    const [key, val] = part.split('=')
    if (key === 't') timestamp = val
    if (key === 'v1') sig = val
  }

  if (!sig) {
    console.error('[auth-hook] Signature v1 non trouvée dans:', signature)
    return false
  }

  // Vérifier le HMAC : sign(timestamp.body) avec le secret décodé en base64
  try {
    const secretBytes = Buffer.from(secretKey, 'base64')
    const signedContent = `${timestamp}.${rawBody}`
    const expectedSig = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSig)
    )
  } catch (err) {
    console.error('[auth-hook] Erreur vérification signature:', err)
    return false
  }
}

// Construit le lien de vérification Supabase
function construireLienVerification(
  tokenHash: string,
  type: string,
  redirectTo: string
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    redirect_to: redirectTo || 'https://app.musae.io/dashboard',
  })
  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`
}

// Extrait le prénom depuis le full_name
function extrairePrenom(fullName?: string): string {
  if (!fullName) return 'auteur'
  return fullName.trim().split(' ')[0]
}

export async function POST(request: Request) {
  // Lire le body brut pour la vérification de signature
  const rawBody = await request.text()

  // Vérification de la signature HMAC
  if (!verifierSignature(rawBody, request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let payload: AuthHookPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
  }

  const { user, email_data } = payload
  const prenom = extrairePrenom(user.user_metadata?.full_name)
  const email = user.email

  if (!email || !email_data?.email_action_type) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  try {
    switch (email_data.email_action_type) {
      case 'signup': {
        // Email de confirmation d'adresse après inscription
        const lien = construireLienVerification(
          email_data.token_hash,
          'signup',
          email_data.redirect_to
        )
        await envoyerEmailConfirmation({ email, prenom, lienConfirmation: lien })
        console.log(`[auth-hook] Email confirmation signup envoyé à ${email}`)
        break
      }

      case 'recovery': {
        // Email de réinitialisation de mot de passe
        const lien = construireLienVerification(
          email_data.token_hash,
          'recovery',
          email_data.redirect_to
        )
        await envoyerEmailResetPassword({ email, prenom, lienReset: lien })
        console.log(`[auth-hook] Email recovery envoyé à ${email}`)
        break
      }

      case 'magic_link': {
        // Magic link — réutilise le template confirmation
        const lien = construireLienVerification(
          email_data.token_hash,
          'magiclink',
          email_data.redirect_to
        )
        await envoyerEmailConfirmation({ email, prenom, lienConfirmation: lien })
        console.log(`[auth-hook] Email magic_link envoyé à ${email}`)
        break
      }

      case 'email_change': {
        // Changement d'email — réutilise le template confirmation
        const lien = construireLienVerification(
          email_data.token_hash,
          'email_change',
          email_data.redirect_to
        )
        await envoyerEmailConfirmation({ email, prenom, lienConfirmation: lien })
        console.log(`[auth-hook] Email email_change envoyé à ${email}`)
        break
      }

      default:
        console.warn(`[auth-hook] Type non géré : ${email_data.email_action_type}`)
        return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[auth-hook] Erreur envoi email:', err)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
