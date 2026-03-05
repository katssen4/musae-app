import Link from 'next/link'

// Page affichée après inscription — demande à l'utilisateur de vérifier ses emails
export default function ConfirmPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-3xl text-musae-ink tracking-wide">
          Musae
        </Link>

        <div className="card mt-10 space-y-6">
          {/* Icône enveloppe */}
          <div className="text-5xl">&#9993;</div>

          <h1 className="font-serif text-2xl text-musae-ink">
            Vérifiez votre boîte mail
          </h1>

          <p className="font-sans text-base text-stone-500 leading-relaxed">
            Nous vous avons envoyé un email de confirmation.
            Cliquez sur le lien pour activer votre compte et accéder à votre espace Musae.
          </p>

          <div className="bg-musae-gold/10 border border-musae-gold/30 rounded-lg px-4 py-3">
            <p className="font-sans text-sm text-musae-ink">
              Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
            </p>
          </div>
        </div>

        <p className="font-sans text-base text-stone-500 mt-6">
          <Link
            href="/login"
            className="text-musae-ink underline underline-offset-4 hover:text-musae-gold transition-colors"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  )
}
