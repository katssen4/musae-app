# MUSAE — Architecture technique MVP
## Document de référence pour Claude Code

---

## Vision produit

Musae est un micro-SaaS qui permet à des auteurs indépendants (35-80 ans, peu technophiles) de maintenir une présence automatique sur Facebook et Instagram à partir de leurs textes et extraits de livres.

**Principe core :**
1. L'auteur dépose un texte ou une image
2. L'IA génère plusieurs propositions de posts adaptées à chaque réseau
3. L'auteur choisit ou laisse Musae publier automatiquement selon un planning

---

## Stack technique retenue

### Frontend
- **Framework :** Next.js 14 (App Router)
- **Styling :** Tailwind CSS
- **Hébergement :** Vercel (déploiement automatique depuis GitHub)
- **Fonts :** Cormorant Garamond + Jost (Google Fonts)

### Backend
- **API Routes :** Next.js API Routes (intégrées, pas de serveur séparé)
- **Base de données :** Supabase (PostgreSQL managé, gratuit jusqu'à 500MB)
- **Auth :** Supabase Auth (email/password, simple)
- **Fichiers :** Supabase Storage (pour les images de couverture)

### IA
- **Modèle :** Claude API (claude-sonnet-4-20250514)
- **Usage :** Génération des posts sociaux à partir du contenu auteur

### Paiement
- **Provider :** Stripe (abonnements récurrents)
- **Plans :** Essentiel 20€/mois — Auteur 35€/mois

### Scheduling & Publication
- **Queue :** Vercel Cron Jobs (simple, intégré)
- **Publication Facebook/Instagram :** Meta Graph API

---

## Structure des dossiers

```
musae/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Écran principal (upload + génération)
│   │   ├── posts/page.tsx            # Posts générés + planning
│   │   └── settings/page.tsx         # Connexion réseaux sociaux + planning
│   ├── api/
│   │   ├── generate/route.ts         # Appel Claude API → génération posts
│   │   ├── publish/route.ts          # Publication Meta Graph API
│   │   ├── schedule/route.ts         # Gestion du planning
│   │   └── stripe/webhook/route.ts   # Webhooks Stripe
│   ├── layout.tsx
│   └── page.tsx                      # Landing page publique
├── components/
│   ├── ui/                           # Composants réutilisables
│   ├── ContentUploader.tsx           # Zone dépôt texte/image
│   ├── PostPreview.tsx               # Aperçu d'un post généré
│   ├── PostSelector.tsx              # Sélection parmi les propositions
│   └── ScheduleConfig.tsx            # Configuration du planning
├── lib/
│   ├── claude.ts                     # Client Claude API
│   ├── meta.ts                       # Client Meta Graph API
│   ├── supabase.ts                   # Client Supabase
│   └── stripe.ts                     # Client Stripe
├── types/
│   └── index.ts                      # Types TypeScript partagés
└── public/
    └── (assets statiques)
```

---

## Schéma base de données (Supabase)

```sql
-- Utilisateurs (géré par Supabase Auth)
-- La table auth.users est automatique

-- Profils auteurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  author_style TEXT,          -- Description du style littéraire pour le prompt IA
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',   -- 'free' | 'essential' | 'author'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connexions réseaux sociaux
CREATE TABLE social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,     -- 'facebook' | 'instagram' | 'linkedin'
  access_token TEXT NOT NULL,
  page_id TEXT,               -- Pour Facebook Pages
  instagram_account_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenus source uploadés par l'auteur
CREATE TABLE contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,         -- 'text' | 'image' | 'mixed'
  raw_text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts générés par l'IA
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id),
  platform TEXT NOT NULL,     -- 'facebook' | 'instagram' | 'linkedin'
  format TEXT NOT NULL,       -- 'quote' | 'reflective' | 'question' | 'announcement' | 'behind_scenes'
  body TEXT NOT NULL,         -- Texte du post
  status TEXT DEFAULT 'draft', -- 'draft' | 'approved' | 'scheduled' | 'published' | 'failed'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  meta_post_id TEXT,          -- ID retourné par Meta après publication
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration du planning de publication
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  frequency TEXT NOT NULL,    -- 'daily' | '3x_week' | 'weekly'
  preferred_time TIME NOT NULL DEFAULT '09:00',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Routes — Détail

### POST /api/generate

**Rôle :** Appeler Claude pour générer des posts à partir du contenu auteur

```typescript
// Entrée
{
  contentId: string,
  rawText?: string,
  imageUrl?: string,
  platforms: ('facebook' | 'instagram' | 'linkedin')[],
  authorStyle?: string  // récupéré depuis profiles.author_style
}

// Sortie
{
  posts: {
    platform: string,
    format: string,
    body: string
  }[]
}
```

**Prompt Claude (exemple) :**
```
Tu es l'assistant personnel de {authorName}, un auteur qui communique de manière 
intellectuelle et artistique. Son style : {authorStyle}.

À partir de ce contenu :
---
{rawText}
---

Génère {N} propositions de posts pour {platform}. 
Formats possibles : citation courte, post réflexif, question engageante, 
annonce de livre, coulisses de l'écriture.

Ton : authentique, littéraire, jamais commercial.
Longueur : adaptée à {platform} (Facebook : 150-300 mots, Instagram : 100-150 mots).

Réponds en JSON :
[{ "format": "...", "body": "..." }]
```

---

### POST /api/publish

**Rôle :** Publier un post sur Meta via Graph API

```typescript
// Entrée
{ postId: string }

// Logique
// 1. Récupérer le post depuis Supabase
// 2. Récupérer le token Meta de l'utilisateur
// 3. Appeler Meta Graph API
// 4. Mettre à jour post.status = 'published' + post.meta_post_id
```

---

### GET /api/schedule (Vercel Cron)

**Rôle :** Publier automatiquement les posts planifiés

```typescript
// Tournera toutes les heures via Vercel Cron
// 1. Récupérer tous les posts WHERE status = 'scheduled' AND scheduled_at <= NOW()
// 2. Pour chaque post → appeler /api/publish
// 3. Gérer les erreurs et retries
```

**vercel.json :**
```json
{
  "crons": [
    {
      "path": "/api/schedule",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Écran principal — UX (priorité absolue)

```
┌─────────────────────────────────────────────────────┐
│  MUSAE                                    [Settings] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Déposez votre texte ou glissez une image   │   │
│  │                                             │   │
│  │  [Zone textarea + drop image]               │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [✦ Générer mes publications]                       │
│                                                     │
│  ──────────────────────────────────────────────    │
│                                                     │
│  FACEBOOK          INSTAGRAM                        │
│  ┌──────────┐      ┌──────────┐                    │
│  │ Post 1   │      │ Post 1   │                    │
│  │ [Choisir]│      │ [Choisir]│                    │
│  ├──────────┤      ├──────────┤                    │
│  │ Post 2   │      │ Post 2   │                    │
│  │ [Choisir]│      │ [Choisir]│                    │
│  └──────────┘      └──────────┘                    │
│                                                     │
│  [Publier maintenant]  [Programmer automatiquement] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Règles UX critiques :**
- Maximum 2 clics pour publier
- Aucun jargon technique visible
- Pas de configuration visible sur l'écran principal
- Textes d'interface en français simple
- Boutons larges (accessibilité 35-80 ans)
- Taille de police minimum 16px

---

## Variables d'environnement (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ESSENTIAL=     # ID du prix Stripe 20€/mois
STRIPE_PRICE_AUTHOR=        # ID du prix Stripe 35€/mois

# Meta (Facebook + Instagram)
META_APP_ID=
META_APP_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://musae.io
CRON_SECRET=                # Token pour sécuriser le cron job
```

---

## Ordre de développement recommandé

### Sprint 1 — Fondations (semaine 1)
1. Init projet Next.js + Tailwind + Supabase
2. Auth (inscription / connexion email)
3. Schéma base de données
4. Layout dashboard de base

### Sprint 2 — Core feature (semaine 2)
5. Composant upload texte/image
6. Intégration Claude API → génération posts
7. Affichage des propositions générées
8. Sauvegarde en base

### Sprint 3 — Publication (semaine 3)
9. OAuth Meta (connexion compte Facebook/Instagram)
10. Publication manuelle via Meta Graph API
11. Vérification sur compte test Meta

### Sprint 4 — Automatisation (semaine 4)
12. Interface configuration planning
13. Cron job Vercel
14. Publication automatique

### Sprint 5 — Monétisation (semaine 5)
15. Intégration Stripe
16. Pages pricing + checkout
17. Webhooks abonnement
18. Gating des features par plan

### Sprint 6 — Polish (semaine 6)
19. Onboarding auteur (style, préférences)
20. Gestion des erreurs
21. Tests sur vrais comptes
22. Déploiement production musae.io

---

## Points d'attention critiques

### Meta API — le point le plus risqué
- Créer une Meta App sur developers.facebook.com
- Demander les permissions : `pages_manage_posts`, `instagram_content_publish`
- Le processus de review Meta peut prendre 1-4 semaines
- **Commencer cette démarche dès le Sprint 1, en parallèle**
- Pour les tests : utiliser un compte Facebook de test (sandbox Meta)

### Sécurité tokens OAuth
- Chiffrer les access_tokens Meta en base (ne jamais stocker en clair)
- Gérer le refresh des tokens (Meta tokens expirent)
- Utiliser Supabase RLS (Row Level Security) sur toutes les tables

### Simplicité UX — règle absolue
- Avant de coder une feature : se demander "un auteur de 65 ans peut-il l'utiliser sans aide ?"
- Pas de modales complexes
- Pas de formulaires multi-étapes
- Toujours un seul appel à l'action principal par écran
