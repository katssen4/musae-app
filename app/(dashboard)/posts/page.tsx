export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">
          Mes publications
        </h1>
        <p className="font-sans text-base text-stone-500">
          Retrouvez ici toutes vos publications générées, programmées et publiées.
        </p>
      </div>

      {/* À implémenter Sprint 2 */}
      <div className="card text-center py-16">
        <p className="font-serif text-xl text-stone-400 mb-2">
          Aucune publication pour le moment
        </p>
        <p className="font-sans text-base text-stone-400">
          Commencez par déposer un texte sur l&apos;écran principal.
        </p>
      </div>
    </div>
  )
}
