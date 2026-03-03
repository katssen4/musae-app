import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-2xl text-musae-ink tracking-wide">Musae</span>
          <div className="flex gap-4">
            <Link href="/login" className="text-musae-ink/70 hover:text-musae-ink font-sans text-base transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-musae-ink text-musae-parchment font-sans text-base px-5 py-2 rounded-lg hover:bg-musae-ink/90 transition-colors"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-musae-ink leading-tight mb-6">
            Votre plume,<br />
            <span className="text-musae-gold">partout à la fois</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-stone-600 mb-10 leading-relaxed">
            Déposez un extrait de votre livre, Musae le transforme en publications
            authentiques pour Facebook et Instagram. Automatiquement, à votre rythme.
          </p>
          <Link
            href="/register"
            className="inline-block bg-musae-ink text-musae-parchment font-sans text-lg font-medium px-10 py-4 rounded-lg hover:bg-musae-ink/90 transition-colors"
          >
            Essayer gratuitement
          </Link>
          <p className="mt-4 font-sans text-sm text-stone-500">
            Sans carte bancaire · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center">
        <p className="font-sans text-sm text-stone-400">
          © {new Date().getFullYear()} Musae · Fait avec soin pour les auteurs
        </p>
      </footer>
    </main>
  )
}
