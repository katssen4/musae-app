'use client'

import { useState } from 'react'

// Sprint 2 : sera connecté à /api/generate
export default function ContentUploader() {
  const [text, setText] = useState('')

  return (
    <div className="space-y-6">
      {/* Zone de dépôt */}
      <div className="card">
        <label htmlFor="content" className="block font-sans text-base font-medium text-musae-ink mb-3">
          Votre texte ou extrait
        </label>
        <textarea
          id="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[180px] resize-none"
          placeholder="Collez ici un extrait de votre livre, une pensée, une citation… Musae s'occupe du reste."
          rows={6}
        />
      </div>

      {/* Bouton principal */}
      <button
        className="btn-primary"
        disabled={!text.trim()}
        onClick={() => {
          // Sprint 2 : appel à /api/generate
          console.log('Génération en cours…', text)
        }}
      >
        ✦ Générer mes publications
      </button>
    </div>
  )
}
