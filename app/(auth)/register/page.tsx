'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('[register] Erreur Supabase:', error.message, error.status)

      // Messages d'erreur explicites selon le type d'erreur Supabase
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError('Cette adresse email est déjà utilisée. Essayez de vous connecter.')
      } else if (error.message.includes('valid password') || error.message.includes('at least')) {
        setError('Le mot de passe doit contenir au moins 8 caractères.')
      } else if (error.message.includes('valid email') || error.message.includes('invalid')) {
        setError('Adresse email invalide. Vérifiez le format.')
      } else if (error.message.includes('rate') || error.status === 429) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes.')
      } else if (error.message.includes('hook')) {
        setError('Erreur lors de l\'envoi de l\'email de confirmation. Veuillez réessayer.')
      } else {
        setError(`Une erreur est survenue : ${error.message}`)
      }

      setLoading(false)
      return
    }

    // Rediriger vers la page de confirmation email
    // L'email de bienvenue sera envoyé après confirmation via /auth/callback
    router.push('/register/confirm')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-musae-ink tracking-wide">
            Musae
          </Link>
          <h1 className="font-serif text-2xl text-musae-ink mt-6 mb-2">
            Bienvenue
          </h1>
          <p className="font-sans text-stone-500 text-base">
            Créez votre espace auteur gratuitement
          </p>
        </div>

        <form onSubmit={handleRegister} className="card space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-sans text-base">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block font-sans text-base font-medium text-musae-ink mb-2">
              Votre nom
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Marie Dupont"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-sans text-base font-medium text-musae-ink mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-sans text-base font-medium text-musae-ink mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="8 caractères minimum"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center font-sans text-base text-stone-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-musae-ink underline underline-offset-4 hover:text-musae-gold transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
