// Sprint 3 : Client Meta Graph API
// Docs : https://developers.facebook.com/docs/graph-api

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

interface PublishOptions {
  platform: string
  body: string
  accessToken: string
  pageId?: string
  instagramAccountId?: string
  imageUrl?: string
}

export async function publishToMeta(options: PublishOptions): Promise<string> {
  const { platform, body, accessToken, pageId, instagramAccountId, imageUrl } = options

  if (platform === 'facebook') {
    return publishToFacebook({ body, accessToken, pageId: pageId!, imageUrl })
  }

  if (platform === 'instagram') {
    return publishToInstagram({ body, accessToken, instagramAccountId: instagramAccountId!, imageUrl })
  }

  throw new Error(`Plateforme non supportée : ${platform}`)
}

async function publishToFacebook(options: {
  body: string
  accessToken: string
  pageId: string
  imageUrl?: string
}): Promise<string> {
  const { body, accessToken, pageId, imageUrl } = options

  const payload: Record<string, string> = {
    message: body,
    access_token: accessToken,
  }

  if (imageUrl) {
    payload.link = imageUrl
  }

  const res = await fetch(`${GRAPH_BASE_URL}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Meta API error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return data.id as string
}

async function publishToInstagram(options: {
  body: string
  accessToken: string
  instagramAccountId: string
  imageUrl?: string
}): Promise<string> {
  const { body, accessToken, instagramAccountId, imageUrl } = options

  // Instagram nécessite une image pour publier
  // Sans image, on utilise une image par défaut (à configurer)
  const mediaImageUrl = imageUrl ?? process.env.INSTAGRAM_DEFAULT_IMAGE_URL

  if (!mediaImageUrl) {
    throw new Error('Instagram nécessite une image pour publier')
  }

  // Étape 1 : créer le média container
  const containerRes = await fetch(`${GRAPH_BASE_URL}/${instagramAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: mediaImageUrl,
      caption: body,
      access_token: accessToken,
    }),
  })

  if (!containerRes.ok) {
    const err = await containerRes.json()
    throw new Error(`Meta API error (container): ${JSON.stringify(err)}`)
  }

  const { id: containerId } = await containerRes.json()

  // Étape 2 : publier le média container
  const publishRes = await fetch(`${GRAPH_BASE_URL}/${instagramAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  })

  if (!publishRes.ok) {
    const err = await publishRes.json()
    throw new Error(`Meta API error (publish): ${JSON.stringify(err)}`)
  }

  const { id } = await publishRes.json()
  return id as string
}
