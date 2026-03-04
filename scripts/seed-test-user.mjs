/**
 * Crée un compte de test Musae avec le plan "musae" (abonnement actif).
 *
 * Usage : node scripts/seed-test-user.mjs
 *
 * Requiert : .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'env depuis .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erreur : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TEST_EMAIL = 'matteo@musae.io'
const TEST_PASSWORD = 'Musae2026!'
const TEST_NAME = 'Matteo Leonardi'

async function main() {
  console.log(`Création du compte test : ${TEST_EMAIL}`)

  // 1. Créer l'utilisateur (email confirmé automatiquement)
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: TEST_NAME },
  })

  if (createError) {
    if (createError.message?.includes('already been registered')) {
      console.log('Compte déjà existant, mise à jour du plan...')
      // Récupérer l'utilisateur existant
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find(u => u.email === TEST_EMAIL)
      if (existing) {
        await supabase
          .from('profiles')
          .update({ plan: 'musae' })
          .eq('id', existing.id)
        console.log(`\n✓ Plan mis à jour vers "musae" pour ${TEST_EMAIL}`)
        console.log(`  Email : ${TEST_EMAIL}`)
        console.log(`  Mot de passe : ${TEST_PASSWORD}`)
        return
      }
    }
    console.error('Erreur création :', createError.message)
    process.exit(1)
  }

  // 2. Mettre à jour le profil avec le plan musae
  const userId = user.user.id
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan: 'musae' })
    .eq('id', userId)

  if (updateError) {
    console.error('Erreur mise à jour profil :', updateError.message)
    process.exit(1)
  }

  console.log(`\n✓ Compte test créé avec succès !`)
  console.log(`  Email    : ${TEST_EMAIL}`)
  console.log(`  Password : ${TEST_PASSWORD}`)
  console.log(`  Plan     : musae (abonnement actif)`)
  console.log(`  Nom      : ${TEST_NAME}`)
}

main()
