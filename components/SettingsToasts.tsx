'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from './Toast'

export default function SettingsToasts() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const connected = searchParams.get('meta_connected')
    const error = searchParams.get('meta_error')

    if (connected === 'facebook_instagram') {
      toast('Facebook et Instagram connectés avec succès !')
    } else if (connected === 'facebook') {
      toast('Facebook connecté avec succès !')
    }

    if (error === 'denied') toast('Connexion annulée', 'info')
    if (error === 'no_pages') toast('Aucune Page Facebook trouvée. Créez une Page avant de connecter.', 'error')
    if (error === 'exchange') toast('Erreur lors de la connexion. Veuillez réessayer.', 'error')
    if (error === 'auth') toast("Erreur d'authentification", 'error')

    if (connected || error) {
      router.replace('/dashboard/settings', { scroll: false })
    }
  }, [searchParams, toast, router])

  return null
}
