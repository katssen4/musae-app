import ContentUploader from '@/components/ContentUploader'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-musae-ink mb-2">
          Créer mes publications
        </h1>
        <p className="font-sans text-base text-stone-500">
          Déposez un texte ou une image, Musae génère vos posts en quelques secondes.
        </p>
      </div>

      <ContentUploader />
    </div>
  )
}
