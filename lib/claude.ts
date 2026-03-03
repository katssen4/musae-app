import Anthropic from '@anthropic-ai/sdk'
import type { Platform, PostFormat, GeneratedPost } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  facebook: '150 à 300 mots. Ton conversationnel et chaleureux. Peut inclure des paragraphes.',
  instagram: '100 à 150 mots. Ton poétique et visuel. Terminer par 3 à 5 hashtags pertinents.',
  linkedin: '200 à 400 mots. Ton professionnel et réflexif. Mettre en avant l\'expertise.',
}

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
    .map((p) => `- ${p} : ${PLATFORM_GUIDELINES[p]}`)
    .join('\n')

  const prompt = `Tu es l'assistant personnel de ${authorName}, un auteur qui communique de manière intellectuelle et artistique.${authorStyle ? `\n\nSon style littéraire : ${authorStyle}` : ''}

À partir de ce contenu :
${contentDescription}

Génère 2 propositions de posts pour chacune de ces plateformes :
${platformInstructions}

Formats disponibles : quote (citation courte), reflective (post réflexif), question (question engageante), announcement (annonce de livre), behind_scenes (coulisses de l'écriture).

Ton : authentique, littéraire, jamais commercial. La voix doit sembler naturelle et humaine.

Réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
[{ "platform": "facebook"|"instagram"|"linkedin", "format": "quote"|"reflective"|"question"|"announcement"|"behind_scenes", "body": "..." }]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Réponse Claude inattendue')
  }

  const posts = JSON.parse(content.text) as GeneratedPost[]
  return posts
}
