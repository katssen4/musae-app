import Anthropic from '@anthropic-ai/sdk'
import type { Platform, PostFormat, GeneratedPost } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const VALID_PLATFORMS: Platform[] = ['facebook', 'instagram']
const VALID_FORMATS: PostFormat[] = ['quote', 'reflective', 'question', 'announcement', 'behind_scenes']

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  facebook: `Facebook (2 posts) :
- 150-300 mots. Ton intimiste et chaleureux, comme une lettre à un ami lecteur.
- STRUCTURE : accroche forte en première ligne (question, affirmation surprenante ou image sensorielle), développement en 2-3 paragraphes courts, conclusion ouverte qui invite au commentaire.
- Utiliser des sauts de ligne pour aérer. Pas d'emojis excessifs (1-2 max, subtils).
- Objectif : donner envie de lire l'extrait complet. Créer un moment d'intimité.`,
  instagram: `Instagram (2 posts) :
- 100-180 mots. Ton poétique, visuel, évocateur.
- STRUCTURE : première ligne = accroche visuelle ou émotionnelle (pas de hashtag), corps concis et rythmé, terminer par 5-8 hashtags pertinents mélangeant niche littéraire (#littératurefrançaise #écrivain) et thèmes du texte.
- Les hashtags sur une ligne séparée après un saut de ligne.
- Objectif : arrêter le scroll. Chaque mot doit porter.`,
}

// --- JSON parsing helpers ---

function extractJSON(text: string): string {
  // Try markdown fences first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  // Try to find raw JSON array
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start !== -1 && end > start) return text.slice(start, end + 1)

  return text.trim()
}

function isValidPost(obj: unknown): obj is GeneratedPost {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.platform === 'string' &&
    typeof o.format === 'string' &&
    typeof o.body === 'string' &&
    o.body.length > 0 &&
    VALID_PLATFORMS.includes(o.platform as Platform) &&
    VALID_FORMATS.includes(o.format as PostFormat)
  )
}

function parseGeneratedPosts(raw: string): GeneratedPost[] {
  const cleaned = extractJSON(raw)

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Musae n\'a pas pu interpréter la réponse de l\'IA. Veuillez réessayer.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Musae n\'a pas pu interpréter la réponse de l\'IA. Veuillez réessayer.')
  }

  const posts = parsed.filter(isValidPost)
  if (posts.length === 0) {
    throw new Error('Aucun post valide généré. Veuillez réessayer.')
  }

  return posts
}

// --- Main generation ---

interface GeneratePostsOptions {
  rawText?: string
  imageUrl?: string
  platforms: Platform[]
  authorStyle?: string
  authorName?: string
}

export async function generatePosts(options: GeneratePostsOptions): Promise<GeneratedPost[]> {
  const { rawText, imageUrl, platforms, authorStyle, authorName = 'cet auteur' } = options

  const contentDescription = rawText
    ? `Texte source :\n---\n${rawText}\n---`
    : imageUrl
      ? `Image disponible à l'URL : ${imageUrl}`
      : 'Contenu mixte (texte et image)'

  const platformInstructions = platforms
    .map((p) => PLATFORM_GUIDELINES[p])
    .join('\n\n')

  const prompt = `Tu es le directeur de communication littéraire de ${authorName}. Tu connais intimement son œuvre et tu sais transformer ses textes en publications qui captivent les lecteurs sur les réseaux sociaux.${authorStyle ? `\n\nADN LITTÉRAIRE de l'auteur : ${authorStyle}` : ''}

PHILOSOPHIE : Chaque post doit donner l'impression que l'auteur parle directement à son lecteur. Pas de ton marketing. Pas de formules creuses. L'authenticité est la meilleure stratégie d'engagement.

CONTENU SOURCE :
${contentDescription}

MISSION : Génère exactement 2 propositions de posts pour chacune de ces plateformes :

${platformInstructions}

FORMATS DISPONIBLES (choisis le plus adapté au contenu, varie entre les 2 propositions) :
- quote : mise en valeur d'une citation forte du texte, encadrée par un contexte personnel
- reflective : réflexion intime de l'auteur liée au processus d'écriture ou au thème du texte
- question : question ouverte qui engage la communauté, partant d'un élément du texte
- announcement : teaser de publication avec tension narrative
- behind_scenes : regard sur les coulisses de l'écriture, moment de vulnérabilité créative

RÈGLES ABSOLUES :
1. Jamais de "Découvrez", "N'hésitez pas", "Lien en bio" ou formules marketing.
2. Varier les formats entre les 2 propositions d'une même plateforme.
3. L'accroche (première ligne) est CRUCIALE : elle doit surprendre, émouvoir ou intriguer.
4. Le texte doit sembler écrit par un humain passionné, pas par une IA.
5. Pour Instagram, les hashtags sont sur une ligne séparée à la fin.

Réponds UNIQUEMENT avec un tableau JSON valide. Aucun texte avant, aucun texte après. Pas de blocs de code markdown.
Format exact attendu :
[{"platform":"facebook","format":"quote","body":"..."},{"platform":"instagram","format":"question","body":"..."}]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Réponse Claude inattendue')
  }

  return parseGeneratedPosts(content.text)
}
