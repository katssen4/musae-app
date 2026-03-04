'use client'

import { useState } from 'react'

export default function BillingActions({ action }: { action: 'checkout' | 'portal' }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const endpoint = action === 'checkout'
        ? '/api/stripe/checkout'
        : '/api/stripe/portal'

      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={action === 'checkout' ? 'btn-primary' : 'btn-secondary'}
    >
      {loading
        ? 'Redirection…'
        : action === 'checkout'
          ? "S'abonner à Musae"
          : 'Gérer mon abonnement'
      }
    </button>
  )
}
