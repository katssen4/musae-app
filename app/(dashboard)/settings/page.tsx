export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">
          Réglages
        </h1>
        <p className="font-sans text-base text-stone-500">
          Connectez vos réseaux sociaux et configurez votre planning de publication.
        </p>
      </div>

      {/* Connexion réseaux sociaux — Sprint 3 */}
      <section className="card space-y-4">
        <h2 className="font-serif text-xl text-musae-ink">Réseaux sociaux</h2>
        <p className="font-sans text-base text-stone-500">
          La connexion à Facebook et Instagram sera disponible prochainement.
        </p>
      </section>

      {/* Planning — Sprint 4 */}
      <section className="card space-y-4">
        <h2 className="font-serif text-xl text-musae-ink">Planning de publication</h2>
        <p className="font-sans text-base text-stone-500">
          La configuration du planning sera disponible prochainement.
        </p>
      </section>
    </div>
  )
}
