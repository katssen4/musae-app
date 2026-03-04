import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

function settingsRedirect(params: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/settings?${params}`, process.env.NEXT_PUBLIC_APP_URL!)
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const state = url.searchParams.get('state')

  if (error || !code) {
    return settingsRedirect('meta_error=denied')
  }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== state) {
    return settingsRedirect('meta_error=auth')
  }

  try {
    // Étape 1 : Échanger le code contre un short-lived token
    const tokenRes = await fetch(`${GRAPH_BASE}/oauth/access_token?` + new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
      code,
    }))
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Meta token exchange failed:', tokenData)
      return settingsRedirect('meta_error=exchange')
    }

    // Étape 2 : Échanger contre un long-lived token (60 jours)
    const longTokenRes = await fetch(`${GRAPH_BASE}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: tokenData.access_token,
    }))
    const longTokenData = await longTokenRes.json()
    const longLivedUserToken = longTokenData.access_token

    if (!longLivedUserToken) {
      console.error('Meta long-lived token exchange failed:', longTokenData)
      return settingsRedirect('meta_error=exchange')
    }

    // Étape 3 : Récupérer les Pages de l'utilisateur
    const pagesRes = await fetch(`${GRAPH_BASE}/me/accounts?access_token=${longLivedUserToken}`)
    const pagesData = await pagesRes.json()
    const pages = pagesData.data ?? []

    if (pages.length === 0) {
      return settingsRedirect('meta_error=no_pages')
    }

    // Prendre la première Page (la plupart des auteurs n'en ont qu'une)
    const page = pages[0]
    const pageAccessToken = page.access_token // permanent si issu de long-lived user token
    const pageId = page.id

    // Étape 4 : Vérifier le compte Instagram Business lié
    const igRes = await fetch(
      `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )
    const igData = await igRes.json()
    const instagramAccountId = igData.instagram_business_account?.id ?? null

    // Étape 5 : Supprimer les anciennes connexions et insérer les nouvelles
    await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .in('platform', ['facebook', 'instagram'])

    await supabase.from('social_connections').insert({
      user_id: user.id,
      platform: 'facebook',
      access_token: pageAccessToken,
      page_id: pageId,
      instagram_account_id: null,
      expires_at: null,
    })

    if (instagramAccountId) {
      await supabase.from('social_connections').insert({
        user_id: user.id,
        platform: 'instagram',
        access_token: pageAccessToken,
        page_id: pageId,
        instagram_account_id: instagramAccountId,
        expires_at: null,
      })
    }

    const successParam = instagramAccountId ? 'facebook_instagram' : 'facebook'
    return settingsRedirect(`meta_connected=${successParam}`)
  } catch (err) {
    console.error('Meta OAuth error:', err)
    return settingsRedirect('meta_error=exchange')
  }
}
