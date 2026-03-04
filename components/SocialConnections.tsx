'use client'

import { useState } from 'react'
import type { SocialConnection } from '@/types'
import { useToast } from './Toast'

export default function SocialConnections({ connections: initial }: { connections: SocialConnection[] }) {
  const [connections, setConnections] = useState(initial)
  const [disconnecting, setDisconnecting] = useState(false)
  const { toast } = useToast()

  const fbConnection = connections.find(c => c.platform === 'facebook')
  const igConnection = connections.find(c => c.platform === 'instagram')
  const isConnected = fbConnection || igConnection

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/auth/meta/disconnect', { method: 'POST' })
      if (res.ok) {
        setConnections([])
        toast('Comptes déconnectés')
      }
    } catch {
      toast('Erreur lors de la déconnexion', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {fbConnection && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-musae-sage/10 px-3 py-1 font-sans text-sm font-medium text-musae-sage">
                Connecté
              </span>
              <span className="font-sans text-base text-musae-ink">Facebook</span>
            </div>
          )}
          {igConnection && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-musae-sage/10 px-3 py-1 font-sans text-sm font-medium text-musae-sage">
                Connecté
              </span>
              <span className="font-sans text-base text-musae-ink">Instagram</span>
            </div>
          )}
          {!igConnection && fbConnection && (
            <p className="font-sans text-sm text-stone-400">
              Instagram non disponible. Vérifiez que votre Page Facebook est liée à un compte Instagram professionnel.
            </p>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="font-sans text-sm text-red-500 hover:text-red-700 underline-offset-4 hover:underline transition-colors cursor-pointer"
        >
          {disconnecting ? 'Déconnexion…' : 'Déconnecter mes comptes'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-sans text-base text-stone-500">
        Connectez votre Page Facebook pour publier directement depuis Musae.
        Si votre Page est liée à un compte Instagram professionnel, il sera connecté automatiquement.
      </p>
      <a href="/api/auth/meta" className="btn-secondary inline-block text-center">
        Connecter Facebook & Instagram
      </a>
    </div>
  )
}
