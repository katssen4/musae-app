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
      },
    })

    if (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
